"""
Shared IT-ticket dataset loader.

Downloads KameronB/synthetic-it-callcenter-tickets on first run,
caches to  backend/data/tickets.parquet,
and returns an in-memory pandas DataFrame on all subsequent calls.

Usage:
    from app.data.dataset import get_df, preload

    df = get_df()          # blocks until ready (fast after first run)
    preload()              # call at startup — warms cache in a background thread
"""

from __future__ import annotations

import logging
import math
import threading
import urllib3
from pathlib import Path
from typing import Optional

import pandas as pd
import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────
HF_API     = "https://datasets-server.huggingface.co/rows"
DATASET    = "KameronB/synthetic-it-callcenter-tickets"
TOTAL_ROWS = 27_602
PAGE_SIZE  = 100

# backend/data/tickets.parquet  (two levels up from backend/app/data/)
CACHE_PATH = Path(__file__).resolve().parents[2] / "data" / "tickets.parquet"

# ── Module-level singleton ────────────────────────────────────────────────────
_df:   Optional[pd.DataFrame] = None
_lock: threading.Lock         = threading.Lock()


# ── Internal helpers ──────────────────────────────────────────────────────────

def _get_parquet_urls() -> list[str]:
    """Ask the HF Datasets Server for direct CDN parquet shard URLs."""
    try:
        r = requests.get(
            "https://datasets-server.huggingface.co/parquet",
            params={"dataset": DATASET},
            timeout=30,
            verify=False,
        )
        if r.ok:
            data = r.json()
            urls = [
                f["url"]
                for f in data.get("parquet_files", [])
                if f.get("split") == "train"
            ]
            if urls:
                logger.info("Got %d parquet shard URL(s) from HF", len(urls))
                return urls
        logger.warning("Could not get parquet URLs (%s): %s", r.status_code, r.text[:120])
    except requests.RequestException as exc:
        logger.warning("Parquet URL request failed: %s", exc)
    return []


def _download_parquet_shards(urls: list[str]) -> pd.DataFrame:
    """Download each parquet shard directly from CDN and concatenate."""
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    frames: list[pd.DataFrame] = []
    for i, url in enumerate(urls, 1):
        logger.info("Downloading shard %d/%d: %s", i, len(urls), url)
        try:
            r = requests.get(url, timeout=120, verify=False, stream=True)
            r.raise_for_status()
            import io
            frames.append(pd.read_parquet(io.BytesIO(r.content)))
            logger.info("  Shard %d: %d rows", i, len(frames[-1]))
        except Exception as exc:
            logger.error("Failed to download shard %d: %s", i, exc)
    if not frames:
        return pd.DataFrame()
    df = pd.concat(frames, ignore_index=True)
    df.to_parquet(CACHE_PATH, index=False)
    logger.info("Dataset cached → %s  (%d rows, %d cols)", CACHE_PATH, len(df), len(df.columns))
    return df


def _hf_get(offset: int, length: int) -> list[dict]:
    """Fetch one page of rows from the HF Datasets Server API (fallback)."""
    for config in ("default", None):
        params: dict = {
            "dataset": DATASET,
            "split":   "train",
            "offset":  offset,
            "length":  length,
        }
        if config:
            params["config"] = config
        try:
            r = requests.get(HF_API, params=params, timeout=30, verify=False)
            if r.ok:
                return r.json().get("rows", [])
            logger.warning("HF API %s at offset %d: %s", r.status_code, offset, r.text[:120])
        except requests.RequestException as exc:
            logger.warning("HF API request error at offset %d: %s", offset, exc)
    return []


def _download() -> pd.DataFrame:
    """Download the full dataset and persist as parquet. Called at most once.

    Strategy:
      1. Try direct parquet CDN shards (one download per shard, no pagination).
      2. Fall back to paginated HF Datasets Server API with checkpoint-resume,
         saving progress every SAVE_EVERY rows so a proxy interruption does not
         require starting from scratch.
    """
    SAVE_EVERY = 500   # checkpoint frequency (rows)
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    logger.info("Downloading '%s' (%d rows) — this runs once…", DATASET, TOTAL_ROWS)

    # --- Strategy 1: direct parquet shards ---
    urls = _get_parquet_urls()
    if urls:
        df = _download_parquet_shards(urls)
        if len(df) > 0:
            return df
        logger.warning("Parquet shard download yielded 0 rows — falling back to row API")

    # --- Strategy 2: resumable paginated API ---
    logger.info("Using paginated HF API with checkpoint-resume…")

    # Load any partial progress already on disk
    rows: list[dict] = []
    if CACHE_PATH.exists():
        try:
            existing = pd.read_parquet(CACHE_PATH)
            rows = existing.to_dict("records")
            logger.info("Resuming from checkpoint: %d rows already downloaded", len(rows))
        except Exception as exc:
            logger.warning("Could not read checkpoint (%s) — starting fresh", exc)

    offset = len(rows)  # start from where we left off

    while offset < TOTAL_ROWS:
        batch_size = min(PAGE_SIZE, TOTAL_ROWS - offset)
        batch = _hf_get(offset, batch_size)
        if not batch:
            logger.warning("Empty batch at offset %d — will retry on next run", offset)
            break
        rows.extend(item["row"] for item in batch)
        offset += len(batch)

        # Save checkpoint periodically
        if offset % SAVE_EVERY == 0 or offset >= TOTAL_ROWS:
            pd.DataFrame(rows).reset_index(drop=True).to_parquet(CACHE_PATH, index=False)
            logger.info("  … %d / %d rows (checkpoint saved)", offset, TOTAL_ROWS)

    df = pd.DataFrame(rows).reset_index(drop=True)
    df.to_parquet(CACHE_PATH, index=False)
    logger.info("Dataset cached → %s  (%d rows, %d cols)", CACHE_PATH, len(df), len(df.columns))
    return df


# ── Public API ────────────────────────────────────────────────────────────────

def get_df() -> pd.DataFrame:
    """
    Return the dataset DataFrame.
    Loads from parquet cache if available, otherwise downloads from HuggingFace.
    Thread-safe; blocks until data is ready.
    """
    global _df
    if _df is not None:
        return _df
    with _lock:
        if _df is not None:          # re-check after acquiring lock
            return _df
        if CACHE_PATH.exists():
            logger.info("Loading dataset from cache: %s", CACHE_PATH)
            try:
                _df = pd.read_parquet(CACHE_PATH)
                logger.info("Dataset loaded (%d rows)", len(_df))
                if len(_df) < TOTAL_ROWS * 0.95:  # less than 95% of expected rows → partial
                    logger.warning(
                        "Cache has only %d/%d rows — resuming download…",
                        len(_df), TOTAL_ROWS,
                    )
                    _df = _download()   # _download() will resume from current checkpoint
            except Exception as exc:
                logger.warning("Cache read failed (%s), re-downloading…", exc)
                _df = _download()
        else:
            _df = _download()
    return _df


def preload() -> None:
    """
    Warm the dataset cache in a background thread.
    Call this once at application startup so the first HTTP request is fast.
    """
    def _run() -> None:
        try:
            df = get_df()
            logger.info("Ticket dataset ready: %d rows", len(df))
        except Exception as exc:
            logger.error("Dataset preload failed: %s", exc)

    threading.Thread(target=_run, daemon=True, name="dataset-preload").start()
