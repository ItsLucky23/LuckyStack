import config, { sessionLayout } from "../config";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "./_functions/serverRequest";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const response = await apiRequest({ name: 'session' }) as sessionLayout;
      if (response.id) {
        navigate(config.loginRedirectUrl);
      } else {
        navigate(config.loginPageUrl);
      }
    })()
  }, [navigate]);

  return null;
}

export default App;