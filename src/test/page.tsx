import Navbar from "src/_components/Navbar";
import { apiRequest, syncRequest } from "src/_functions/serverRequest";
import Middleware from "src/_components/middleware";
import { toast } from "sonner";

export default function App() {

  return (
    <div className="w-full h-full flex flex-row bg-white">
      <Middleware>
        <Navbar />
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
            onClick={() => { toast.success('this is a success message') }}>
            Click me!!
          </button>
        </div>
      </Middleware>
    </div>
  );
}