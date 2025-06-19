// src/utils/auth.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { staff_roles } from "../../prisma/generated/prisma";

export function ensureAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.session?.admin) {
    reply.status(401).send({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export function ensureRole(
  request: FastifyRequest,
  reply: FastifyReply,
  allowedRoles: staff_roles[]
) {
  const roles = request.session?.admin?.roles || [];
  const hasPermission = allowedRoles.some((role) =>
    roles.includes(role as staff_roles)
  );

  if (!hasPermission) {
    reply.status(403).send({ error: "Forbidden" });
    return false;
  }
  return true;
}
