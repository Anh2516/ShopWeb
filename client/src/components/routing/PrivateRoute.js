import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowAdmin = true }) => {
  const { isAuthenticated, user, token, loading } = useSelector(
    (state) => state.auth
  );

  const hasToken = token || localStorage.getItem("token");

  if (hasToken && (loading || !isAuthenticated)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        Đang tải...
      </div>
    );
  }

  if (!hasToken || (!loading && !isAuthenticated)) {
    return <Navigate to="/login" />;
  }

  if (!allowAdmin && user?.role === "admin") {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default PrivateRoute;
