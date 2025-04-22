import "express-session";

declare module "express-session" {
  interface Session {
    user?: {
      googleId: string;
      email: string;
      name: string;
      picture: string;
      needsRegistration: boolean;
      role: string;
    };
  }
}