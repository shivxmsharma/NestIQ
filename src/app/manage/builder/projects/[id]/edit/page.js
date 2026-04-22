import ProjectForm from "../../../../../../components/builders/ProjectForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import { redirect, notFound } from "next/navigation";
import connectDB from "../../../../../../lib/db";
import Project from "../../../../../../lib/models/Project";
import Builder from "../../../../../../lib/models/Builder";
import { Settings } from "lucide-react";

export const metadata = {
  title: "Edit Project | NestIQ Builder",
};

export default async function EditProjectPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "builder") redirect("/dashboard");

  await connectDB();
  const builder = await Builder.findOne({ user: session.user.id }).lean();
  if (!builder) redirect("/manage/builder");

  const project = await Project.findOne({ _id: id, builder: builder._id }).lean();
  if (!project) notFound();

  // Serialize Mongoose objects
  const serializedProject = JSON.parse(JSON.stringify(project));

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
          <Settings className="w-10 h-10 text-amber-500" />
          Edit Project
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Update development details for {project.title}.</p>
      </div>

      <ProjectForm mode="edit" initialData={serializedProject} />
    </div>
  );
}
