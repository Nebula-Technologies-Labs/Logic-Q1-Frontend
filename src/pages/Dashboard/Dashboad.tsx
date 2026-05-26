import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboad = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(localStorage.getItem("token") ? true : false);

  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
    }
  }, [authenticated, navigate]);

  return (
    <div>
      <div>Logiq1 Dashboard</div>
      <div>User token: {localStorage.getItem("token")}</div>
    </div>
  );
};

export default Dashboad;
