import React from 'react';
import Link from 'next/link';
import { Star, FileWarning } from 'lucide-react';

export default function AdminSidebarLink() {
  return (
    <Link
      href="/admin/reviews"
      className="flex items-center justify-between p-3 rounded-xl transition-all group hover:bg-white/5 text-slate-400 hover:text-white"
    >
      <div className="flex items-center gap-3">
        <Star className="w-5 h-5 text-amber-500/50 group-hover:text-amber-400 font-bold transition-colors" />
        <span className="font-medium tracking-wide">Reviews & Trust</span>
      </div>
    </Link>
  );
}
