import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "../../components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | NestIQ",
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Kick out non-logged-in users
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  // Kick out non-admins
  if (session.user.role !== "admin") {
    // Optionally redirect to home or an unauthorized page
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0b1120] relative overflow-hidden">
      {/* Admin Specific Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Admin Sidebar */}
          <AdminSidebar user={session.user} />

          {/* Main Context UI */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}