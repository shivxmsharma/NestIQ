import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import ManageSidebar from '../../components/manage/ManageSidebar';

export const metadata = { title: 'Manage — NestIQ' };

export default async function ManageLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login?callbackUrl=/manage');

  return (
    <div className="min-h-screen bg-[#060913] relative overflow-hidden">
      {/* Background slightly darker than the main dashboard to differentiate the Sub Portal */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-125 h-125 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-125 h-125 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 z-10 min-h-[calc(100vh-80px)]">
        <div className="flex flex-col md:flex-row gap-8 items-start h-full">
          <ManageSidebar />
          <main className="flex-1 min-w-0 w-full h-full">{children}</main>
        </div>
      </div>
    </div>
  );
}