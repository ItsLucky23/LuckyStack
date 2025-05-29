import fs from "fs";
import path from "path";
import { tryCatch } from "./functions/tryCatch";
// import { functions } from "./generatedApis";

//* here we scan the server/functions folder for any file that has the file extension .ts and store all exports of each file in the functions object
export const devFunctions = {};
export const initializeFunctions = async () => {
  const functionsFolder = fs.readdirSync(path.resolve('./server/functions'));
  Object.assign(devFunctions, {});

  for (const file of functionsFolder) {
    const fileHandler = path.posix.join('./server/functions', file);
    if (fs.statSync(fileHandler).isFile() && file.endsWith('.ts')) {
      // let func;
      // if (process.env.NODE_ENV == 'development') { 
        //* if we are in development mode, we add a query parameter to the import to force a reload of the module
      const func = await import(`../${fileHandler}?update=${Date.now()}`)
      // } else { 
        // func = await import(`../${fileHandler}`) 
      // }
      const [error, result] = await tryCatch(async() => func )
      if (error) { console.log(error); return; }
      for(const func in result) {
        devFunctions[func] = result[func];
      }
    }
  }
}