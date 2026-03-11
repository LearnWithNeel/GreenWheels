import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "./db";
import User from "@/models/User";
import Dealer from "@/models/Dealer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn:  "/login",
    error:   "/login",
  },

  providers: [

    // ── Google OAuth — Customer only ──
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── Customer Email + Password ──
    CredentialsProvider({
      id:   "customer-login",
      name: "Customer Login",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();
          const user = await User
            .findOne({ email: credentials.email })
            .select("+password");

          if (!user || !user.password) return null;

          const valid = await user.comparePassword(
            credentials.password as string
          );
          if (!valid) return null;

          // Update last login
          await User.updateOne(
            { _id: user._id },
            { lastLoginAt: new Date() }
          );

          return {
            id:    user._id.toString(),
            email: user.email,
            name:  user.name,
            image: user.image,
            role:  "customer",
          };
        } catch (err) {
          console.error("[Auth] customer-login error:", err);
          return null;
        }
      },
    }),

    // ── Dealer Email + Password ──
    CredentialsProvider({
      id:   "dealer-login",
      name: "Dealer Login",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();
          const dealer = await Dealer
            .findOne({ email: credentials.email })
            .select("+password");

          if (!dealer)                       return null;
          if (!dealer.isActive)              return null;

          const valid = await dealer.comparePassword(
            credentials.password as string
          );
          if (!valid) return null;

          await Dealer.updateOne(
            { _id: dealer._id },
            { lastLoginAt: new Date() }
          );

          return {
            id:    dealer._id.toString(),
            email: dealer.email,
            name:  dealer.name,
            image: dealer.profileImage ?? null,
            role:  "dealer",
          };
        } catch (err) {
          console.error("[Auth] dealer-login error:", err);
          return null;
        }
      },
    }),

    // ── Admin Email + Password ──
    CredentialsProvider({
      id:   "admin-login",
      name: "Admin Login",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail    = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          credentials.email    !== adminEmail ||
          credentials.password !== adminPassword
        ) return null;

        return {
          id:    "admin",
          email: adminEmail,
          name:  "Admin",
          image: null,
          role:  "admin",
        };
      },
    }),
  ],

  callbacks: {
    // ── Add role to JWT token ──
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "customer";
        token.id   = user.id;
      }

      // Google OAuth — auto create customer account
      if (account?.provider === "google" && token.email) {
        try {
          await connectDB();
          let dbUser = await User.findOne({ email: token.email });

          if (!dbUser) {
            dbUser = await User.create({
              name:          token.name ?? "Google User",
              email:         token.email,
              image:         token.picture,
              emailVerified: true,
              role:          "customer",
            });
          }
          token.role = "customer";
          token.id   = dbUser._id.toString();
        } catch (err) {
          console.error("[Auth] Google OAuth DB error:", err);
        }
      }
      return token;
    },

    // ── Add role to session ──
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id   = token.id   as string;
      }
      return session;
    },
  },
});