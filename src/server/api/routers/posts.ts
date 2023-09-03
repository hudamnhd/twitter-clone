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
  limiter: Ratelimit.slidingWindow(3, "1 m"),
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
      // Langkah 2: Mencari author berdasarkan post.userId
      const author = users.find((user) => user.id === likedByMe.userId);

      // Langkah 3: Melempar error jika author tidak ditemukan
      if (!author?.name) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      // Langkah 4: Mengembalikan hasil yang diinginkan
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
          // Properti lain dalam objek like jika diperlukan
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
            userId: true, // Ganti dengan properti yang ingin Anda ambil dari user
            postId: true,
            // ... tambahkan properti lain yang ingin Anda ambil dari user
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
        // Properti lain dalam objek like jika diperlukan
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

      // Cek apakah user sudah ada dalam tabel like untuk postId tertentu
      const existingLike = await ctx.prisma.like.findFirst({
        where: {
          userId,
          postId,
        },
      });

      if (existingLike) {
        // Jika user sudah ada, hapus data like yang ada
        await ctx.prisma.like.deleteMany({
          where: {
            userId,
            postId,
          },
        });
        return null; // Atau Anda bisa mengembalikan pesan sukses penghapusan
      } else {
        // Jika user belum ada, tambahkan data like baru
        const newLike = await ctx.prisma.like.create({
          data: {
            userId,
            postId,
          },
        });
        return newLike;
      }
    }),
});
