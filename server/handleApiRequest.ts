import fs from 'fs';
import path from 'path';
import { tryCatch } from './functions/tryCatch';
import { minimalSessionLayout } from '../config';
import { initializeFunctions, devFunctions } from './getFunctions';
import { apis, functions } from './generatedApis'

// const apis = {};
//* here we scan the src folder for api folders and load any file that is in a api folder where the file extension is .ts 
const scanDirectory = async ({ file }: { file: string }) => {
  const fileHandler = path.posix.join('./src', file);
  if (fs.statSync(fileHandler).isDirectory()) {
    if (file.endsWith('api') || file.endsWith('Api')) {
      //* if the selected file is a folder and the name ends with api, we scan the folder for any file that has the file extension .ts
      for (const possibleModule of fs.readdirSync(fileHandler)) {
        if (possibleModule.endsWith('.ts')) {
          const modulePath = path.posix.join(fileHandler, possibleModule);

          // let func; // return a module
          // if (process.env.NODE_ENV == 'development') { 
            //* if we are in development mode, we add a query parameter to the import to force a reload of the module
          const func = await import(`../${modulePath}?update=${Date.now()}`)
          // } else { 
            // func = await import(`../${modulePath}`) 
          // }

          //* attempt to load the default export of the module and check if it is a function
          const [error, result] = await tryCatch(async () => func );
          if (error) { console.log(error); return; }
          const { auth, api } = result;

          if (!api) { return }
          if (typeof api != 'function') { return }

          //* here we remove the api folder from the path and keep the path to the page location
          //* this works together with the apiRequest function on the client from serverRequest.ts so that we have api functions bind to a page its route
          //* for example src/test/test2/api/getUser.ts becomes /test/test2 indicating the location for wich page this api call is meant to be
          // const pageLocation = modulePath.replace(/\/api\/.*/, '').substring(3);
          // const name = modulePath.split('/api/')[1].replace('.ts', '');
          // const match = modulePath.match(/\/([^/]*_api)\/(.+)\.ts$/i);
          const match = modulePath.match(/\/([^/]*api)\/(.+)\.ts$/i);
          if (!match) return;
          const [_, apiFolder, name] = match;
          const pageLocation = modulePath.split(`/${apiFolder}/`)[0].substring(3);

          const newApi = {
            auth: auth || {},
            api
          }

          newApi.auth.login = newApi.auth.login || false;
          newApi.auth.additional = newApi.auth.additional || [];

          apis[`api-${pageLocation}-${name}`] = newApi;
        
        }
      }
    } else {
      const subFolders = fs.readdirSync(fileHandler);
      for (const subFolder of subFolders) {
        //* recursively scan the subfolder
        await scanDirectory({ file: path.posix.join(file, subFolder) })
      }
    }
  }
}

export const initializeApis = async () => {
  //* get the src folder, clear the current apiFunctions object and scan the src folder for any api functions
  const srcFolder = fs.readdirSync(path.resolve('./src'));
  Object.assign(apis, {});

  for (const file of srcFolder) {
    await scanDirectory({ file })
  }

  console.log(apis);
}

type handleApiRequestType = {
  name: string;
  data: Object;
  user: Record<string, any>;
}

export default async function handleApiRequest({ name, data, user }: handleApiRequestType) {

  console.log(`api: ${name} called`);

  //* reloading the functions and api files if we are in development mode so we have hot reload sync functions
  //* makes it so we dont have to restart the server every time we make a change to a api function or a function in the functions folder
  if (process.env.NODE_ENV == 'development') {
    await initializeFunctions();
    await initializeApis(); 
  }

  //* check if there exist a function with the given name and if it is a function, call it and return the result
  if (!apis[name]) { return { message: 'api not found', error: true } }

  const { auth, api } = apis[name];

  //* if the login key is true we check if the user has session data and if it has all the keys in the minimalSessionLayout array in the config.ts file
  if (auth.login) { 
    if (!user) { return { message: 'not logged in', error: true }; }
    for (const item of minimalSessionLayout) {
      if (user[item] === undefined || user[item] === null) { return { message: 'not logged in', error: true }; }
    }
  }

  //* if the additional key is an array we check if the following
  //* if it has a key and a type we check if the user has the key and if the value is of the correct type
  //* if it has a key and a value we check if the user has the key and if the value is the same as the given value
  //* examples:
  //* { key: 'admin', type: 'boolean' } -> checks if the user has the key admin and if the value is of type boolean
  //* { key: 'admin', value: true } -> checks if the user has the key admin and if the value is true   
  if (auth.additional) {
    for (const additional of auth.additional) {
      if (!additional?.key || (!additional?.type && !additional?.value)) { continue; }
      if (!user?.[additional.key]) { return { message: `found user doesnt have the right ${additional.key} value`, error: true } }
      if (additional.type && typeof user[additional.key] != additional.type) { return { message: `found user doesnt have the right ${additional.key} value`, error: true } }
      if (additional.value && user[additional.key] != additional.value) { return { message: `found user doesnt have the right ${additional.key} value`, error: true } }
    }
  }
  
  //* if the user has passed all the checks we call the api function and return the result

  const functionsObject = process.env.NODE_ENV == 'development' ? devFunctions : functions;
  const [error, result] = await tryCatch(async () => await api({ data, user, functions: functionsObject }));
  if (error) { console.log(error); return { message: error, error: true } }
  if (result) { return { result }; }

  return { message: 'api didnt return anything' }

}