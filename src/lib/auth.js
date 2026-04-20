import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from './db';
import User from './models/User';
import { sendWelcomeEmail } from './emailTemplates';


export const authOptions = {
  providers: [
    // --- EMAIL + PASSWORD ---

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select(
          "+passwordHash"
        );

        if (!user) {
          throw new Error("No account found with this email");
        }

        if (!user.passwordHash) {
          throw new Error("This account uses Google Sign-In. Please sign in with Google.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Please contact support");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email address before logging in.");
        }

        //update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
        };
      },
    }),

    // --- GOOGLE OAUTH ---

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    //Runs on Google sign-in: create user if firt time
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();

          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // First Time User
            await User.create({
              name: user.name,
              email: user.email,
              avatar: user.image,
              googleId: user.id,
              isVerified: true, // Google accounts auto-verified
              role: "buyer",
            });
            // Send the welcome email since they are automatically verified
            await sendWelcomeEmail(user.email, user.name).catch((err) => 
               console.error("Failed to send welcome email for Google signup:", err)
            );
          } else if (!existingUser.googleId) {
            //Existing User
            await User.findByIdAndUpdate(existingUser._id, { googleId: user.id });
          }
          return true;
        } catch (error) {
          console.error("Google sign-in error", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Handle manual session updates
      if (trigger === "update" && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.avatar !== undefined) token.avatar = session.user.avatar;
      }

      if (user) {
        //on initial sign-in, user object is available
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.avatar = user.avatar;
      }

      //For Google, fetch role from DB
      if (account?.provider === "google" && token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.isVerified = dbUser.isVerified;
            token.avatar = dbUser.avatar;
          }
        } catch (error) {
          console.error("JWT callback DB error:", error);
        }
      }

      return token;
    },

    // Expose token fields to client via useSession()
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.avatar = token.avatar;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, //30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };