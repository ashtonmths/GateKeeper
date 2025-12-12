import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Input schemas
const createProjectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
});

const projectIdSchema = z.object({
  projectId: z.number(),
});

export const projectRouter = createTRPCRouter({
  // Create a project
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description,
          ownerId: ctx.session.user.id,
          locked: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          locked: true,
          createdAt: true,
        },
      });

      return project;
    }),

  // List projects of logged-in user
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: { ownerId: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        locked: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get lock status
  getStatus: protectedProcedure
    .input(projectIdSchema)
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { locked: true },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return project; // { locked: boolean }
    }),

  // Unlock project
  unlock: protectedProcedure
    .input(projectIdSchema)
    .mutation(async ({ ctx, input }) => {
      // First verify the project exists and user is the owner
      const existingProject = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { ownerId: true },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (existingProject.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to modify this project",
        });
      }

      const project = await ctx.db.project.update({
        where: {
          id: input.projectId,
        },
        data: { locked: false },
        select: { id: true, locked: true },
      });

      return project;
    }),

  // Lock project
  lock: protectedProcedure
    .input(projectIdSchema)
    .mutation(async ({ ctx, input }) => {
      // First verify the project exists and user is the owner
      const existingProject = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { ownerId: true },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (existingProject.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to modify this project",
        });
      }

      const project = await ctx.db.project.update({
        where: {
          id: input.projectId,
        },
        data: { locked: true },
        select: { id: true, locked: true },
      });

      return project;
    }),
});
