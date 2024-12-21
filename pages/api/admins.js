import mongoose from "mongoose";
import { mongooseConnect } from "@/lib/mongoose";
import { Admin } from "@/models/Admin";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

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

    if (!_id) {
      return res.status(400).json({ message: "Missing admin ID to delete." });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid admin ID format." });
    }

    const deletedAdmin = await Admin.findByIdAndDelete(_id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const admins = await Admin.find();
    return res.status(200).json(admins);
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
