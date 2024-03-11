import { authMiddleware } from "@clerk/nextjs";
import { withClerkMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/"],
});

// export default withClerkMiddleware(() => {
//   return NextResponse.next();
// });

// export default authMiddleware({
//   // Routes that can be accessed while signed out
//   publicRoutes: ["/anyone-can-visit-this-route"],
//   // Routes that can always be accessed, and have
//   // no authentication information
//   ignoredRoutes: ["/no-auth-in-this-route"],
// });
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};