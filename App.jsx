import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import HomePage from "./pages/HomePage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import CreateReport from "./pages/CreateReport"
import Admin from "./pages/Admin"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"

function AppRoutes() {
  const { user } = useAuth()

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            user ? <Navigate to="/home" /> : <Home />
          } />

          <Route path="/home" element={
            user ? <HomePage /> : <Navigate to="/login" />
          } />

          <Route path="/dashboard" element={
            user ? <Dashboard /> : <Navigate to="/login" />
          } />

          <Route path="/create" element={
            <ProtectedRoute>
              <CreateReport />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
