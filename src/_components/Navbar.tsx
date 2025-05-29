import { ReactNode, useEffect, useRef, useState } from "react";
import { apiRequest } from "src/_functions/serverRequest"
import { useLocation } from "react-router-dom";
import { sessionLayout } from "../../config";
import Icon from "./icon";
import initializeRouter from "./router";

const navbarItems = [
  {
    init: function InitComponent({ state, session }: NavbarItemProps) {
      const [imgError, setImgError] = useState(false);
      const firstLetter = session.name?.[0]?.toUpperCase() ?? '?';
    
      const showFallback = !session.avatar || imgError;
    
      return (
        <>
          {showFallback ? (
            <div className="rounded-full bg-gray-300 text-white flex items-center justify-center font-bold min-w-6 min-h-6 select-none">
              {firstLetter}
            </div>
          ) : (
            <img
              className="rounded-full max-w-6 max-h-6 select-none"
              src={session.avatar}
              alt="avatar"
              onError={() => { setImgError(true) }}
            />
          )}
          
          {state === 'expended' && (
            <div className="line-clamp-1 select-none">{session.name}</div>
          )}
        </>
      );
    },
  },
  {
    icon: 'close_fullscreen',
    label: 'Close sidebar',
    action: ({ setState }: NavbarItemProps) => {
      setState('folded')
    },
    hideOnFolded: true
  },
  {
    icon: 'open_in_full',
    label: 'Show sidebar',
    action: ({ setState }: NavbarItemProps) => {
      setState('expended')
    },
    hideOnExpended: true
  },
  {
    icon: 'home',
    label: 'Test',
    path: '/test'
  },
  {
    icon: 'settings',
    label: 'Settings',
    path: '/settings'
  },
  {
    icon: 'admin_panel_settings',
    label: 'Admin',
    path: '/admin'
  },
  {
    icon: 'logout',
    label: 'Logout',
    bottom: true,
    action: async () => {
      await apiRequest({ name: 'logout' });
    }
  },
]

const activePopups: HTMLElement[] = [];
const clearPopups = () => {
  for (const popup of activePopups) {
    popup.remove();
  }
  activePopups.length = 0;
};

const displayPopup = ({ element, text }: { element: HTMLElement, text: string }) => {
  const popup = document.createElement('div');
  popup.className = `
    bg-gray-200 text-gray-700 rounded-md p-2 absolute z-50 shadow-lg whitespace-nowrap pointer-events-none
    transform scale-90 opacity-0 transition-all duration-200
  `;

  popup.innerHTML = text;

  const rect = element.getBoundingClientRect();
  if (rect.width == 0 && rect.height == 0) { return };
  
  popup.style.position = 'absolute';
  popup.style.top = `${(rect.top + window.scrollY - 10).toString()}px`;
  popup.style.left = `${(rect.left + window.scrollX + rect.width + 5).toString()}px`;
  document.body.appendChild(popup);

  activePopups.push(popup);
  void popup.offsetHeight;

  popup.classList.remove('scale-90', 'opacity-0');
  popup.classList.add('scale-100', 'opacity-100');

  element.addEventListener('mouseleave', () => { 
    popup.remove(); 
    const index = activePopups.indexOf(popup);
    if (index !== -1) activePopups.splice(index, 1);
  }, { once: true });
};

interface NavbarItemProps {
  item: {
    init?: ({ item, state, setState, pathname, session }: {
      item: NavbarItemProps["item"],
      state: NavbarItemProps["state"],
      setState: NavbarItemProps["setState"],
      pathname: NavbarItemProps["pathname"],
      session: NavbarItemProps["session"],
      router: NavbarItemProps["router"]
    }) => ReactNode,
    icon?: string,
    label?: string,
    path?: string,
    action?: ({ item, state, setState, pathname, session }: { 
      item: NavbarItemProps["item"], 
      state: NavbarItemProps["state"], 
      setState: NavbarItemProps["setState"], 
      pathname: NavbarItemProps["pathname"],
      session: NavbarItemProps["session"],
      router: NavbarItemProps["router"]
    }) => void,
    bottom?: boolean,
    hideOnFolded?: boolean,
    hideOnExpended?: boolean
  },
  state: 'folded' | 'expended',
  setState: (state: 'folded' | 'expended') => void,
  pathname: string,
  session: sessionLayout,
  router: (location: string) => Promise<void> | void
}

const NavbarItem = ({ item, state, setState, pathname, session, router }: NavbarItemProps) => {
  const toggleId = useRef<number | null>(null);
  return (
   <div className={`hover:bg-gray-200 hover:text-gray-600 w-full h-10 items-center rounded-sm transition-all duration-100 cursor-pointer gap-2 py-2
      ${state == 'expended' && item.hideOnExpended ? 'hidden' :
        state == 'folded' && item.hideOnFolded ? 'hidden' : 
        'flex'
      }
      ${state == 'folded' ? 'px-2' : 'px-2'}
      ${item.path == pathname ? 'bg-gray-200' : ''}
      ${item.bottom ? 'mt-auto' : ''}
    `}
    onMouseEnter={(e) => {
      if (state == 'expended') { return }
      const target = e.currentTarget as HTMLElement;
      const randomId = Math.floor(Math.random() * 1000000000000000);
      toggleId.current = randomId;
      setTimeout(() => {
        requestAnimationFrame(() => {
          if (item.label == undefined) { return }
          if (toggleId.current != randomId) { return }
          console.log('toggleId', toggleId.current);
          displayPopup({ element: target, text: item.label });
        })
      }, 100);
    }}
    onMouseLeave={() => {
      if (state == 'expended') { return }
      toggleId.current = null;
    }}
    onClick={async () => {
      if (item.action) { item.action({ item, state, setState, pathname, session, router }) }
      else if (item.path) { 
        clearPopups();
        void await router(item.path);
        setState('folded');
      }
    }}>
      {item.init ? 
        item.init({ item, state, setState, pathname, session: session, router })
      :
      <>
        <Icon 
          name={item.icon || ''} 
          size={state === 'folded' ? '18px' : '22px'}
          weight={'lighter'}
          customClasses={"relative left-0.75"}
        />
        {state == 'expended' &&
          <div className="line-clamp-1 select-none">{item.label}</div>
        }
      </>
      }
   </div> 
  ) 
}

let globalCallback: (() => void) | null = null;

export default function Navbar() {

  const [state, setState] = useState<'folded' | 'expended'>('folded');
  const [session, setSession] = useState<sessionLayout>({}); // use proper type if you have one
  const [windowSize, setWindowSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
  const location = useLocation();
  // const router = useNavigate();
  const router = initializeRouter()

  const fetchSession = () => {
    apiRequest({ name: 'session' })
    .then((tempSession) => {
      setSession(tempSession as sessionLayout);
    })
    .catch((error: unknown) => {
      if (error instanceof Error) {
        console.error('Failed to fetch session:', error.message);
      } else {
        console.error('Failed to fetch session: Unknown error');
      }
    });
  }

  useEffect(() => {
    fetchSession();
    globalCallback = fetchSession;
  }, [])

  useEffect(() => {
    clearPopups();
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    handleResize(); 
  }, [])

  return (
    <>
      {windowSize.width < 768 &&
        <>
          <div className="w-full py-2 px-4 bg-gray-100 text-black flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <img src={session.avatar} className="max-w-8 max-h-8 rounded-full"></img>
              <h1>{session.name}</h1>
            </div>
            <div className="">
            {/* <span 
              style={{ fontSize: '22px', fontWeight: 'lighter' }}
              className={`material-icons select-none`}
              onClick={() => {
                const value = state == 'expended'? 'folded' : 'expended';
                setState(value)
              }}>
              menu
            </span> */}
            <Icon
              name={state == 'expended'? 'close_fullscreen' : 'open_in_full'}
              size={'22px'}
              weight={'lighter'}
              onClick={() => {
                const value = state == 'expended'? 'folded' : 'expended';
                setState(value)
              }}
            />
            </div>
          </div>
        </>
      }
      <div className={`h-full bg-gray-100 text-gray-500 flex flex-col items-center md:py-4 transition-all duration-200 md:px-2 absolute z-20 md:z-0 md:relative
        ${state == 'folded' ? 
          'md:w-14 w-0 gap-3' : 
          'w-64 gap-1 px-2'
        }`}>

          {/* {(windowSize.width >= 768 || state == 'expended') && navbarItems.map((item, index) => {

            const shouldRender = item.init ? true :
              item.icon && item.label ? true :
              false;

            if (!shouldRender) return null;

            return <NavbarItem key={index} pathname={location.pathname} item={item} state={state} setState={setState} session={session} router={router}/>
          })} */}
          {(windowSize.width >= 768 || state === 'expended') && (
            <>
              {/* Top items */}
              {navbarItems.filter(item => !item.bottom).map((item, index) => {
                const shouldRender = item.init || (item.icon && item.label);
                if (!shouldRender) return null;

                return (
                  <NavbarItem
                    key={index}
                    pathname={location.pathname}
                    item={item}
                    state={state}
                    setState={setState}
                    session={session}
                    router={router}
                  />
                );
              })}

              {/* Bottom items, inside a mt-auto wrapper */}
              <div className="mt-auto w-full flex flex-col gap-2 items-center">
                {navbarItems.filter(item => item.bottom).map((item, index) => {
                  const shouldRender = item.init || (item.icon && item.label);
                  if (!shouldRender) return null;

                  return (
                    <NavbarItem
                      key={`bottom-${index}`}
                      pathname={location.pathname}
                      item={item}
                      state={state}
                      setState={setState}
                      session={session}
                      router={router}
                    />
                  );
                })}
              </div>
            </>
          )}

      </div>
      <div className={`md:hidden flex absolute top-0 left-0 z-10 bg-black ${state != 'folded' ? 'opacity-80' : 'opacity-0 pointer-events-none'} transition-all duration-300 w-full h-full`}
        onClick={() => { setState('folded') }}>
      </div>
    </>
  )
}

export const updateNavbar = () => {
  if (globalCallback) { globalCallback() }
}