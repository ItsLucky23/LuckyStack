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

<<<<<<< Updated upstream
  avatarKey?: string, //* the avatarKey represent the url to the img
  avatarCodeKey: string, //* the avatarCodeKey should be the key representing the avatar id if the provider doesnt give the avatar url directly, we use the getAvatar function with this value together
  // getAvatar?: (userId: number, avatarId: string) => string | undefined
  getAvatar?: ({userData, avatarId}: {userData: Record<string, any>, avatarId: string}) => any
}

type oauthProvidersProps = | BasicProvider | (Required<FullProvider>); 

const backendUrl = process.env.NODE_ENV == 'development' ? `http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}` : 
                                                           `http${process.env.SECURE == 'true' ? 's' : ''}://${process.env.DNS}` 
const oauthProviders: oauthProvidersProps[] = [
  {
    name: 'credentials',
  },
  {
    name: 'google',
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${backendUrl}/auth/callback/google`,
    authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenExchangeURL: 'https://oauth2.googleapis.com/token',
    tokenExchangeMethod: 'json',
    userInfoURL: 'https://www.googleapis.com/oauth2/v1/userinfo',
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ],
    nameKey: 'name',
    emailKey: 'email',
    avatarKey: 'picture'
  },
  {
    name: 'github',
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${backendUrl}/auth/callback/github`,
    authorizationURL: 'https://github.com/login/oauth/authorize',
    tokenExchangeURL: 'https://github.com/login/oauth/access_token',
    tokenExchangeMethod: 'json',
    userInfoURL: 'https://api.github.com/user',
    scope: ['read:user', 'user:email'],
    nameKey: 'login',
    emailKey: 'email',
    avatarKey: 'avatar_url',
    getEmail: async (access_token: string) => {
      const getEmail = async () => {
        const url = 'https://api.github.com/user/emails';
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
          },
        })
        return await response.json(); 
      }
  
      const [getEmailError, getEmailResponse] = await tryCatch(getEmail);
      if (getEmailError) {
        console.log(getEmailError);
        return false;
      }
  
      //* if we found the email we set it to the user object
      let mainEmail: string | undefined;
      if (!getEmailResponse) { return false; }
      for (const email of getEmailResponse) {
        if (email.primary) { mainEmail = email.email; }
      }
      if (!mainEmail) { mainEmail = getEmailResponse?.[0]?.email; }
      return mainEmail;
    },
  },
  {
    name: 'discord',
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: `${backendUrl}/auth/callback/discord`,
    authorizationURL: 'https://discord.com/oauth2/authorize',
    tokenExchangeURL: 'https://discord.com/api/oauth2/token',
    tokenExchangeMethod: 'form',
    userInfoURL: 'https://discord.com/api/users/@me',
    scope: [
      "identify",
      'email',
    ],
    nameKey: 'username',
    emailKey: 'email',
    avatarCodeKey: 'avatar',
    getAvatar: ({userData, avatarId}: {userData: Record<string, any>, avatarId: string}) => {
      if (!avatarId) {
        // Default avatar (based on discriminator % 5)
        // const defaultAvatarIndex = userId % 5;
        // return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
        return undefined;
      }
      const userId = userData.id;
      const format = avatarId.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.${format}`;
    }
  },
  {
    name: 'facebook',
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: `${backendUrl}/auth/callback/facebook`,
    authorizationURL: 'https://www.facebook.com/v10.0/dialog/oauth',
    tokenExchangeURL: 'https://graph.facebook.com/v10.0/oauth/access_token',
    tokenExchangeMethod: 'form',
    // userInfoURL: 'https://graph.facebook.com/me?fields=id,name,email',
    userInfoURL: 'https://graph.facebook.com/me?fields=id,name,email,picture.type(large)',
    scope: ['public_profile', 'email'],
    nameKey: 'name',
    emailKey: 'email',
    getAvatar: ({userData}: {userData: Record<string, any>}) => {
      return userData?.picture?.data?.url || undefined;
    }
  },
  // {
  //   name: 'apple',
  //   clientID: process.env.APPLE_CLIENT_ID,
  //   clientSecret: process.env.APPLE_CLIENT_SECRET,
  //   callbackURL: `${backendUrl}/auth/callback/apple`,
  //   authorizationURL: 'https://appleid.apple.com/auth/authorize',
  //   tokenExchangeURL: 'https://appleid.apple.com/auth/token',
  //   userInfoURL: 'https://appleid.apple.com/auth/userinfo',
  //   scope: ['name', 'email'],
  // },
  // {
  //   name: 'x',
  //   clientID: process.env.X_CLIENT_ID,
  //   clientSecret: process.env.X_CLIENT_SECRET,
  //   callbackURL: `${backendUrl}/auth/callback/twitter`,
  //   authorizationURL: 'https://twitter.com/i/oauth2/authorize',
  //   tokenExchangeURL: 'https://api.twitter.com/2/oauth2/token',
  //   tokenExchangeMethod: 'form',
  //   userInfoURL: 'https://api.twitter.com/2/users/me',
  //   scope: [
  //     'tweet.read',
  //     'users.read',
  //     'users.email',
  //     'offline.access' // optional: allows you to get refresh tokens
  //   ],
  //   nameKey: 'name',
  //   emailKey: 'email',
  // }
  // {
  //   name: 'instagram',
  //   clientID: process.env.INSTAGRAM_CLIENT_ID,
  //   clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  //   callbackURL: `${backendUrl}/auth/callback/instagram`,
  //   authorizationURL: 'https://api.instagram.com/oauth/authorize',
  //   tokenExchangeURL: 'https://api.instagram.com/oauth/access_token',
  //   tokenExchangeMethod: 'form',
  //   userInfoURL: 'https://graph.instagram.com/me?fields=id,username,email',
  //   scope: ['user_profile', 'user_media'],
  //   nameKey: 'username', // Instagram uses 'username' instead of 'name'
  //   emailKey: 'email',
  // },
];

// the data that every user should have, for example some systems have an admin value that is optional so we dont add admin but in an api request you can add this in additional 
// only remove the id, email or provider if you know what you are doing because they are used to identify the user (e.g email and provider identifitcation allow for mutliple accounts with the same email for example your google and facebook account)
export const userdata = [
  'id',
  'name',
  'email',
  'provider',
]

export default oauthProviders;
=======
export default config;
export const { backendUrl, dev, loginPageUrl, loginRedirectUrl, defaultLanguage } = config;
>>>>>>> Stashed changes
