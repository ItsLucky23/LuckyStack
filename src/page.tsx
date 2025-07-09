import config, { sessionLayout } from "../config";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "./_functions/serverRequest";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract query parameters into an object
    const params = new URLSearchParams(location.search);
    const queryObject: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
      queryObject[key] = value;
    }

    // Continue with session check
    (async () => {

      if (queryObject.token) {
        sessionStorage.setItem('token', queryObject.token);
        // window.location.reload();
        window.location.href = window.location.pathname;
      }

      const response = await apiRequest({ name: 'session' }) as sessionLayout;
      if (response.id) {
        navigate(config.loginRedirectUrl);
      } else {
        navigate(config.loginPageUrl);
      }
    })();
  }, [navigate, location]);

  return null;
}

export default App;