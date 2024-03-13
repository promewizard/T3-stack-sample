import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type {Post} from "@prisma/client";


const addUserDataToPosts = async (posts:Post[]) =>{
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);
    if (!author) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Author not found",
      });
    }
    return {
      ...post,
      author,
    }});



}

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postRouter = createTRPCRouter({

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const postId = Number(input.id);

    if (isNaN(postId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid post ID",
      });
    }
    const post = await ctx.db.post.findUnique({
      where: { id: postId },
    });
    if(!post) throw new TRPCError({code:"NOT_FOUND"});

    return (await addUserDataToPosts([post]))[0]; 
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    return addUserDataToPosts(posts);
  }),

  getPostsByUserId: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    const posts = await ctx.db.post.findMany({
      where: {
        authorId: input.userId
      },
      take: 100,
      orderBy: [{createdAt:"desc"}],
    })
    return addUserDataToPosts(posts);
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed.").min(1).max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId!);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are posting too fast",
        });
      }

      const post = await ctx.db.post.create({
        data: {
          content: input.content,
          authorId: authorId!,
        },
      });

      return post;
    }),
});
