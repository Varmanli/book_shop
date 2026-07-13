import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isUserRole } from "@/lib/roles";

export const authConfig: NextAuthConfig = {
  // Coolify terminates TLS at its trusted reverse proxy.
  trustHost: true,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id && isUserRole(user.role)) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.id === "string" && session.user) {
        session.user.id = token.id;
        // Middleware must stay edge-safe, so it uses the JWT value. The full
        // server auth callback refreshes this role from PostgreSQL.
        session.user.role = isUserRole(token.role) ? token.role : "USER";
      }
      return session;
    },
  },
};
