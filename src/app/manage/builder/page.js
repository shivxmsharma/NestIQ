import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import BuilderDashboardClient from "../../../components/builders/BuilderDashboardClient";

export const metadata = {
  title: "Builder Dashboard | NestIQ",
  description: "Monitor your project performance, manage leads, and update your development portfolio.",
};

export const dynamic = "force-dynamic";

export default async function BuilderDashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Basic security: only builders can access
  if (!session || session.user.role !== "builder") {
    redirect("/dashboard");
  }

  return (
    <div className="bg-[#0b1120] min-h-screen">
      <BuilderDashboardClient />
    </div>
  );
}
