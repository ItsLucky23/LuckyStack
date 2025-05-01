import { PrismaClient } from '@prisma/client';

type Functions = {
  prisma: PrismaClient;

  saveSession: (sessionId: string, data: any) => Promise<boolean>;
  getSession: (sessionId: string) => Promise<any | null>;
  deleteSession: (sessionId: string) => Promise<boolean>;

  tryCatch: <T, P>(func: (values: P) => Promise<T> | T, params?: P) => Promise<[any, T | null]>;

  [key: string]: any; // allows for other functions that are not defined as a type but do exist in the functions folder
};

type ApiParams = {
  data: Record<string, any>;
  functions: Functions;
  user: Record<string, any>;
};


const auth = {
  login: true, // if true than it will check if your session data contains the values you get when logging in, the values that are on default applied to your session are stored in the config.ts file in the userData array 
  additional: [ // you can add additional checks to your session, below we check if the user that called the api is an admin
    // { key: 'admin', value: true }
  ]
}

const api = async ({ data, functions, user }: ApiParams) => {
  console.log(user)
  console.log('you just called the randomApi.ts')
  return { success: true, result: {} }
}

export { auth, api }