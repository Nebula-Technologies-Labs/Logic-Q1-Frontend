import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RedirectHandler = () => {

  const navigate = useNavigate();
  useEffect(() => {
    const params =
        new URLSearchParams(
            window.location.search
        );
    const token =
        params.get("token");
    if (token) {
      localStorage.setItem(
          "token",
          token
      );
      navigate("/dashboard");
      return;
    }
    navigate("/login");
  }, []);

  return (
    <div className="flex items-center justify-center">
      Login In to Logiq1 Dashboard
    </div>
  );
};

export default RedirectHandler;
