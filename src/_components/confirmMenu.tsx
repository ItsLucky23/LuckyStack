import ReactDOM from "react-dom";

interface ConfirmMenuProps {
  title: React.ReactNode; // allows to use JSX elements
  message?: React.ReactNode; // allows to use JSX elements
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmMenu({ title, message, onConfirm, onCancel }: ConfirmMenuProps) {

  const portalRoot = document.getElementById('portal-root') as HTMLDivElement;
  
  if (!portalRoot) { return }

  return ReactDOM.createPortal(
    <div
      className="w-full h-full absolute z-10 bg-black/80 flex items-center justify-center p-4"
      onClick={() => { void onCancel(); }}
    >
      <div 
        className="text-black bg-white rounded-md flex flex-col gap-2 p-6 max-w-[300px] w-full"
        onClick={(e) => { void e.stopPropagation(); }}
      >
        <h1 className="font-semibold text-xl">{title}</h1>
        {message && <h3 className="text-gray-500">{message}</h3>}

        <button 
          className="mt-4 rounded-md bg-custom-gradient px-4 text-white py-2 font-semibold text-lg cursor-pointer"
          onClick={() => { void onConfirm(); }}
        >
          Confirm
        </button>
        <button 
          className="rounded-md bg-custom-gradient opacity-50 px-4 text-white py-2 font-semibold text-lg cursor-pointer"
          onClick={() => { void onCancel(); }}
        >
          Cancel
        </button>
      </div>

    </div>, portalRoot
  )
}