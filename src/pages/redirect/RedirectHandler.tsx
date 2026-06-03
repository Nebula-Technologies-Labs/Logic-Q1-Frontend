import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/");
    }
  }, [location.search, navigate]);

  return (
    <div className="flex items-center justify-center">
      Login In to Logiq1 Dashboard
    </div>
  );
};

export default RedirectHandler;
