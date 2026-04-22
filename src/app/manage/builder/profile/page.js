import BuilderProfileForm from "../../../../components/builders/BuilderProfileForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import connectDB from "../../../../lib/db";
import Builder from "../../../../lib/models/Builder";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "Company Profile Settings | NestIQ Builder",
};

export default async function BuilderProfileSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "builder") redirect("/dashboard");

  await connectDB();
  const builder = await Builder.findOne({ user: session.user.id }).lean();
  if (!builder) {
    // This shouldn't happen if they have the role, but just in case
    redirect("/manage/builder/setup"); 
  }

  const serializedBuilder = JSON.parse(JSON.stringify(builder));

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
          <Building2 className="w-10 h-10 text-amber-500" />
          Brand Profile
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Manage your developer identity and market presence on NestIQ.</p>
      </div>

      <BuilderProfileForm initialData={serializedBuilder} />
    </div>
  );
}
