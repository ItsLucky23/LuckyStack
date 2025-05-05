import { toast } from "sonner";
import { io, Socket } from 'socket.io-client';
import tryCatch from 'src/_functions/tryCatch';
import config, { dev, backendUrl } from "src/config";

let socket: Socket | null = null;
const abortControllers = new Map<string, AbortController>();
//* if we use apiRequest function and the called api name starts with 1 of the names below we apply a abort controller
const abortControllerNames = ['get', 'fetch', 'load', 'is', 'has', 'list', 'all', 'search', 'view', 'retrieve'];
(async () => {
  //* here we connect to the socket server
  const [socketError, socketHandler] = await tryCatch(async () => {
    const socketInstance: Socket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
      withCredentials: true
    });

    socketInstance.on("connect", () => {
      console.log("Connected via WebSocket!");
    });

    //* called by server when using syncRequest function
    socketInstance.on("sync", (msg) => {
      syncRequestCallback(msg);
    });
  
    socketInstance.on("disconnect", () => {
      console.log("Disconnected, trying to reconnect...");
    });
  
    return socketInstance;
  })
  
  if (socketError) {
    console.error(socketError); 
  }

  socket = socketHandler;
})();







//* if apiname is logout we just logout the user and redirect him to the login page
const logout = async () => {
    const response = await fetch(`${config.backendUrl}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    if (await response.text() == 'ok') { window.location.href = config.loginPageUrl; }
}

let responseIndex = 0;
interface apiRequestType {
  name: string;
  data?: object;
}

export interface apiRequestReponse {
  status: 'success' | 'error' | any;
  result?: Record<string, any> | any;
  message?: string;
}

export const apiRequest = ({ name, data }: apiRequestType) => {
  return new Promise(async (resolve, reject) => {
    if (!name || typeof name !== "string") {
      if (dev) {
        console.error("Invalid name");
        toast.error("Invalid name");
      }
      return null;
    }

    if (name == 'logout') { return resolve(await logout()); }

    if (!data || typeof data !== "object") {
      // if (dev && name != 'session') {
      //   console.info("Empty data, sending an empty object instead");
      //   toast.info("Empty data, sending an empty object instead");
      // }
      data = {};
    }
  
    if (!await waitForSocket()) { return resolve(null); }
    if (!socket) { return resolve(null); }
  
    const useAbortController = abortControllerNames.some((tempName) => name.startsWith(tempName));
    const pathname = window.location.pathname;
    const fullname = name != 'session' ? `api-${pathname}-${name}` : name;
  
    let signal: AbortSignal | null = null;
    let abortFunc = () => {};

    if (useAbortController) {
      if (abortControllers.has(fullname)) {
        //* if we have an abort controller we abort it and create a new one
        const prevAbortController = abortControllers.get(fullname);
        prevAbortController?.abort();
      }
      //* here we create a new abort controller and add it to the map with the api fullname as the key
      const abortController = new AbortController();
      abortControllers.set(fullname, abortController);
      abortFunc = () => {
        // if (dev) {
        //   console.info(`Request ${fullname} aborted`);
        //   toast.info(`Request ${fullname} aborted`);
        // }
        if (signal) { signal.removeEventListener("abort", abortFunc); }
        reject(`Request ${fullname} aborted`)
      };
      //* here we bind the abortFunc to the abort event so it will be called when the abort controller is aborted
      signal = abortController.signal;
      signal.addEventListener("abort", abortFunc);
    }

    // console.log(`apiRequest: ${fullname}, data ->`);
    // console.log(data);
    console.log({ name: fullname, data });
    responseIndex++;
    socket.emit('apiRequest', { name: fullname, data, responseIndex });
  
    socket.once(`apiResponse-${responseIndex}`, (msg: string) => {
      const { result, message, error } = JSON.parse(msg);
  
      if (signal && signal.aborted) { return; }

      if (error) {
        if (dev) {
          console.error('message:', message);
          toast.error(message);
        }
        // return reject(error);
        return resolve({
          status: 'error',
          message
        })
      }
  
      if (dev) { console.log({ apiName: fullname, ...result }) }
  
      if (signal) {
        signal.removeEventListener("abort", abortFunc);
        abortControllers.delete(fullname);
      }
      
      resolve(result)
    });
  })
}












const syncFunctions: Record<string, (data: any) => void> = {};
export const loadClientSyncFunctions = async (): Promise<void> => {
  // const modules = import.meta.glob("../**/*sync/*_client.ts");
  const modules = {
    ...import.meta.glob("../**/*sync/*_client.ts"),
    ...import.meta.glob("../**/*Sync/*_client.ts"),
  };

  for (const path in modules) {
    try {
      const module: any = await modules[path]();

      if (module.default && typeof module.default === "function") {
        const fileName = path.split("/").pop() || "";
        const syncName = fileName.replace("_client.ts", "");

        const parts = path.split("/");
        const syncIndex = parts.findIndex(part => part.toLowerCase().endsWith("sync"));
        if (syncIndex === -1) continue; // No sync folder found

        console.log(parts);
        console.log(syncIndex);
        const pageLocation = parts.slice(1, syncIndex).join("/"); // slice(2) removes '..' and 'src'
        console.log(pageLocation);
        const fullName = `sync-/${pageLocation}-${syncName}`;

        syncFunctions[fullName] = module.default;
      }
    } catch (error) {
      console.error(`Failed to import ${path}:`, error);
    }
  }
  console.log(syncFunctions);
};

const syncRequestCallback = (msg: string) => {
  console.log(msg)
  const path = window.location.pathname;
  const { cb, clientData, serverData, message, error } = JSON.parse(msg);
  const currentSync = syncFunctions[`sync-${path}-${cb}`];
  if (!currentSync) {
    if (dev) {
      console.info(`Sync cb function on the client not found for ${cb}`);
      toast.info(`Sync cb function on the client not found for ${cb}`);
    }
    return;
  }

  if (error) {
    if (dev) {
      console.error(message);
      toast.error(message);
    }
    return;
  } 

  // no need to catch the response or make it await cause all the logic should be handled in the cb function
  currentSync({ clientData, serverData });
}

type syncRequestType = {
  name: string;
  data?: object | null;
}

export const syncRequest = async ({ name, data }: syncRequestType) => {
  if (!name || typeof name !== "string") {
    if (dev) {
      console.error("Invalid name for syncRequest");
      toast.error("Invalid name for syncRequest");
    }
    return null;
  }

  if (!data || typeof data !== "object") {
    // if (dev) {
    //   console.info("no data for syncRequest, sending an empty object instead");
    //   toast.info("no data for syncRequest, sending an empty object instead");
    // }
    data = {};
  }

  if (!await waitForSocket()) { return }
  if (!socket) { return null; }
  
  console.log(`syncRequest: ${name}, data ->`);
  console.log(data);

  const pathname = window.location.pathname;
  const fullName = `sync-${pathname}-${name}`;
  if (!syncFunctions[fullName] || dev) {
    await loadClientSyncFunctions();
  }

  socket.emit('sync', { name: fullName, data, cb: name });
}

// export {}

const waitForSocket = async () => {
  
  if (!socket && dev) {
    console.error("Socket is not initialized, waiting for it to be initialized");
    toast.error("Socket is not initialized, waiting for it to be initialized");
  }

  let i = 0;
  while (!socket) {
    await new Promise((resolve) => setTimeout(resolve, 10));
    i++
    if (i > 500) { 
      if (dev) {
        console.error("Socket is not initialized, giving up");
        toast.error("Socket is not initialized, giving up");
      }
      return false 
    } // we give it 500 * 10 so 5000ms or 5s to load the socket connection
  }

  return true
}

export const updateLocationRequest = async ({ location }: {location: {pathName: string, searchParams: Record<string, string>}}) => {
  if (!location.pathName || !location.searchParams) {
    if (dev) {
      console.error("Invalid location");
      toast.error("Invalid location"); 
    }
    return null;
  }

  if (!await waitForSocket()) { return }
  if (!socket) { return null; }

  socket.emit('updateLocation', location);
}