'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SaveButton({ propertyId, className = '' }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch('/api/saved')
      .then(r => r.json())
      .then(d => {
        const ids = (d.saved || []).map(p => p._id?.toString());
        setSaved(ids.includes(propertyId?.toString()));
      });
  }, [session, propertyId]);

  async function toggle() {
    if (!session) { router.push('/auth/login'); return; }
    setLoading(true);
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    });
    if (res.ok) {
      const data = await res.json();
      setSaved(data.saved);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Remove from saved' : 'Save property'}
      className={`flex items-center gap-2 transition-colors disabled:opacity-60 ${saved ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
        } ${className}`}
    >
      <Heart size={18} className={saved ? 'fill-red-500' : ''} />
      <span className="text-sm font-medium">{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}