import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    if (token) {
      localStorage.setItem("token", token);
      if (name || email) {
        localStorage.setItem("user_info", JSON.stringify({ name: name || email?.split("@")[0] || "User", email: email || "" }));
      }
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
