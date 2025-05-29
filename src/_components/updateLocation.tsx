import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateLocationRequest } from 'src/_functions/serverRequest';
import { updateNavbar } from 'src/_components/Navbar';
import TemplateProvider from 'src/_components/templateProvider'

export default function UpdateLocation() {
  const location = useLocation();
  
  useEffect(() => {
    //* when the user changes the url, update the location in the users session data
    const searchParams: Record<string, string> = {};
    for (const [key, value] of new URLSearchParams(location.search)) {
      searchParams[key] = value;
    }
    const locationObj = {
      pathName: location.pathname,
      searchParams
    }

    void updateLocationRequest({ location: locationObj })
    updateNavbar();
  }, [location]);

  //* Outlet is all the child components in the browser router
  return (
    <TemplateProvider>
      <Outlet />
    </TemplateProvider>
  );
}