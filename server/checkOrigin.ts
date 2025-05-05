const allowedOrigin = (origin: string) => {
  const location = `http${process.env.SECURE == 'true'?'s' : ''}://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/`;
  const formattedOrigin = origin.includes('://') ? origin : `http://${origin}/`;
    
  // console.log(location, ' server location')
  // console.log(formattedOrigin, ' formatted origin')

  //* we check if the origin of the user is allowed to access the server directly
  if (location == formattedOrigin) { return true; } 

  //* if the server is in development mode we check if the origin is from the FRONTEND_URL
  if (process.env.NODE_ENV == 'development') {
    const frontendURL = process.env.FRONTEND_URL || '/'
    if (frontendURL == formattedOrigin) { return true; }
  }

  //* if the origin is not allowed we check if the origin is allowed we port 80 or port 443 cause the browser removes these sometimes
  const parsedUrl = new URL(formattedOrigin);
  const urlWithPort80 = `${parsedUrl.protocol}//${parsedUrl.hostname}:80${parsedUrl.pathname}`;
  const urlWithPort443 = `${parsedUrl.protocol}//${parsedUrl.hostname}:443${parsedUrl.pathname}`;
  // console.log(urlWithPort443, ' url with port 443')
  // console.log(urlWithPort80, ' url with port 80')
  if (location == urlWithPort443 && process.env.SECURE == 'true') { return true; }
  if (location == urlWithPort80 && process.env.SECURE != 'true') { return true; }

  console.log('origin not allowed')
  console.log(origin)
  console.log(formattedOrigin)
  console.log(location)
  console.log(urlWithPort443)
  console.log(urlWithPort80)
  return false;
}

export default allowedOrigin;