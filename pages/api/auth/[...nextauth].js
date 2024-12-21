import NextAuth, { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { Admin } from '@/models/Admin';
import { mongooseConnect } from '@/lib/mongoose';

// Helper function to check if an email belongs to an admin
async function isAdminEmail(email) {
  if (!email) return false; // Ensure the email exists
  await mongooseConnect(); // Connect to the database
  const admin = await Admin.findOne({ email });
  console.log("Admin Check:", { email, isAdmin: !!admin }); // Debug log
  return !!admin; // Return true if the admin exists
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: async ({ session }) => {
      const isAdmin = await isAdminEmail(session?.user?.email);
      if (isAdmin) {
        session.user.isAdmin = true; // Mark user as admin
        return session; // Allow session creation
      } else {
        console.log("Session denied for non-admin:", session?.user?.email); // Debug log
        return null; // Deny session for non-admin users
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret required for production
};

export default NextAuth(authOptions);

// Middleware function to restrict access to admin routes
export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    res.status(401).json({ message: 'Unauthorized. Only admins can access this route.' });
    throw new Error('Not an admin');
  }
}
