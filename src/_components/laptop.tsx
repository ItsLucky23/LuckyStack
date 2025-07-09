interface Props {
  children: React.ReactNode;
}

export default function Laptop({ children }: Props) {

  return (
    <div 
      className="relative w-full border-gray-800 dark:border-gray-800 bg-gray-800 border-[10px] rounded-t-xl"
      style={{ aspectRatio: '16/9', backgroundColor: '#242424'  }}
    >
      
      <div className="w-full h-full overflow-y-auto">
        {children}
      </div>

      <div className="absolute bg-gray-900 dark:bg-gray-700 flex justify-center rounded-b-xl rounded-t-sm h-5 w-[130%] left-1/2 -translate-x-1/2 -bottom-7">
        <div className="rounded-b-xl h-3 bg-gray-800 w-1/5"></div>
      </div>
  
    </div>
  )
}

//   return (
//     <div 
//       className=""
//     >
//       <div 
//         className={`border-gray-800 dark:border-gray-800 bg-gray-800 border-[8px] rounded-t-x`}
//         // style={{ aspectRatio: '16/9'  }}
//         // style={{ width: `${maxWidth-32}px`, height: `${(maxWidth/16)*9}px` }}
//         // style={{ aspectRatio: '16/9'  }}
//       >
//         {/* <div className="rounded-lg overflow-hidden h-full bg-white dark:bg-gray-800"> */}
//           {/* <iframe
//             src={src}
//             style={{
//               // width: '1920px',        // original design width of iframe content (desktop width)
//               // height: '1080px',        // original design height of iframe content
//               width: '1920px',        // original design width of iframe content (desktop width)
//               height: '1080px',        // original design height of iframe content
//               transform: `scale(${(maxWidth / 1920)-0.02})`,  // scale down so it fits inside smaller frame
//               transformOrigin: 'top left',
//               border: 'none',
//             }}
//           /> */}
//         <div className="w-full h-full">
//           {children}
//         </div>

//         {/* </div> */}
//       </div>
//       <div 
//         className="bg-gray-900 dark:bg-gray-700 flex justify-center rounded-b-xl rounded-t-sm h-5 w-[110%]"
//         // style={{ width: `${(maxWidth+80)}px`, left: '-40px' }}
//       >
//         <div 
//           className="rounded-b-xl h-3 bg-gray-800 w-1/5"
//           // style={{ width: `${maxWidth/5}px` }}
//         ></div>
//       </div>
//     </div>
//   );
// }
