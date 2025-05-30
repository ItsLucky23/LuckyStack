import { apiRequest, syncRequest } from "src/_functions/serverRequest";
import { useEffect } from 'react';
import { useTemplate } from 'src/_components/templateProvider';
import notify from "src/_components/notify";

export default function Home() {
  const { setTemplate } = useTemplate();

  useEffect(() => {
    setTemplate('dashboard');
  }, []);

  return (
    <div className="h-full flex flex-grow flex-col items-center justify-center gap-4">
      <button className="w-40 rounded-md cursor-pointer h-10 bg-red-500 text-white" 
        onClick={() => { void syncRequest({ name: 'updateCounter', data: { product: 'shoes', increase: true } }) }}>
        increase!!
      </button>
      <button className="w-40 rounded-md cursor-pointer h-10 bg-red-500 text-white" 
        onClick={() => { void syncRequest({ name: 'updateCounter', data: { product: 'shoes', decrease: false } }) }}>
        decrease!!
      </button>
      <button className="w-40 rounded-md cursor-pointer h-10 bg-red-500 text-white"
        onClick={() => { void apiRequest({ name: 'testApi' })}}>
          testApi
      </button>
      <button className="w-40 rounded-md cursor-pointer h-10 bg-red-500 text-white"
        onClick={() => { void apiRequest({ name: 'logout' }) }}>
          logout
      </button>
      <div className="shoesCounter bg-red-500 p-2 rounded-md">
        shoes: <span>0</span>
      </div>
      <button className="bg-red-500"
        onClick={() => { notify.success('test', { name: 'mike' }) }}>
        Click me!!
      </button>
    </div>
  );
}