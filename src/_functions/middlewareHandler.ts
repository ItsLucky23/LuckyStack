//* here you can add your own route
//* return an object with the success key set to true if the user is allowed to access the route
//* return an object with the redirect key set to the path you want to redirect the user to if you want to redirect the user to a different page
//* return nothing if the user is not allowed to access the route and it will be send back to its previous page
//* if you dont add your page in here it will allow the user to access the page
import notify from "src/_components/notify";

// @ts-ignore // we use ts-ignore because we dont use the searcParams in the example and this will cause a bundle error
export default function middlewareHandler({ location, searchParams, session }: { location: string, searchParams: Record<string, any>, session: Record<string, any> }) {
  switch (location) {
    case '/test':

      if (session?.email && session?.provider) { 
        return { success: true }; 
      }
      return { redirect: '/login' };

    case '/admin':

      if (session?.email && session?.provider && session?.admin === true) {
        return { success: true }; 
      } else if (!session?.email || !session?.provider) {
        return { redirect: '/login' };
      } else if (!session?.admin) { 
        notify.error('middleware.notAdmin');
      }
      return

    default:
      return { success: true };
  }
}