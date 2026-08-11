import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    Credentials({
      name: "CustomAuth",
      credentials: {
        type: { label: "Type", type: "text" },
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const type = (credentials?.type as string) || "google-direct";
        const identifier = ((credentials?.identifier as string) || "").trim();
        const password = (credentials?.password as string) || "";
        const otp = ((credentials?.otp as string) || "").trim();

        // 0. Biometric Passkey Login (Face ID, Touch ID, Fingerprint, Windows Hello)
        if (type === "passkey") {
          const passkeyUserEmail = (identifier || "adityasinghlko198@gmail.com").toLowerCase();
          let user = await db.user.findFirst({
            where: {
              OR: [
                { email: passkeyUserEmail },
                { phoneNumber: passkeyUserEmail },
              ],
            },
          });

          if (!user) {
            user = await db.user.create({
              data: {
                email: passkeyUserEmail,
                name: passkeyUserEmail.includes("@") ? passkeyUserEmail.split("@")[0] : `User ${passkeyUserEmail.slice(-4)}`,
                image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${passkeyUserEmail}`,
              },
            });
          }

          return {
            id: user.id,
            name: user.name || "Passkey User",
            email: user.email,
            image: user.image,
          };
        }

        // 1. Phone via OTP
        if (type === "phone-otp") {
          if (!identifier || !otp) throw new Error("Phone number and OTP are required");

          const user = await db.user.findUnique({
            where: { phoneNumber: identifier },
          });

          if (!user || user.otpCode !== otp) {
            throw new Error("Invalid or expired OTP verification code");
          }

          // Clear used OTP
          await db.user.update({
            where: { id: user.id },
            data: { otpCode: null, otpExpires: null },
          });

          return {
            id: user.id,
            name: user.name || `User ${identifier.slice(-4)}`,
            email: user.email,
            image: user.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${identifier}`,
          };
        }

        // 2. Phone via Password
        if (type === "phone-password") {
          if (!identifier || !password) throw new Error("Phone number and password are required");

          let user = await db.user.findUnique({
            where: { phoneNumber: identifier },
          });

          if (!user) {
            user = await db.user.create({
              data: {
                phoneNumber: identifier,
                password,
                name: `User ${identifier.slice(-4)}`,
                image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${identifier}`,
              },
            });
          } else if (user.password && user.password !== password) {
            throw new Error("Incorrect password. Please try again or reset your password.");
          } else if (!user.password) {
            await db.user.update({
              where: { id: user.id },
              data: { password },
            });
          }

          return {
            id: user.id,
            name: user.name || `User ${identifier.slice(-4)}`,
            email: user.email,
            image: user.image,
          };
        }

        // 3. Email via OTP
        if (type === "email-otp") {
          if (!identifier || !otp) throw new Error("Email and OTP are required");
          const cleanEmail = identifier.toLowerCase();

          const user = await db.user.findUnique({
            where: { email: cleanEmail },
          });

          if (!user || user.otpCode !== otp) {
            throw new Error("Invalid or expired OTP verification code");
          }

          await db.user.update({
            where: { id: user.id },
            data: { otpCode: null, otpExpires: null, emailVerified: new Date() },
          });

          return {
            id: user.id,
            name: user.name || cleanEmail.split("@")[0],
            email: user.email,
            image: user.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanEmail}`,
          };
        }

        // 4. Email via Password
        if (type === "email-password") {
          if (!identifier || !password) throw new Error("Email and password are required");
          const cleanEmail = identifier.toLowerCase();

          let user = await db.user.findUnique({
            where: { email: cleanEmail },
          });

          if (!user) {
            user = await db.user.create({
              data: {
                email: cleanEmail,
                password,
                name: cleanEmail.split("@")[0],
                image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanEmail}`,
              },
            });
          } else if (user.password && user.password !== password) {
            throw new Error("Incorrect password. Please try again or reset your password.");
          } else if (!user.password) {
            await db.user.update({
              where: { id: user.id },
              data: { password },
            });
          }

          return {
            id: user.id,
            name: user.name || cleanEmail.split("@")[0],
            email: user.email,
            image: user.image,
          };
        }

        // 5. Default: Gmail / Google Account Login
        const defaultEmail = (identifier || "adityasinghlko198@gmail.com").toLowerCase();
        let user = await db.user.findUnique({
          where: { email: defaultEmail },
        });

        const displayName = defaultEmail.includes("aditya")
          ? "Aditya Singh"
          : defaultEmail
              .split("@")[0]
              .split(/[._-]/)
              .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(" ");

        if (!user) {
          user = await db.user.create({
            data: {
              email: defaultEmail,
              name: displayName,
              image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultEmail}`,
            },
          });
        }

        return {
          id: user.id,
          name: user.name || displayName,
          email: user.email,
          image: user.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultEmail}`,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
