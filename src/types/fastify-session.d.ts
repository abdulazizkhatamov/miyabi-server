import "@fastify/session";
import { staff_roles } from "../../prisma/generated/prisma";

// 2. Declare module augmentation
declare module "@fastify/session" {
  interface FastifySessionObject {
    admin: {
      id: string;
      name: string;
      email: string;
      roles: staff_roles[];
      // Add other user properties as needed
    };
  }
}
