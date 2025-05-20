const allowedOrigin = (origin: string) => {
  const location = `http${process.env.SECURE == 'true'?'s' : ''}://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/`;
  const formattedOrigin = origin.includes('://') ? origin : `http${process.env.SECURE == 'true' ? 's' : ''}://${origin}/`;
    
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

  if (location == urlWithPort443 && process.env.SECURE == 'true') { return true; }
  if (location == urlWithPort80 && process.env.SECURE != 'true') { return true; }

  const externalOrigins = process.env.EXTERNAL_ORIGINS?.split(',') || [];
  for (const externalOrigin of externalOrigins) {
    if (origin == externalOrigin) { return true; }
    if (formattedOrigin == externalOrigin) { return true; }
    if (urlWithPort443 == externalOrigin && process.env.SECURE == 'true') { return true; }
    if (urlWithPort80 == externalOrigin && process.env.SECURE != 'true') { return true; }
  }

  console.log('')
  console.log('origin not allowed')
  console.log('origin:', origin)
  console.log('formattedOrigin:', formattedOrigin)
  console.log('location:', location)
  console.log('urlWithPort443:', urlWithPort443)
  console.log('urlWithPort80:', urlWithPort80)
  for (const externalOrigin of externalOrigins) {
    console.log('externalOrigin:', externalOrigin)
  }
  return false;
}

export default allowedOrigin;