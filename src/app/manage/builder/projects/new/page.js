import ProjectForm from "../../../../../components/builders/ProjectForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Launch New Project | NestIQ Builder",
  description: "Create a new project listing in the NestIQ directory.",
};

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "builder") redirect("/dashboard");

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
          <Plus className="w-10 h-10 text-amber-500" />
          Launch New Project
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Enter your development details to start attracting buyers.</p>
      </div>

      <ProjectForm mode="create" />
    </div>
  );
}
