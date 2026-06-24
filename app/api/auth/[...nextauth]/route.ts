import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = String(profile?.email || "").toLowerCase();
      return email.endsWith("@kargo.com");
    },
    async session({ session }) {
      return session;
    },
  },
});

export { handler as GET, handler as POST };