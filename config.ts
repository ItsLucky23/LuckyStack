const config = {
  backendUrl: 'http://localhost:80', //* the url of the backend server
  dev: true, //* if true then we get extra console logs
  loginPageUrl: '/login', //* url the client is redirected to when the user is not authenticate
  loginRedirectUrl: '/test', //* url the client is redirected to after logging in
  defaultLanguage: 'en', //* default language if the session data doesnt include it, this is used with the notify system with the json files in the localed folder
}
//* these values are optional to have in the session object, used for type declartion after an apiRequest on the client
export type sessionLayout = Partial<{
  id: string;
  name: string;
  provider: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  token: string;
  avatar: string;
  language: string;
  location: {
    pathname: string;
    searchParams: {
      [key: string]: string;
    };
  };
}>;

//* these values should always be in the session object
//* they can be false but just not undefined or null
//* if you want the user to have a default session value you need to add it here and edit the login.ts file in the server folder.
//* most cases you want to add an optional value and you want to do this in the sessionLayout type
//* but if you want to add a required value it needs to be done here in the minimalSessionLayout array and in the login logic in the login.ts file in the server folder
export const minimalSessionLayout = ['id', 'name', 'provider', 'email', 'createdAt', 'updatedAt', 'token', 'avatar', 'language'];
export const providers = ['credentials', 'google', 'github', 'facebook', 'discord'];

export default config;
export const { backendUrl, dev, loginPageUrl, loginRedirectUrl, defaultLanguage } = config;