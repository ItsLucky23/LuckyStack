import Middleware from "src/_components/middleware";
import Navbar from "src/_components/Navbar";


export default function Home() {
  return (
    <div className="w-full h-full flex flex-row bg-white">
      <Middleware>
        <Navbar />
        <div className="h-full flex flex-grow flex-col items-center justify-center gap-4 text-black">
          admin page
        </div>
      </Middleware>
    </div>
  )
}