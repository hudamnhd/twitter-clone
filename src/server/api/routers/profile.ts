import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { username: input.username },
        include: {
          posts: {
            select: {
              id: true,
            },
          },
          follows: {
            select: {
              id: true,
            },
          },
          followers: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      return filterUserForClient(user);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        include: {
          posts: {},
        },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      return post;
    }),

  follow: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      // const { success } = await ratelimit.limit(authorId);

      // if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        include: { follows: true }, // Mengambil data follows dari pengguna
      });

      const isFollowing = user?.follows.some(
        (follow) => follow.id === input.id,
      );

      if (isFollowing) {
        // Jika sudah mengikuti, maka lakukan unfollow
        await ctx.prisma.user.update({
          where: { id: userId },
          data: {
            follows: {
              disconnect: { id: input.id }, // Memutuskan hubungan
            },
          },
        });
      } else {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: {
            follows: {
              connect: { id: input.id },
            },
          },
        });
      }

      const updatedUser = await ctx.prisma.user.findUnique({
        where: { id: userId },
        include: { follows: true },
      });

      return updatedUser;
    }),

  getUsername: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: { id: true, username: true },
      });

      return user;
    }),

  setUsername: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        username: z.string().min(3).max(15),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = input.userId;

      const post = await ctx.prisma.user.findUnique({ where: { id: userId } });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      const updatedPost = await ctx.prisma.user.update({
        where: { id: userId },
        data: {
          username: input.username,
        },
      });

      return updatedPost;
    }),
});
