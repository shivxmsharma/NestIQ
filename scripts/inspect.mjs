import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BuilderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  companyName: String,
  isVerified: Boolean,
  isActive: Boolean,
}, { strict: false });
const Builder = mongoose.model("Builder", BuilderSchema);

const UserSchema = new mongoose.Schema({ email: String, role: String });
const User = mongoose.model("User", UserSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  const users = await User.find({ role: "builder" });
  console.log("Builder Users", users);
  
  const builders = await Builder.find({});
  console.log("All Builders:", builders);
  
  const activeVerified = await Builder.find({ isVerified: true, isActive: true });
  console.log("Active & Verified Builders:", activeVerified);
  
  await mongoose.disconnect();
}
main();
