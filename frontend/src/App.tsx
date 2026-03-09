import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplicationForm from "./pages/ApplicationForm";
import Assessment from "./pages/Assessment";
import AdminDashboard from "./pages/AdminDashboard";

/**
 * Simple auth helper — reads the stored user from localStorage.
 */
function getUser(): { id: string; role: string; token: string } | null {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

/**
 * Public route guard: redirects authenticated users to their dashboard.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = getUser();
  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/apply" replace />;
  }
  return <>{children}</>;
}

/**
 * Route guard: redirects to /login if not authenticated.
 */
function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    // If user is logged in but role doesn't match, redirect them to their rightful dashboard
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/apply" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const user = getUser();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Candidate routes */}
      <Route
        path="/apply"
        element={
          <ProtectedRoute role="candidate">
            <ApplicationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment"
        element={
          <ProtectedRoute role="candidate">
            <Assessment />
          </ProtectedRoute>
        }
      />

      {/* Admin route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="*"
        element={
          user ? (
            user.role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/apply" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
