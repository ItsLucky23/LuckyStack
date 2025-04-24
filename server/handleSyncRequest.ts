import { tryCatch } from "./functions/tryCatch";
import fs from 'fs';
import path from 'path';
import { initializeFunctions, functions } from "./getFunctions";

const syncFunctions = {};
//* here we scan the src folder for sync folders and load any file that is in a sync folder where the name ends in "_server.ts" 
const scanDirectory = async ({ file }: { file: string }) => {
  const fileHandler = path.posix.join("./src", file);

  if (fs.statSync(fileHandler).isDirectory()) {
    if (file.endsWith("sync")) {
      //* if the selected file is a folder and the name ends with sync, we scan the folder for any file that ends with "_server.ts"
      for (const possibleModule of fs.readdirSync(fileHandler)) {
        if (possibleModule.endsWith("_server.ts")) {
          const modulePath = path.posix.join(fileHandler, possibleModule);

          let func;
          if (process.env.NODE_ENV == "development") {
            //* if we are in development mode, we add a query parameter to the import to force a reload of the module
            func = await import(`../${modulePath}?update=${Date.now()}`);
          } else {
            func = await import(`../${modulePath}`);
          }

          //* attempt to load the default export of the module and check if it is a function
          const [error, result] = await tryCatch(async () => func);
          if (error) {
            console.log(error);
            return;
          }
          if (!result || !result.default || typeof result.default != "function") {
            return;
          }

          //* here we remove the sync folder from the path and keep the path to the page location
          //* this works together with the syncRequest function on the client from serverRequest.ts so that we have sync functions bind to a page its route
          //* for example src/test/test2/sync/updateCard.ts becomes /test/test2 indicating the location for wich page this api call is meant to be
          const pageLocation = modulePath.replace(/\/sync\/[^/]+_server.ts/, "").substring(3);
          const syncName = possibleModule.replace("_server.ts", "");

          syncFunctions[`sync-${pageLocation}-${syncName}`] = result.default;
        }
      }
    } else {
      const subFolders = fs.readdirSync(fileHandler);
      for (const subFolder of subFolders) {
        //* recursively scan the subfolders
        await scanDirectory({ file: path.posix.join(file, subFolder) });
      }
    }
  }
};

export const initializeSyncFiles = async () => {
  //* get the src folder, clear the current syncFunctions object and scan the src folder for any sync functions
  const srcFolder = fs.readdirSync(path.resolve("./src"));
  Object.assign(syncFunctions, {});

  for (const file of srcFolder) {
    await scanDirectory({ file });
  }
};

type syncMessage = {
  name: string;
  data: object;
  user: object;
}

export default async function handleSyncRequest({ name, data, user }: syncMessage) {
  console.log(`sync: ${name} called`);

  //* reloading the functions and sync files if we are in development mode so we have hot reload sync functions
  //* makes it so we dont have to restart the server every time we make a change to a sync function or a function in the functions folder
  if (process.env.NODE_ENV == 'development') {
    await initializeFunctions();
    await initializeSyncFiles();
  }

  //* check if there exist a function with the given name and if it is a function, call it and return the result
  //* if the function returns an truethy value, the value is returned as the serverData key in the response
  if (!syncFunctions[name]) { return { serverData: {}, clientData: data } }
  const [error, result] = await tryCatch(async () => syncFunctions[name]({ data, user, functions }));

  if (error) { return { message: error, error: true }; }
  if (result) { return { serverData: result, clientData: data }; }

  return { message: `sync function ${name} returned no result` };
}