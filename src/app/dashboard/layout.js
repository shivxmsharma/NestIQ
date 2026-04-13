import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';

export const metadata = { title: 'Dashboard — NestIQ' };

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login?callbackUrl=/dashboard');

  return (
    <div className="min-h-screen bg-[#0b1120] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-125 h-125 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-125 h-125 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 z-10 w-full">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <DashboardSidebar user={session.user} />
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}