import { sessionLayout } from "config";
import { useLocation, useNavigate } from "react-router-dom";
import middlewareHandler from "src/_functions/middlewareHandler";
import { apiRequest } from "src/_functions/serverRequest";

export default function initializeRouter() {
  const navigateHandler = useNavigate();
  const location = useLocation();

  const navigate = async (path: string) => {
    const params = new URLSearchParams(location.search);
    const queryObject: Record<string, string> = {};

    params.forEach((value, key) => {
      queryObject[key] = value;
    });

    const session = await apiRequest({ name: 'session' }) as sessionLayout;
    const result = middlewareHandler({ location: path, searchParams: queryObject, session }) as { success: boolean, redirect: string } | undefined;

    if (result?.success) {
      return navigateHandler(path);
    } else if (result?.redirect) {
      return navigateHandler(result.redirect);
    } else {
      // return navigateHandler(-1);
      return
    }
  }

  return navigate
}