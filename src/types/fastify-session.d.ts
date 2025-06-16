import "@fastify/session";

// 2. Declare module augmentation
declare module "@fastify/session" {
  interface FastifySessionObject {
    admin: {
      id: string;
      name: string;
      email: string;
      // Add other user properties as needed
    };
  }
}
