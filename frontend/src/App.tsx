import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import Layout from "@/components/layout/Layout"
import Home from "@/pages/Home"
import Tickets from "@/pages/Tickets"
import Knowledge from "@/pages/Knowledge"
import Users from "@/pages/Users"
import Profile from "@/pages/Profile"
import Login from "@/pages/Login"
import Register from "@/pages/Register"

function ProtectedLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Layout />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth pages — full-screen, no navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected app — redirects to /login if not authenticated */}
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Home />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="users" element={<Users />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
