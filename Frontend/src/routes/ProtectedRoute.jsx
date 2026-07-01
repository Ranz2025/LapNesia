import { Navigate } from "react-router-dom";
import { getUser, getToken } from "../services/authService";

function ProtectedRoute({ children, requiredRoles }) {
  const token = getToken() || sessionStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles) {
    const user = getUser() || JSON.parse(sessionStorage.getItem("user") || "null");
    const userRole = String(user?.role || "").toLowerCase();
    const normalizedRequired = requiredRoles.map((r) => String(r).toLowerCase());

    // Owner can access admin routes
    const allowedRoles = normalizedRequired.includes("admin") && userRole === "owner"
      ? [...normalizedRequired, "owner"]
      : normalizedRequired;

    if (!user || !allowedRoles.includes(userRole)) {
      // User is authenticated but wrong role — redirect to their home, not login
      const roleHome = {
        seller: "/seller/dashboard",
        technician: "/technician/dashboard",
        admin: "/admin/dashboard",
        owner: "/owner/dashboard",
      };
      return <Navigate to={roleHome[userRole] || "/"} />;
    }
  }

  return children;
}

export default ProtectedRoute;
