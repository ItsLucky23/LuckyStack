import { PrismaClient } from '@prisma/client';

interface Functions {
  prisma: PrismaClient;

  saveSession: (sessionId: string, data: any) => Promise<boolean>;
  getSession: (sessionId: string) => Promise<any | null>;
  deleteSession: (sessionId: string) => Promise<boolean>;

  tryCatch: <T, P>(func: (values: P) => Promise<T> | T, params?: P) => Promise<[any, T | null]>;

  [key: string]: any; // allows for other functions that are not defined as a type but do exist in the functions folder
};

interface ApiParams {
  data: Record<string, any>;
  functions: Functions;
  user: Record<string, any>;
};


const auth = {
  login: true, //* checks if the user session data has values. the values the sesssion object needs to have to pass the check are stored in the config.ts file in the minimalSessionLayout array 
  additional: [ // you can add additional checks to your session, below we check if the user that called the api is an admin
    // { key: 'admin', value: true }
  ]
}

const api = async ({ data, functions, user }: ApiParams) => {
  console.log(data)
  console.log(functions)
  console.log(user)
  console.log('you just called the randomApi.ts')
  return { success: true, result: {} }
}

export { auth, api }