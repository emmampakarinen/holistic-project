import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to charger details page
    navigate("/charger/1");
  }, [navigate]);

  return null;
};

export default Index;
