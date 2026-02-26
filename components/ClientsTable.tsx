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
  const [localClients, setLocalClients] = useState<Client[]>(clients);

  useEffect(() => {
    setLocalClients(clients);
  }, [clients]);

  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      for (const client of localClients) {
        const { count, error } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('customer_name', client.name);

        counts[client.id] = error ? 0 : count ?? 0;
      }
      setAppointmentCounts(counts);
    };

    if (localClients.length) fetchCounts();
  }, [localClients]);

  const handleDelete = async (clientId: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this client?');
    if (!confirmDelete) return;

    const client = localClients.find(c => c.id === clientId);
    if (!client) return;

    try {
      const { error } = await supabase.from('clients').delete().eq('id', clientId);
      if (error) throw error;

      // Remove from local state so UI updates immediately
      setLocalClients(prev => prev.filter(c => c.id !== clientId));
      alert(`Deleted client: ${client.name}`);
    } catch (err) {
      console.error('Failed to delete client:', err);
      alert('Failed to delete client');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading clients…</div>;
  }

  if (!localClients.length) {
    return <div className="text-center py-16">No clients yet 👥</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] bg-gray-900 text-white rounded-xl shadow overflow-hidden">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-3 text-left">Client</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Appointments</th>
            <th className="p-3 text-left" />
            <th className="p-3 text-left" />
          </tr>
        </thead>
        <tbody>
          {localClients.map((c) => (
            <tr key={c.id} className="border-b border-gray-700">
              <td className="p-3 font-semibold">{c.name}</td>
              <td className="p-3">{c.phone}</td>
              <td className="p-3">{appointmentCounts[c.id] ?? 0}</td>
              <td className="p-3">
                <button
                  className="text-blue-400 hover:underline"
                  onClick={() => onEdit(c)}
                >
                  Edit
                </button>
              </td>
              <td className="p-3">
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}