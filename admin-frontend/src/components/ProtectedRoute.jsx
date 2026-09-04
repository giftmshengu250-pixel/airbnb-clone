import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Only lets logged-in admins/hosts see the wrapped page.
// Ensures only logged-in users can access the admin dashboard (per brief).
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
