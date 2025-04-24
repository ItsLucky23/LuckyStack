import { ReactNode, useEffect, useRef, useState } from "react";
import { apiRequest } from "src/functions/serverRequest"
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { sessionLayout } from "src/config";

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
    }
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
    icon: 'admin_panel_settings',
    label: 'Admin',
    path: '/admin'
  },

  // {
  //   icon: 'groups',
  //   label: 'Groups',
  //   path: '/groups'
  // },
  // {
  //   icon: 'search',
  //   label: 'Search',
  //   path: '/search' 
  // },
  // {
  //   icon: 'settings',
  //   label: 'Settings',
  //   path: '/settings' 
  // },
  // {
  //   icon: 'star',
  //   label: 'Star',
  //   path: '/star' 
  // },
  // {
  //   icon: 'add',
  //   label: 'Add',
  //   path: '/add' 
  // },
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
    onClick={() => {
      if (item.action) { item.action({ item, state, setState, pathname, session, router }) }
      else if (item.path) { 
        clearPopups();
        void router(item.path) 
      }
    }}>
      {item.init ? 
        item.init({ item, state, setState, pathname, session: session, router })
      :
      <>
        <span 
          style={{ fontSize: state === 'folded' ? '18px' : '22px', fontWeight: 'lighter' }}
          className={`material-icons select-none ${state === 'folded' ? 'relative left-0.75' : ''}`}>
          {item.icon}
        </span>
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
  const location = useLocation();
  const router = useNavigate();

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

  return (
    <>
      <div className={`h-full bg-gray-100 text-gray-500 flex flex-col items-center py-4 transition-all duration-200 px-2 absolute z-20 md:z-0 md:relative
        ${state == 'folded' ? 
          'w-14 gap-3' : 
          'w-64 gap-1'
        }`}>

          {navbarItems.map((item, index) => {

            const shouldRender = item.init ? true :
              item.icon && item.label ? true :
              false;

            console.log(shouldRender)
            if (!shouldRender) return null;

            return <NavbarItem key={index} pathname={location.pathname} item={item} state={state} setState={setState} session={session} router={router}/>
          })}

      </div>
      {state == 'expended' && (
        <div className={`md:hidden flex absolute top-0 left-0 z-10 bg-black opacity-80 w-full h-full`}
          onClick={() => { setState('folded') }}>
          
        </div>
      )}
    </>
  )
}

export const updateNavbar = () => {
  if (globalCallback) { globalCallback() }
}
