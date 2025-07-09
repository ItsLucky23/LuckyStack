interface Props {
  // maxWidth: number;
  children: React.ReactNode;
}

export default function Iphone15({ children }: Props) {
  // export default function Iphone15({ maxWidth, children }: Props) {

  return (
    // <div className="relative w-72 h-[600px] rounded-[45px] border-8 border-zinc-900">
    <div 
      className="relative rounded-[45px] border-8 border-zinc-900"
      // style={{ width: `${(maxWidth/19.5)*9}px`, height: `${(maxWidth)}px`	 }}
      style={{ aspectRatio: '9/19.5', backgroundColor: '#242424'  }}
    >
      {/* ${(maxWidth / 1000)-0.05} */}

      {/* <!-- Dynamic Island --> */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[90px] h-[22px] bg-zinc-900 rounded-full z-20">
      </div>

      <div className="absolute -inset-[1px] border-[3px] border-zinc-700 border-opacity-40 rounded-[37px] pointer-events-none"></div>
      
      {/* <!-- Screen Content --> */}
      <div className="relative w-full h-full rounded-[37px] overflow-hidden">
        <div className="text-black text-sm w-full h-10 bg-white flex px-4 justify-between items-center">
          <div className="bg-gray-100 py-1 px-2 rounded-md">04:20</div>
          <div className="bg-gray-100 py-1 px-2 rounded-md">69%</div>
        </div>
        {/* <iframe
          src={src}
          style={{
            // width: '1920px',        // original design width of iframe content (desktop width)
            // height: '1080px',        // original design height of iframe content
            width: `${(maxWidth/19.5)*9-16}px`,        // original design width of iframe content (desktop width)
            height: `${(maxWidth-80-16)}px`,        // original design height of iframe content
            transform: `scale(1)`,  // scale down so it fits inside smaller frame
            transformOrigin: 'top left',
            border: 'none',
          }}
        /> */}

        <div 
          className="w-full h-[calc(100%-80px)] overflow-y-auto"
        >
          {children}
        </div>

        <div className="text-black text-sm w-full h-10 bg-white flex items-center justify-center">
          <input 
            className="w-3/4 bg-gray-300 h-6 rounded-md p-1"
            value={window.location.href}
            disabled
          ></input>
        </div>
      </div>
      
      {/* <!-- Left Side Buttons --> */}
      {/* <!-- Silent Switch --> */}
      <div className="absolute left-[-12px] top-20 w-[6px] h-8 bg-zinc-900 rounded-l-md shadow-md"></div>
      
      {/* <!-- Volume Up --> */}
      <div className="absolute left-[-12px] top-36 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md"></div>
      
      {/* <!-- Volume Down --> */}
      <div className="absolute left-[-12px] top-52 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md"></div>
      
      {/* <!-- Right Side Button (Power) --> */}
      <div className="absolute right-[-12px] top-36 w-[6px] h-16 bg-zinc-900 rounded-r-md shadow-md"></div>
    </div>
  )
}