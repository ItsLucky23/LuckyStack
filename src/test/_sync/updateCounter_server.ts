import { PrismaClient } from '@prisma/client';

type Functions = {
  prisma: PrismaClient;

  saveSession: (sessionId: string, data: any) => Promise<boolean>;
  getSession: (sessionId: string) => Promise<any | null>;
  deleteSession: (sessionId: string) => Promise<boolean>;

  tryCatch: <T, P>(func: (values: P) => Promise<T> | T, params?: P) => Promise<[any, T | null]>;

  [key: string]: any; // allows you to call functions you made yourself, autocomplete wont work for your own functions if you dont add them here
};

type SyncParams = {
  data: Record<string, any>;
  functions: Functions;
  user: Record<string, any>;
};

export default function removeCard({ data, user, functions }: SyncParams) {
  console.log(data)
  console.log(functions)
  console.log(user)
  if (user?.location?.pathName == '/test') {
    return true;
  }
}