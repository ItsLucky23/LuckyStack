//* here you can add your own route
//* return an object with the success key set to true if the user is allowed to access the route
//* return an object with the redirect key set to the path you want to redirect the user to if you want to redirect the user to a different page
//* return nothing if the user is not allowed to access the route and it will be send back to its previous page
//* if you dont add your page in here it will allow the user to access the page

export default function middlewareHandler({ location, session }: { location: string, session: Record<string, any> }) {
  switch (location) {
    case '/test':
      if (session?.email && session?.provider) { return { success: true }; }
      return { redirect: '/login' };

    case '/admin':

      if (session?.admin) { return { success: true }; }
      return;

    default:
      return { success: true };
  }
}