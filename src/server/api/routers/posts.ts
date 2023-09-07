import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/nodejs";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

type User = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
};

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
  };
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: {
          likes: {
            select: {
              userId: true,
            },
          },
          comments: {
            select: {
              postId: true,
            },
          },
        },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      const userId = ctx.session?.user.id;

      const user = await ctx.prisma.user.findMany();

      const likedByMe = {
        ...post,
        likedByMe: post.likes.some((like) => like.userId === userId),
        likes: post.likes.map((like) => ({
          ...like,
        })),
      };

      const users = user.map(filterUserForClient);

      const author = users.find((user) => user.id === likedByMe.userId);

      if (!author?.name) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return {
        post: likedByMe,
        author: {
          ...author,
          name: author.name,
        },
      };
    }),

  getPostByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findMany({
        where: { userId: input.userId },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
        include: {
          likes: {
            select: {
              userId: true,
            },
          },
          comments: {
            select: {
              postId: true,
            },
          },
        },
      });

      const userId = ctx.session?.user.id;

      const user = await ctx.prisma.user.findMany();

      const likedByMe = post.map((post) => ({
        ...post,
        likedByMe: post.likes.some((like) => like.userId === userId),
        likes: post.likes.map((like) => ({
          ...like,
        })),
      }));

      const users = user.map(filterUserForClient);

      return likedByMe.map((post) => {
        const author = users.find((user) => user.id === post.userId);

        if (!author?.name)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Author for post not found",
          });

        return {
          post,
          author: {
            ...author,
            name: author.name,
          },
        };
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          select: {
            postId: true,
          },
        },
      },
    });

    const userId = ctx.session?.user.id;
    const user = await ctx.prisma.user.findMany();

    const likedByMe = posts.map((post) => ({
      ...post,
      likedByMe: post.likes.some((like) => like.userId === userId),
      likes: post.likes.map((like) => ({
        ...like,
      })),
    }));

    const users = user.map(filterUserForClient);

    return likedByMe.map((post) => {
      const author = users.find((user) => user.id === post.userId);

      if (!author?.name)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found",
        });

      return {
        post,
        author: {
          ...author,
          name: author.name,
        },
      };
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { success } = await ratelimit.limit(userId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          userId,
          content: input.content,
        },
      });
      return post;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const postId = input.postId;

      const { success } = await ratelimit.limit(userId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.findUnique({ where: { id: postId } });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      if (post.userId !== userId) throw new TRPCError({ code: "FORBIDDEN" });

      await ctx.prisma.post.delete({
        where: { id: postId },
      });

      return { success: true };
    }),

  edit: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const postId = input.postId;

      const post = await ctx.prisma.post.findUnique({ where: { id: postId } });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      if (post.userId !== userId) throw new TRPCError({ code: "FORBIDDEN" });

      const updatedPost = await ctx.prisma.post.update({
        where: { id: postId },
        data: {
          content: input.content,
        },
      });

      return updatedPost;
    }),

  like: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const postId = input.postId;

      const existingLike = await ctx.prisma.like.findFirst({
        where: {
          userId,
          postId,
        },
      });

      if (existingLike) {
        await ctx.prisma.like.deleteMany({
          where: {
            userId,
            postId,
          },
        });
        return null; // Atau Anda bisa mengembalikan pesan sukses penghapusan
      } else {
        const newLike = await ctx.prisma.like.create({
          data: {
            userId,
            postId,
          },
        });
        return newLike;
      }
    }),

  getComment: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const comments = await ctx.prisma.comment.findMany({
        where: { postId: input.postId },
        take: 10,
        orderBy: [{ createdAt: "desc" }],
        include: {
          likes: {
            select: {
              userId: true,
            },
          },
        },
      });

      const userId = ctx.session?.user.id;
      const user = await ctx.prisma.user.findMany();

      const likedByMe = comments.map((comment) => ({
        ...comment,
        likedByMe: comment.likes.some((like) => like.userId === userId),
        likes: comment.likes.map((like) => ({
          ...like,
        })),
      }));

      const users = user.map(filterUserForClient);

      return likedByMe.map((comment) => {
        const author = users.find((user) => user.id === comment.userId);

        if (!author)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Author for comment not found",
          });

        return {
          comment,
          author,
        };
      });
    }),

  createComment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // const { success } = await ratelimit.limit(userId);

      // if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.comment.create({
        data: {
          userId,
          postId: input.postId,
          content: input.content,
        },
      });
      return post;
    }),

  deleteComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const commentId = input.commentId;

      const { success } = await ratelimit.limit(userId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      if (post.userId !== userId) throw new TRPCError({ code: "FORBIDDEN" });

      await ctx.prisma.comment.delete({
        where: { id: commentId },
      });

      return { success: true };
    }),

  editComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        content: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const commentId = input.commentId;

      const post = await ctx.prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      if (post.userId !== userId) throw new TRPCError({ code: "FORBIDDEN" });

      const updatedPost = await ctx.prisma.comment.update({
        where: { id: commentId },
        data: {
          content: input.content,
        },
      });

      return updatedPost;
    }),

  likeComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const commentId = input.commentId;

      const existingLike = await ctx.prisma.like.findFirst({
        where: {
          userId,
          commentId,
        },
      });

      if (existingLike) {
        await ctx.prisma.like.deleteMany({
          where: {
            userId,
            commentId,
          },
        });
        return null; // Atau Anda bisa mengembalikan pesan sukses penghapusan
      } else {
        const newLike = await ctx.prisma.like.create({
          data: {
            userId,
            commentId,
          },
        });
        return newLike;
      }
    }),
});
