const config = {
  backendUrl: 'http://localhost:80', //* the url of the backend server
  // backendUrl: 'http://192.168.178.68:80', //* the url of the backend server
  dev: true, //* if true then we get extra console logs
  loginPageUrl: 'login',
  loginRedirectUrl: '/',
};

export const providers = [
  'credentials',
  'google',
  'github',
  'facebook',
  'discord',
  // 'x',
  // 'linkedIn',
  // 'apple',
  // 'instagram',
]

export type sessionLayout = Partial<{
  id: string;
  name: string;
  provider: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  token: string;
  avatar: string;
  location: {
    pathname: string;
    searchParams: {
      [key: string]: string;
    };
  };
}>;

export default config;
export const { backendUrl, dev } = config;