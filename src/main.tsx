import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import 'src/index.css'
import { loadClientSyncFunctions } from 'src/_functions/serverRequest'
import VConsole from 'vconsole';
import { dev } from '../config'
import UpdateLocation from 'src/_components/updateLocation'

const getRoutes = (pages: Record<string, { default: React.ComponentType }>) => {
  const routes = [];
  for (const [path, module] of Object.entries(pages)) {

    // makes it so folders that start with _ don't get included in the path
    const pathSegments = path.split('/');
    if (pathSegments.some(segment => segment.startsWith('_'))) {
      continue;
    }

    const routePath = path.replace('./', '').replace('.tsx', '').toLowerCase() || '/'
    const subPath = routePath.endsWith("/page") ? 
                  routePath.slice(0, -5) : 
                  routePath.endsWith("page")?
                  "/" :
                  false;
    if (!subPath) { continue }
    routes.push({
      path: subPath,
      element: <module.default />
    });
  }
  return routes;
}
//! eslint will tell you that the as Record<string, { default: React.ComponentType }> is not needed but it is for typescript to know what the type of pages is
const pages = import.meta.glob('./**/*.tsx', { eager: true }) as Record<string, { default: React.ComponentType }>;
const router = createBrowserRouter([{
  path: '/',
  element: <UpdateLocation />,
  children: getRoutes(pages)
}])
await loadClientSyncFunctions();

if (dev) { new VConsole(); }

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Toaster richColors />
      <div className='w-full h-dvh m-0 p-0'>
        <RouterProvider router={router}/>
      </div>
    </StrictMode>
  );
}