import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import 'src/index.css'
import 'src/scrollbar-white.css'
import { loadClientSyncFunctions } from 'src/_functions/serverRequest'
import VConsole from 'vconsole';
import { mobileConsole, multiDevicePreview } from '../config'
import UpdateLocation from 'src/_components/updateLocation'
import { MenuHandlerProvider } from './_components/menuHandler'
import Iphone15 from './_components/iphone15'
import Laptop from './_components/laptop'

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

if (mobileConsole) { new VConsole(); }

// const [maxWidth, setMaxWidth] = useState<number>(window.innerWidth)
// useEffect(() => {
//   const handleResize = () => {
//     setMaxWidth(window.innerWidth)
//   }
  
//   window.addEventListener('resize', handleResize)
//   return () => window.removeEventListener('resize', handleResize)
// }, [])

const maxWidth = window.innerWidth;

const root = document.getElementById("root");
if (root) {
  if (!multiDevicePreview) {
    createRoot(root).render(
      <StrictMode>
        <Toaster richColors />
        <div className='w-full h-dvh m-0 p-0'>
          <MenuHandlerProvider>
            <RouterProvider router={router}/>
          </MenuHandlerProvider>
        </div>
      </StrictMode>
    );
  } else {
    createRoot(root).render(
      <StrictMode>
        <div className="h-dvh w-full flex justify-evenly gap-40 items-center bg-gray-400 overflow-auto">
          <div className="@container min-w-[350px] max-w-[350px]">
            <Iphone15>
            {/* <Iphone15 maxWidth={(maxWidth/5)*2}> */}
              <Toaster richColors />
              {/* <div className='w-full h-full m-0 p-0'> */}
                <MenuHandlerProvider>
                  <RouterProvider router={router}/>
                </MenuHandlerProvider>
              {/* </div> */}
            </Iphone15>
          </div>
          <div className="@container min-w-[900px] max-w-[900px]">
            <Laptop>
              <Toaster richColors />
              {/* <div className='w-full h-full m-0 p-0'> */}
                <MenuHandlerProvider>
                  <RouterProvider router={router}/>
                </MenuHandlerProvider>
              {/* </div> */}
            </Laptop>
          </div>
        </div>
      </StrictMode>
    )
  }
}