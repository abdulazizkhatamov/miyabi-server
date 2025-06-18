// src/routes/v1/auth.ts
import { FastifyPluginAsync } from "fastify";
import argon2 from "argon2";
import prisma from "../../../lib/prisma";

const authRoute: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Protected route example
  fastify.get("/me", async (request, reply) => {
    if (!request.session.admin)
      return reply.status(401).send({ error: "Unauthorized" });

    const admin = await prisma.admin.findUnique({
      where: { email: request.session.admin.email },
    });

    if (!admin) {
      return reply.status(404).send({ message: "Failed to verify session." });
    }

    return { admin: request.session.admin };
  });
  // Login route
  fastify.post(
    "/login",
    {
      preHandler: fastify.csrfProtection,
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
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
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      const admin = await prisma.admin.findUnique({ where: { email } });

      if (!admin) {
        return reply.status(401).send({ message: "Invalid email or password" });
      }

      const isPasswordValid = await argon2.verify(admin.password, password);

      if (!isPasswordValid) {
        return reply.status(401).send({ message: "Invalid email or password" });
      }

      request.session.admin = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        roles: admin.roles,
      };

      return reply.status(200).send({
        message: "Login successful",
      });
    }
  );
  // Register route
  fastify.post(
    "/register",
    {
      preHandler: fastify.csrfProtection,
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, email, password } = request.body as {
          name: string;
          email: string;
          password: string;
        };

        // Check if the admin already exists
        const existingAdmin = await prisma.admin.findUnique({
          where: { email },
        });

        if (existingAdmin) {
          return reply.status(400).send({ message: "Admin already exists" });
        }

        // Hash the password
        const hashedPassword = await argon2.hash(password);

        // Create the admin in the database
        const admin = await prisma.admin.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });

        // Send email after the admin is successfully created

        request.session.admin = {
          name: admin.name,
          id: admin.id,
          email: admin.email,
          roles: admin.roles,
        };
        return reply.status(201).send({
          message: "Admin created successfully. Please verify your email.",
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
  fastify.post(
    "/logout",
    { preHandler: fastify.csrfProtection },
    async (request, reply) => {
      try {
        await request.session.destroy();

        return reply.status(200).send({ message: "Logged out successfully" });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
  fastify.get(
    "/csrf-token",
    {
      schema: {
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
              token: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const token = reply.generateCsrf();
      return reply.status(201).send({
        message: "CSRF token generated successfully",
        token: token,
      });
    }
  );
};

export default authRoute;
