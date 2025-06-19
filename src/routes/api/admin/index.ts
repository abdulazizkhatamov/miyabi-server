// src/routes/v1/index.ts
import { FastifyPluginAsync } from "fastify";
import authRoute from "./auth";
import staffsRoute from "./staffs";

const v1: FastifyPluginAsync = async (fastify): Promise<void> => {
  void fastify.register(authRoute, { prefix: "/auth" });
  void fastify.register(staffsRoute, { prefix: "/staffs" });
};

export default v1;
