import { apiRequest, syncRequest } from "src/_functions/serverRequest";
import { useEffect, useState } from 'react';
import { useTemplate } from 'src/_components/templateProvider';
import notify from "src/_components/notify";
import { useMenuHandler } from "src/_components/menuHandler";
import { setMenuHandlerRef } from "src/_functions/menuHandler";
import { confirmDialog } from "src/_components/confirmMenu";
import { sessionLayout } from "config";

export default function Home() {
  const { setTemplate } = useTemplate();
  const [session, setSession] = useState<sessionLayout | null>(null)

  useEffect(() => {
    (async () => {
      const session = await apiRequest({ name: 'session' }) as sessionLayout;
      setSession(session);
    })()
  }, [])

  useEffect(() => {
    setTemplate('dashboard');
  }, []);

  const ref = useMenuHandler();
  setMenuHandlerRef(ref);

  return (
    <div className="h-full flex flex-grow flex-col items-center justify-center gap-4">
      <button className="px-6 rounded-md cursor-pointer h-10 bg-pink-500 text-white" 
        onClick={() => { void syncRequest({ name: 'updateCounter', data: { product: 'shoes', increase: true } }) }}>
        click me to increase shoes counter over all clients <strong>(sync request)!!</strong>
      </button>
      <button className="px-6 rounded-md cursor-pointer h-10 bg-pink-500 text-white" 
        onClick={() => { void syncRequest({ name: 'updateCounter', data: { product: 'shoes', decrease: false } }) }}>
        click me to decrease shoes counter over all clients <strong>(sync request)!!</strong>
      </button>
      <div className="shoesCounter bg-pink-500 p-2 rounded-md text-white">
        shoes: <strong>0</strong>
      </div>
      <button className="min-w-40 px-6  rounded-md cursor-pointer h-10 bg-green-500 text-white"
        onClick={() => { void apiRequest({ name: 'testApi' })}}>
          click me to call an testApi <strong>(check client and server console)</strong>
      </button>
      <button className="min-w-40 px-6 rounded-md cursor-pointer h-10 bg-orange-500 text-white"
        onClick={() => { void apiRequest({ name: 'logout' }) }}>
          logout
      </button>
      <button className="bg-purple-500 text-white rounded-md p-2 cursor-pointer"
        onClick={() => { notify.success('test', { name: session?.name || 'loading' }) }}>
        Click me for a notification!!
      </button>
      <button 
        className="min-w-40 px-6 rounded-md cursor-pointer h-10 bg-blue-500 text-white"
        onClick={() => {
          ref.open(
            <div className="p-4 gap-4 flex flex-col">

              <h2>Menu</h2>
              <button className="w-20 rounded-md cursor-pointer h-8 bg-red-500 text-white"
                onClick={() => { ref.close() }}
              >close</button>
              <button className="w-20 rounded-md cursor-pointer h-8 bg-red-500 text-white"
                onClick={() => { ref.open(
                  <div className="p-4 gap-4 flex flex-col">
                    <h2>Menu 2</h2>
                    <button className="w-20 rounded-md cursor-pointer h-8 bg-red-500 text-white"
                      onClick={() => { ref.close() }}
                    >close</button>
                    <button className="w-20 rounded-md cursor-pointer h-8 bg-red-500 text-white"
                      onClick={async () => {
                        const result = await confirmDialog({
                          title: 'test',
                          content: <p>test <strong>test2</strong></p>,
                          input: 'test'
                        })
                        console.log(`Confirm Dialog returned: ${result}`);
                      }}
                    >
                      open
                    </button>
                  </div>, { dimBackground: true, background: 'bg-orange-200', size:'sm'  }
                )}}
              >
                open
              </button>
            </div>, { dimBackground: true, background: 'bg-white', size: 'md' }
          )
        }}
      >
        click me to open external menu
      </button>
    </div>
  );
}