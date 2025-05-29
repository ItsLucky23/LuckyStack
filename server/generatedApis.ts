import * as api0 from '../src/test/_sync/updateCounter_server';
import * as api1 from '../src/test/_api/testApi';
import * as fn0 from '../server/functions/tryCatch';
import * as fn1 from '../server/functions/db';
import * as fn2 from '../server/functions/session';

export const apis: Record<string, { auth: any, api: any }> = {
  "api-/test-testApi": {
    auth: api1.auth || {},
    api: api1.api,
 },
};

export const syncs: Record<string, any> = {
  "sync-/test/_sync/updateCounter_server-updateCounter_server": api0.default,
};

export const functions: Record<string, any> = {};
export const initializeFunctions = async () => {
  Object.assign(functions, fn0);
  Object.assign(functions, fn1);
  Object.assign(functions, fn2);
};
