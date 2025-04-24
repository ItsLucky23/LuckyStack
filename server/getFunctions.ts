import fs from "fs";
import path from "path";
import { tryCatch } from "./functions/tryCatch";

//* here we scan the server/functions folder for any file that has the file extension .ts and store all exports of each file in the functions object
export const functions = {};
export const initializeFunctions = async () => {
  const functionsFolder = fs.readdirSync(path.resolve('./server/functions'));
  Object.assign(functions, {});

  for (const file of functionsFolder) {
    const fileHandler = path.posix.join('./server/functions', file);
    if (fs.statSync(fileHandler).isFile() && file.endsWith('.ts')) {
      const [error, result] = await tryCatch(async() => await import(`../${fileHandler}`))
      if (error) { console.log(error); return; }
      for(const func in result) {
        functions[func] = result[func];
      }
    }
  }
}