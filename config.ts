const config = {
  backendUrl: 'http://localhost:80', //* the url of the backend server
  dev: true, //* if true then we get extra console logs
  loginPageUrl: '/login', //* url the client is redirected to when the user is not authenticate
  loginRedirectUrl: '/test', //* url the client is redirected to after logging in
  defaultLanguage: 'en', //* default language if the session data doesnt include it, this is used with the notify system with the json files in the localed folder
}
//* these values are optional to have in the session object, used for type declartion after an apiRequest on the client
export interface sessionLayout {
  id: string;
  name: string;
  email: string;
  provider: string;
  admin: boolean;
  avatar: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  token?: string;
  location?: {
    pathname: string;
    searchParams: {
      [key: string]: string;
    };
  };
};

export interface authSetup {
  login: boolean; //* if true then the user needs to have an id in the session object
  additional?: { //* if true then the user needs to have the additional keys in the session object with the condition
    key: keyof sessionLayout; //* the key of the session object
    value?: any //* the exact value the key needs to have. this is a strict comparison
    type?: 'string' | 'number' | 'boolean'; //* the type of the key. this is a strict comparison
    nullish?: boolean; //* if true then the key needs to be null or undefined, if false then the key needs to be not null and not undefined
    mustBeFalsy?: boolean; //* if true than the passes key needs to be a false value such as false, 0, -0, 0n, "", null, undefined or NaN, if false then the key needs to be a true value such as true, 1, 'a' or any other value
  }[]
}

export const providers = ['credentials', 'google', 'github', 'facebook', 'discord'];

export default config;
export const { backendUrl, dev, loginPageUrl, loginRedirectUrl, defaultLanguage } = config;