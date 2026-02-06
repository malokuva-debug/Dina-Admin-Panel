import { useEffect, useState } from 'react';
import { Client } from '@/app/admin-dashboard/clients/page';
import { supabase } from '@/lib/supabase';

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
  onEdit: (client: Client) => void;
}

export default function ClientsTable({
  clients,
  loading,
  onEdit,
}: ClientsTableProps) {
  const [appointmentCounts, setAppointmentCounts] = useState<Record<string, number>>({});

  // Fetch number of appointments per client
  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      for (const client of clients) {
        const { count, error } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('customer_name', client.name);

        if (!error) counts[client.id] = count ?? 0;
        else counts[client.id] = 0;
      }
      setAppointmentCounts(counts);
    };

    if (clients.length) fetchCounts();
  }, [clients]);

  if (loading) {
    return <div className="text-center py-10">Loading clients…</div>;
  }

  if (!clients.length) {
    return <div className="text-center py-16">No clients yet 👥</div>;
  }

  return (
    <table className="w-full bg-gray-900 text-white rounded-xl shadow overflow-hidden">
      <thead>
        <tr className="bg-gray-800">
          <th className="p-3 text-left">Client</th>
          <th className="p-3 text-left">Contact</th>
          <th className="p-3 text-left">Appointments</th>
          <th className="p-3 text-left" />
        </tr>
      </thead>
      <tbody>
        {clients.map((c) => (
          <tr key={c.id} className="border-b border-gray-700">
            <td className="p-3">
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-400">{c.phone}</div>
            </td>
            <td className="p-3">{c.email || '—'}</td>
            <td className="p-3">{appointmentCounts[c.id] ?? 0}</td>
            <td className="p-3">
              <button
                className="text-blue-400 hover:underline"
                onClick={() => onEdit(c)}
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}