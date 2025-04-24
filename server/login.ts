import dotenv from 'dotenv';
import oauthProviders from "../config";
import { IncomingMessage, ServerResponse } from 'http';
import { URLSearchParams } from 'url';
import { tryCatch } from './functions/tryCatch';
import { prisma } from './functions/db';
import { Prisma, PROVIDERS } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { saveSession } from "./functions/session"
import validator from "validator"

dotenv.config();

type paramsType = {
  email?: string,
  password?: string,
  name?: string,
  confirmPassword?: string,
}
// Route that starts the OAuth flow for the specified provider and redirects to the callback endpoint
const loginWithCredentials = async (params: paramsType) => {

  const email = validator.escape(params.email);
  const password = validator.escape(params.password);
  const name = params.name ? validator.escape(params.name) : undefined;
  const confirmPassword = params. confirmPassword ? validator.escape(params.confirmPassword) : undefined;

  console.log(name, email, password, confirmPassword)
  
  if (!email || !password) { return { status: false, reason: 'no email or password provided' }; }
  if (email.length > 191) { return { status: false, reason: 'email cant be longer than 191 characters' }; }
  if (password.length < 8) { return { status: false, reason: 'password must be at least 8 characters long' }; }
  if (password.length > 191) { return { status: false, reason: 'password cant be longer than 191 characters' }; }
  if (name && name.length > 191) { return { status: false, reason: 'name cant be longer than 191 characters' }; }
  if (!validator.isEmail(email)) { return { status: false, reason: 'Invalid email format' }; }

  if (name && confirmPassword) { //* register
    if (password != confirmPassword) { return { status: false, reason: 'passwords do not match' }; }

    const checkEmail = async () => {
      return await prisma.user.findFirst({
        where: {
          email: email,
          provider: PROVIDERS.credentials
        },
      })
    }

    //* check if email already exists
    const [checkEmailError, checkEmailResponse] = await tryCatch(checkEmail);
    if (checkEmailError) { return { status: false, reason: checkEmailError }; }
    if (checkEmailResponse) { return { status: false, reason: 'email already exists' }; }

    //* email is not in use so we define the function to create the new user
    const createNewUser = async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      return await prisma.user.create({
        data: {
          email: email,
          provider: PROVIDERS.credentials,
          name: name,
          password: hashedPassword
        }
      }) 
    }

    //* here we create the new user
    const [createNewUserError, createNewUserResponse] = await tryCatch(createNewUser);
    if (createNewUserError) { return { status: false, reason: createNewUserError }; }
    if (createNewUserResponse) { return { status: true, reason: 'user created', userId: createNewUserResponse.id }; }
    return { status: false, reason: 'failed to create new user' };

  } else { //* login
    //* here we define the function to find the user
    const findUser = async () => {
      return await prisma.user.findFirst({
        where: {
          email: email,
          provider: PROVIDERS.credentials
        }, select: {
          id: true,
          name: true,
          email: true,
          provider: true,
          password: true,
          createdAt: true,
          updatedAt: true,
        } 
      }) 
    }

    //* attempt to find the user
    const [findUserError, findUserResponse] = await tryCatch(findUser);
    if (findUserError) { return { status: false, reason: findUserError }; }
    if (!findUserResponse) { return { status: false, reason: 'user not found' }; }

    //* if we found a user we check if the password matches the hashed one in the db
    const checkPassword = async () => { return await bcrypt.compare(password, findUserResponse.password as string); }
    const [checkPasswordError, checkPasswordResponse] = await tryCatch(checkPassword);
    if (checkPasswordError) { return { status: false, reason: checkPasswordError }; }
    if (!checkPasswordResponse) { return { status: false, reason: 'password does not match' }; }

    //* if the password matches we return the user
    if (checkPasswordResponse) {
      const newToken = randomBytes(32).toString("hex")
      await saveSession(newToken, { 
        id: findUserResponse.id,
        name: findUserResponse.name,
        provider: 'credentials',
        email: findUserResponse.email,
        createdAt: findUserResponse.createdAt,
        updatedAt: findUserResponse.updatedAt,
        token: newToken,
        avatar: undefined
      });
      return { status: true, reason: 'user logged in', newToken };
    }
  }
}

// Route that handles the callback from the OAuth provider
const loginCallback = async (pathname: string, req: IncomingMessage, res: ServerResponse) => {
  //* check if provider exists
  const providerName = pathname.split('/')[3]; // Extract the provider (google/github)
  const provider = oauthProviders.find(p => p.name === providerName);
  if (!provider || !req.url) { return false }
  if (!('clientID' in provider)) { return }

  const queryString = req.url.split('?')[1]; // Get the part after '?'
  const params = new URLSearchParams(queryString);
  const code = params.get('code');

  //* if no code provided in the url we return false (the code is used to get the access token and should be provided by the oauth provider)
  if (!code || code == '') { 
    console.log('no code provided in callback url')
    return false 
  }
  console.log('code: ', code)

  const values = {
    code,
    client_id: provider.clientID,
    client_secret: provider.clientSecret,
    redirect_uri: provider.callbackURL,
    grant_type: 'authorization_code'
  }

  console.log(values) //* log the values to the terminal

  //* with the code we can get the access token
  const getToken = async () => {
    if (provider.tokenExchangeMethod == 'json') {
      const url = provider.tokenExchangeURL;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(values),
      })
      return await response.json();
    } else if (provider.tokenExchangeMethod == 'form') {
      const url = provider.tokenExchangeURL;
      const params = new URLSearchParams();
      params.append('client_id', provider.clientID);
      params.append('client_secret', provider.clientSecret);
      params.append('code', values.code);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', provider.callbackURL);
    
      console.log(params)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params.toString()
      });
    
      return await response.json();
    }
  }

  const [getTokenError, getTokenResponse] = await tryCatch(getToken)
  if (getTokenError) {
    console.log(getTokenError);
    return false;
  }

  console.log('getTokenResponse: ')
  console.log(getTokenResponse)

  //* here we get the access token
  const { access_token, id_token } = getTokenResponse;
  const getUserData = async () => {
    // const url = `${provider.userInfoURL}?alt=json&access_token=${access_token}`;
    const url = provider.userInfoURL;
    console.log(url)
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

  //* with the access_token token we get the user data 
  const [getUserDataError, getUserDataResponse] = await tryCatch(getUserData);
  if (getUserDataError) {
    console.log(getUserDataError);
    return false;
  }

  console.log('getUserDataResponse: ')
  console.log(getUserDataResponse)

  const name: string = getUserDataResponse[provider.nameKey] || 'didnt find a name'

  const email: string | undefined = getUserDataResponse[provider.emailKey];
  const avatar: string | undefined = 
    provider?.avatarKey ? getUserDataResponse[provider.avatarKey] : 
    provider.getAvatar ? provider.getAvatar({userData: getUserDataResponse, avatarId: getUserDataResponse[provider.avatarCodeKey]}) : 
    undefined;

  const user = {
    id: '',
    name,
    provider: provider.name,
    email,
    createdAt: new Date(),
    updatedAt: new Date(),
    token: '',
    avatar
  }

  //* if we didnt find the email we try to get it with a external link if this one is provided
  if (!email && provider.getEmail) {
    const selectedEmail = await provider.getEmail(access_token);
    
    if (!selectedEmail) {
      console.log('no email found');
      return false; 
    }

    user.email = selectedEmail;
  }

  let tempUser: {id: string, createdAt: Date, updatedAt: Date} | undefined;
  if (user && user.email) {
    const fetchUser = async () => {
      return await prisma.user.findFirst({
        where: {
          email: user.email,
          provider: user.provider as PROVIDERS
        }
      })
    } 

    //* here we check if the user exists in the db
    const [userDataError, userDataResponse] = await tryCatch(fetchUser);
    if (userDataError) {
      console.log(userDataError);
      return false;
    }

    //* if the user exists we assign it to the tempUser variable
    if (userDataResponse?.id) { tempUser = userDataResponse; }

    //* if the user doesnt exist we create a new one
    if (!tempUser) {
      const createNewUser = async () => {
        if (!user.email) { return false; }
        return await prisma.user.create({
          data: {
            email: user.email,
            provider: user.provider as PROVIDERS,
            name: user.name,
          }
        })
      }
      const [createNewUserError, createNewUserResponse] = await tryCatch(createNewUser);
      if (createNewUserError) {
        console.log(createNewUserError);
        return false;
      }

      if (createNewUserResponse) { tempUser = createNewUserResponse; }
    }
  }

  // user.id = userId;
  if (!tempUser) {
    return false;
  }

  //* here we create a new token, create the users session and return the token as a sign of success
  const newToken = randomBytes(32).toString("hex")
  user.id = tempUser.id;
  user.createdAt = tempUser.createdAt;
  user.updatedAt = tempUser.updatedAt;
  user.token = newToken;

  await saveSession(newToken, user);
  console.log(user)
  return newToken;
}

export { loginWithCredentials, loginCallback }