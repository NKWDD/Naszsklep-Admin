import NextAuth, { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { Admin } from '@/models/Admin';
import { mongooseConnect } from '@/lib/mongoose';

// Helper function to check if an email belongs to an admin
async function isAdminEmail(email) {
  await mongooseConnect(); // Ensure database connection
  return !!(await Admin.findOne({ email }));
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
      // Check if the user's email belongs to an admin
      const isAdmin = await isAdminEmail(session?.user?.email);
      if (isAdmin) {
        session.user.isAdmin = true; // Add isAdmin flag to session
        return session;
      } else {
        return null; // Return null to deny session creation for non-admin users
      }
    },
  },
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
