import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth, { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { mongooseConnect } from "@/lib/mongoose";
import { Admin } from "@/models/Admin";

export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async session({ session }) {
      await mongooseConnect(); // Ensure database connection
      const isAdmin = !!(await Admin.findOne({ email: session?.user?.email }));
      return {
        ...session,
        isAdmin, // Add the `isAdmin` flag to the session
      };
    },
  },
  
};

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
  await mongooseConnect(); // Ensure database connection
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    res.status(401).json({ message: "Unauthorized: No session found" });
    throw new Error("Unauthorized");
  }

  const isAdmin = await Admin.findOne({ email: session.user.email });
  if (!isAdmin) {
    res.status(403).json({ message: "Forbidden: You no longer have admin access." });
    throw new Error("Forbidden: User is not an admin");
  }
}
