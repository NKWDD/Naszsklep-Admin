import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { Admin } from "@/models/Admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handle(req, res) {
  await mongooseConnect(); // Ensure database connection
  await isAdminRequest(req, res); // Verify admin request

  if (req.method === "POST") {
    // Handle creating a new admin
    const { email } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists!" });
    }

    const newAdmin = await Admin.create({ email });
    return res.status(201).json(newAdmin);
  } 

  if (req.method === "DELETE") {
    const { _id } = req.query;
  
    // Ensure `_id` exists in the request
    if (!_id) {
      return res.status(400).json({ message: "Missing admin ID to delete." });
    }
  
    // Validate `_id` format
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid admin ID format." });
    }
  
    // Fetch the current admin's email from the session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized: No session found." });
    }
  
    const currentAdmin = await Admin.findOne({ email: session.user.email });
  
    // Check if the current admin exists
    if (!currentAdmin) {
      return res.status(403).json({ message: "You are no longer an admin." });
    }
  
    // Prevent self-deletion
    if (currentAdmin._id.equals(new mongoose.Types.ObjectId(_id))) {
      return res.status(400).json({ message: "You cannot delete your own admin account." });
    }
  
    // Delete the specified admin
    const deletedAdmin = await Admin.findByIdAndDelete(_id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found." });
    }
  
    return res.status(200).json({ success: true });
  }
  
  
  if (req.method === "GET") {
    // Handle retrieving all admins
    const admins = await Admin.find();
    return res.status(200).json(admins);
  } 

  // Handle unsupported methods
  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
