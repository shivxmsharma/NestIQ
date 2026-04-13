'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeletePropertyButton({ propertyId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setLoading(true);
    const res = await fetch(`/api/properties/${propertyId}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json();
      alert(d.error || 'Failed to delete');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 text-red-400 hover:text-rose-400 transition-colors disabled:opacity-50"
    >
      <Trash2 size={14} />
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  );
}