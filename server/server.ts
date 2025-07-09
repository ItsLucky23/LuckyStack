import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
// import { initializeApis } from "./handleApiRequest";
// import { initializeFunctions } from "./getFunctions";
import getParams from './getParams';
import { loginWithCredentials, loginCallback } from './login';
import { serveFavicon, serveFile } from './serveFile';
// import { initializeSyncFiles } from './handleSyncRequest';
import loadSocket from './socket';
import z from 'zod';
import oauthProviders from "./loginConfig";
import { clearAllSessions, deleteSession, getAllSessions, getSession } from './functions/session';
import allowedOrigin from './checkOrigin';
import repl from 'repl';
import { sessionLayout } from '../config';

const originalLog = console.log;
console.log = (...args: any[]) => {
    const stack = new Error().stack?.split('\n')[2].trim();
    if (stack) {
      let lineInfo = stack.substring(stack.indexOf('(') + 1, stack.lastIndexOf(')'));
      if (lineInfo == '') { lineInfo = stack; }
      const extractedInfo = lineInfo.substring(lineInfo.lastIndexOf('\\') + 1).replace(/:\d+$/, '');
    
      if (typeof args[0] == 'object') {
        originalLog(extractedInfo);
        originalLog(args);
      } else {
        originalLog(`${extractedInfo} -- ${args.join(' ')}`);
      }
    } else {
      originalLog('No stack trace information available');
      originalLog(...args);
    }
};

const ServerRequest = async (req: http.IncomingMessage, res: http.ServerResponse) => {

  const origin = req.headers.origin || req.headers.referer || req.headers.host || '';

  if (!allowedOrigin(origin)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Forbidden');
  }
  
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader('Referrer-Policy', 'no-referrer'); // prevents the browser from leaking sensative urls
  // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); // tells the browser to only use https
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // only allows iframes to use this pages content if on the same domain
  res.setHeader('X-XSS-Protection', '1; mode=block'); // prevents some xss attacks
  res.setHeader('X-Content-Type-Options', 'nosniff'); // prevents mimetype sniffing, this means that when sending a txt file it will not try to execute it as ddl if the user requested this

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const method = req.method;
  const url = req.url || '/';
  const [routePath, queryString] = url.split('?');

  if (method !== 'GET' && method != 'POST' && method != 'PUT' && method != 'DELETE') {
    // if the method is not GET, POST, PUT or DELETE then it will return 404
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    return res.end(`method: ${method} not supported, use one of the following methods: GET, POST, PUT, DELETE`);
  }

  const cookieHeader = req.headers.cookie || '';
  const token = cookieHeader
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];


  //* here we load the application icon
  if (z.literal('/favicon.ico').safeParse(routePath).success) {
    return serveFavicon(res);
  }

  //* here we get the params from the request
  let params: object | null;
  params = await getParams({ method, req, res, queryString });

  //* we log the request and if there are any params we log them with the request
  if (params && typeof params == 'object' && Object.keys(params).length !== 0) { 
    console.log(`method: ${method}, url: ${routePath}, params: ${JSON.stringify(params)}`) 
  } else { 
    console.log(`method: ${method}, url: ${routePath}`); 
    params = {}; 
  }

  //* triggers when logging in
  //* when using the credentials provider all the logic happends here else we redirect to the oauth provider and all the logic happends in the auth/callback api
  if (z.string().startsWith('/auth/api').safeParse(routePath).success) {
    const providerName = routePath.split('/')[3]; // Extract the provider (google/github)
    const provider = oauthProviders.find(p => p.name === providerName);
    if (!provider || !provider.name) { return { provider, status: false, reason: 'login.providerNotFound' }; }

    if (provider?.name != 'credentials' && 'scope' in provider) {
      res.writeHead(302, {
        'Location': `${provider.authorizationURL}?client_id=${provider.clientID}&redirect_uri=${provider.callbackURL}&scope=${provider.scope.join('%20')}&response_type=code&prompt=select_account`,
      });
      return res.end(); 
    }

    //* here all the logic happends for login or creating an account with credentials
    const { status, reason, newToken, session } = await loginWithCredentials(params) as {
      status: boolean,
      reason: string,
      newToken: string | null,
      session: sessionLayout | undefined
    }

    //* if it failed to either login or creating an account then we return
    if (!status) {
      res.setHeader("content-type", "application/json; charset=utf-8");
      return res.end(JSON.stringify({ status, reason: reason || 'internal server error' }));
    }

    //* if it was successful then we apply the cookie and return the user id and reason for the login or account creation
    if (newToken) { 
      if (token) { await deleteSession(token); }

      console.log('setting cookie with newToken: ', newToken);
      // const cookieOptions = process.env.NODE_ENV == "development" ? 
      //   "HttpOnly; SameSite=Strict; Path=/; Max-Age=604800;": 
      //   "HttpOnly; SameSite=Strict; Path=/; Max-Age=604800; Secure;";
      const cookieOptions = `HttpOnly; SameSite=Strict; Path=/; Max-Age=604800; ${process.env.SECURE == 'true' ? "Secure;" : ""}`

      res.setHeader("Set-Cookie", `token=${newToken}; ${cookieOptions}`);
      // return res.end(JSON.stringify({ status, reason, session })) 
    // } else { 
    }
    return res.end(JSON.stringify({ status, reason, session, newToken })) 

  } else if (z.string().startsWith('/auth/callback').safeParse(routePath).success) {
    //* this endpoint is triggerd by the oauth provider after the user has logged in
    const newToken = await loginCallback(routePath, req, res);

    //* if it failed to either login or creating an account then we return
    if (!newToken) {
      res.writeHead(401, { "Content-Type": "text/plain" });
      return res.end('Login failed');
    }

    //* we successfully logged in or created an acocunt

    //* if the user already had a token then we delete the previous session data
    if (token) { await deleteSession(token); }

    //* we set the cookie with the new token and redirect the user to the frontend
    console.log('setting cookie with newToken: ', newToken);
    // const cookieOptions = process.env.NODE_ENV == "development" ? 
    //   "HttpOnly; SameSite=Strict; Path=/; Max-Age=604800;": 
    //   "HttpOnly; SameSite=Strict; Path=/; Max-Age=604800; Secure;";
    const cookieOptions = `HttpOnly; SameSite=Strict; Path=/; Max-Age=604800; ${process.env.SECURE == 'true' ? "Secure;" : ""}`
      
    const location = process.env.DNS

    if (process.env.VITE_SESSION_BASED_TOKEN == 'true') {
      // server-side after OAuth success
      res.writeHead(302, {
        Location: `${process.env.DNS}?token=${newToken}`,
      });
    } else {
      res.setHeader("Set-Cookie", `token=${newToken}; ${cookieOptions}`);
      res.writeHead(302, { Location: location }); // Redirect without exposing token in URL
    }
    return res.end();

  } else if (z.string().startsWith('/auth/logout').safeParse(routePath).success) {
    //* this endpoint is triggerd by the frontend when the user logs out
    console.log('logout user with token: ', token);

    //* if the user didnt have a token but called the logout endpoint then we just return ok
    if (!token) { return res.end('ok') }

    //* here we delete the session data of the user and delete the cookie and return ok
    await deleteSession(token);
    res.setHeader('Set-Cookie', 'token=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict');
    return res.end('ok');

  } else if (z.string()
    .regex(/^\/(assets\/[a-zA-Z0-9_\-/]+|[a-zA-Z0-9_\-]+)\.(png|jpg|jpeg|gif|svg|html|css|js)$/)
    .safeParse(routePath).success) {
    //* if the request is a file with one of the following extensions then we serve it
    //* png|jpg|jpeg|gif|svg|html|css|js
    return serveFile(req, res); 

  } else { // for the index.html
    //* if the request doesnt fit any of the above then we serve the index.html file
    return serveFile({url: '/'}, res);
  }
}

// const ip: string = '0.0.0.0';
const ip: string = process.env.SERVER_IP || '127.0.0.1';
const port: string = process.env.SERVER_PORT || '80';
// await initializeFunctions();
// await initializeApis();
// await initializeSyncFiles();
const httpServer = http.createServer(async(req, res) => { ServerRequest(req, res) });
loadSocket(httpServer);
// @ts-ignore // typescript thinks ip needs to be a number
httpServer.listen(port, ip, () => {
  console.log(`Server is running on http://${ip}:${port}/`); 
});

const replInstance = repl.start({
  prompt: 'server> ',
  useColors: true,
  useGlobal: true,
})

replInstance.context.getSession = async (token: string) => {
  if (!token) {
    console.log(await getAllSessions())
    return;
  }

  const session = await getSession(token)
  if (typeof session == 'object' && Object.keys(session).length > 0) {
    console.log(session) 
  } else {
    console.log('no session found')
  }
}

replInstance.context.deleteSession = async (token: string) => {
  if (!token) {
    console.log(await clearAllSessions())
    return;
  } 

  const result = await deleteSession(token)
  console.log(result)
}

replInstance.context.commands = () => {
  console.log('commands:')
  console.log('getSession(token) -- if no token provided then it will return all sessions')
  console.log('deleteSession(token) -- if no token provided then it will delete all sessions')
}