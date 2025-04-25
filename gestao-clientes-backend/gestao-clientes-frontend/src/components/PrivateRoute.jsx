import { Navigate } from "react-router-dom";

export function PrivateRoute({ children, roles }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/negado" />;
  }

  return children;
}
