import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import superjson from "superjson";

export const generateSSGHelper = ()=> {
    const ssg = createServerSideHelpers({
      router: appRouter,
      ctx: { db, userId: null },
      transformer: superjson,
    });
    return ssg;
}