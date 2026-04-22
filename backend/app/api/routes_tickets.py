"""
Ticket routes — served entirely from the locally cached DataFrame.
No external calls at request-time; fast pagination and filtering.
"""

from __future__ import annotations

import logging
import math
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.data.dataset import get_df, DATASET

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tickets", tags=["Tickets"])

_CAT_COLORS = [
    "bg-violet-500", "bg-orange-500", "bg-blue-500",
    "bg-emerald-500", "bg-rose-500",  "bg-amber-500",
    "bg-teal-500",   "bg-cyan-500",   "bg-pink-500",
]


class Ticket(BaseModel):
    row_idx: int
    number: str
    type: str
    category: str
    subcategory: str
    short_description: str
    content: str
    close_notes: str
    system: str
    issue_type: str
    agent: str
    resolution_time: Optional[float]
    date: str
    resolved_at: str
    status: str  # "open" | "resolved"


class TicketsResponse(BaseModel):
    tickets: list[Ticket]
    total: int
    offset: int
    length: int


class FiltersResponse(BaseModel):
    categories: list[str]
    types: list[str]


class CategoryStat(BaseModel):
    label: str
    count: int
    pct: float
    color: str


class DashboardStats(BaseModel):
    total: int
    open: int
    resolved: int
    categories: list[CategoryStat]


def _clean(val) -> str:
    s = str(val) if val is not None else ""
    return "" if s.strip().lower() in ("nan", "none", "nat", "") else s.strip()


def _to_float(val) -> Optional[float]:
    try:
        f = float(val)
        return None if math.isnan(f) else f
    except (TypeError, ValueError):
        return None


def _row_to_ticket(df_idx: int, row: dict) -> Ticket:
    resolved_at = _clean(row.get("resolved_at"))
    return Ticket(
        row_idx=df_idx,
        number=_clean(row.get("number")),
        type=_clean(row.get("type")),
        category=_clean(row.get("category")),
        subcategory=_clean(row.get("subcategory")),
        short_description=_clean(row.get("short_description")),
        content=_clean(row.get("content")),
        close_notes=_clean(row.get("close_notes")),
        system=_clean(row.get("software/system")),
        issue_type=_clean(row.get("issue/request")),
        agent=_clean(row.get("agent")),
        resolution_time=_to_float(row.get("resolution_time")),
        date=_clean(row.get("date")),
        resolved_at=resolved_at,
        status="resolved" if resolved_at else "open",
    )


def _filter_df(
    df: pd.DataFrame,
    category: Optional[str],
    ticket_type: Optional[str],
    status: Optional[str] = None,
    search: Optional[str] = None,
) -> pd.DataFrame:
    if category:
        df = df[df["category"].str.lower() == category.lower()]
    if ticket_type:
        df = df[df["type"].str.lower() == ticket_type.lower()]
    if status == "resolved":
        df = df[df["resolved_at"].fillna("").apply(lambda x: _clean(x) != "")]
    elif status == "open":
        df = df[df["resolved_at"].fillna("").apply(lambda x: _clean(x) == "")]
    if search:
        q = search.lower()
        mask = (
            df["number"].fillna("").str.lower().str.contains(q, regex=False)
            | df["short_description"].fillna("").str.lower().str.contains(q, regex=False)
            | df["content"].fillna("").str.lower().str.contains(q, regex=False)
        )
        df = df[mask]
    return df


@router.get("/dashboard", response_model=DashboardStats)
def dashboard_stats():
    df = get_df()
    total = len(df)
    resolved = int(df["close_notes"].fillna("").apply(lambda x: _clean(x) != "").sum())
    open_count = total - resolved
    cat_series = (
        df["category"].fillna("").apply(lambda x: str(x).strip().title() if _clean(x) else None).dropna()
    )
    cat_counts = cat_series.value_counts()
    categories = [
        CategoryStat(label=label, count=int(count), pct=round(count / total * 100, 1), color=_CAT_COLORS[i % len(_CAT_COLORS)])
        for i, (label, count) in enumerate(cat_counts.items())
    ]
    return DashboardStats(total=total, open=open_count, resolved=resolved, categories=categories)


@router.get("/filters", response_model=FiltersResponse)
def get_filters():
    df = get_df()
    cats = sorted({str(c).strip().title() for c in df["category"].dropna().unique() if _clean(c)})
    types = sorted({str(t).strip() for t in df["type"].dropna().unique() if _clean(t)})
    return FiltersResponse(categories=cats, types=types)


@router.get("/", response_model=TicketsResponse)
def list_tickets(
    offset: int = Query(0, ge=0),
    length: int = Query(50, ge=1, le=100),
    category: Optional[str] = Query(None),
    ticket_type: Optional[str] = Query(None, alias="type"),
    status: Optional[str] = Query(None, pattern="^(open|resolved)$"),
    search: Optional[str] = Query(None, max_length=200),
):
    df = _filter_df(get_df(), category, ticket_type, status, search)
    page_df = df.iloc[offset: offset + length]
    tickets = [_row_to_ticket(int(idx), row.to_dict()) for idx, row in page_df.iterrows()]
    return TicketsResponse(tickets=tickets, total=len(df), offset=offset, length=len(tickets))


@router.get("/stats")
def ticket_stats():
    df = get_df()
    return {"total": len(df), "dataset": DATASET}
