import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

function getTrustedOrigins(): string[] {
  const origins: string[] = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://accounts.google.com",
    "https://www.googleapis.com",
  ];

  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_BRANCH_URL) {
    origins.push(`https://${process.env.VERCEL_BRANCH_URL}`);
  }

  return origins;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        input: false,
      },
    },
  },
  
  // 🔥 INI YANG PENTING: SESSION PERSISTENT
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24, // refresh once a day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 menit cache
    },
  },

  // 🔥 COOKIE CONFIG
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
  },

  trustedOrigins: getTrustedOrigins(),
});

export type Session = typeof auth.$Infer.Session;
export type UserWithRole = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "KITCHEN";
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};