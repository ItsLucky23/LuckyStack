import fs from 'fs';
import path from 'path';

const normalizePath = (p: string) => p.split(path.sep).join('/');

const walkApiFolders = (dir: string, results: string[] = []) => {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkApiFolders(fullPath, results);
    } else if (
      file.endsWith('.ts') &&
      (fullPath.includes('_api') || fullPath.includes('_sync'))
    ) {
      if (file.endsWith('_client.ts')) continue; // ❌ Skip client files
      results.push(fullPath);
    }
  }
  return results;
};

const walkFunctionFiles = (dir: string) => {
  const list = fs.readdirSync(dir);
  return list
    .filter((file) => file.endsWith('.ts'))
    .map((file) => normalizePath(path.join(dir, file)));
};

const apiFiles = walkApiFolders('./src');
const functionFiles = walkFunctionFiles('./server/functions');

let importStatements = '';
let apiMap = 'export const apis: Record<string, { auth: any, api: any }> = {\n';
let syncMap = 'export const syncs: Record<string, any> = {\n';
// let functionsInit = 'export const functions: Record<string, any> = {};\nexport const initializeFunctions = async () => {\n';
let functionsMap = 'export const functions: Record<string, any> = {\n';

let importCount = 0;

// Handle _api and _sync imports
apiFiles.forEach((filePath) => {
  const normalized = normalizePath(filePath);
  const importPath = '../' + normalized.replace(/\.ts$/, '');
  const varName = `api${importCount++}`;
  importStatements += `import * as ${varName} from '${importPath}';\n`;

  if (normalized.includes('_api')) {
    const match = normalized.match(/src\/(.+?)\/_api\/(.+)\.ts$/i);
    if (!match) return;
    const [_, pagePath, apiName] = match;
    const routeKey = `api-/${pagePath.replace(/\//g, '-')}-${apiName}`;
    apiMap += `  "${routeKey}": {\n    auth: ${varName}.auth || {},\n    api: ${varName}.api,\n },\n`;
  }

  if (normalized.includes('_sync') && normalized.endsWith('_server.ts')) {
    const match = normalized.match(/src\/(.+?)\/_sync\/(.+?)_server\.ts$/i);
    if (!match) return;
    const [_, pagePath, syncName] = match;
    const syncKey = `sync-/${pagePath.replace(/\//g, '-')}-${syncName}`;
    syncMap += `  "${syncKey}": ${varName}.default,\n`;
  }
});

// Handle server/functions imports
// functionFiles.forEach((filePath, i) => {
//   const importPath = '../' + filePath.replace(/\.ts$/, '');
//   const varName = `fn${i}`;
//   importStatements += `import * as ${varName} from '${importPath}';\n`;
//   functionsInit += `  Object.assign(functions, ${varName});\n`;
// });
functionFiles.forEach((filePath, i) => {
  const importPath = '../' + filePath.replace(/\.ts$/, '');
  const varName = `fn${i}`;
  importStatements += `import * as ${varName} from '${importPath}';\n`;
  functionsMap += `  ...${varName},\n`;
});

apiMap += '};\n';
syncMap += '};\n';
// functionsInit += '};\n';
functionsMap += '};\n';

// const output = `${importStatements}\n${apiMap}\n${syncMap}\n${functionsInit}`;
const output = `${importStatements}\n${apiMap}\n${syncMap}\n${functionsMap}`;

fs.writeFileSync('./server/generatedApis.ts', output);
console.log('✅ server/generatedApis.ts created');