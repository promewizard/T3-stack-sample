import type { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  
  getUserByUsername: publicProcedure
    .input( z.object({
      username: z.string(),
    }))
    .query( async ({ input }) => {
      const { username } = input;
      const [user] = await clerkClient.users.getUserList({ username: [username] });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return filterUserForClient(user);
    })
});

