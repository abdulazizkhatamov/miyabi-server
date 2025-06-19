// src/routes/v1/auth.ts
import { FastifyPluginAsync } from "fastify";
import argon2 from "argon2";
import { ensureAuthenticated, ensureRole } from "../../../utils/auth";
import prisma from "../../../lib/prisma";
import { staff_roles } from "../../../../prisma/generated/prisma";

const staffsRoute: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Protected route example
  fastify.get("/", async (request, reply) => {
    if (!ensureAuthenticated(request, reply)) return;
    if (!ensureRole(request, reply, ["admin", "super_admin"])) return;

    const currentSession = request.session.admin.id;

    const dbData = await prisma.admin.findMany({
      where: {
        id: { not: currentSession },
        NOT: {
          roles: {
            has: "super_admin",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
      },
    });

    return { message: "OK", data: dbData };
  });
  // Login route
  fastify.post(
    "/",
    {
      preHandler: fastify.csrfProtection,
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password", "roles"],
          properties: {
            name: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            roles: {
              type: "array",
              items: { type: "string" },
              minItems: 1, // Ensure at least one string is selected
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!ensureAuthenticated(request, reply)) return;
      if (!ensureRole(request, reply, ["admin", "super_admin"])) return;

      const { name, email, password, roles } = request.body as {
        name: string;
        email: string;
        password: string;
        roles: string[];
      };

      const isExist = await prisma.admin.findUnique({ where: { email } });

      if (isExist) {
        return reply.status(400).send({
          message: "Email is already in use.",
        });
      }

      const hashedPassword = await argon2.hash(password);

      await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roles: roles as staff_roles[],
        },
      });

      return reply.status(201).send({
        message: "Successfully created.",
      });
    }
  );
};

export default staffsRoute;
