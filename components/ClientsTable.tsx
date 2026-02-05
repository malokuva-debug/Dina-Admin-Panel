import { supabase } from '@/lib/supabase';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  total_appointments?: number;
  total_spent?: number;
}

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
  onEdit: (client: Client) => void;
  onRefresh: () => void;
}

export default function ClientsTable({
  clients,
  loading,
  onEdit,
  onRefresh,
}: ClientsTableProps) {
  async function deleteClient(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await supabase.from('clients').delete().eq('id', id);
    onRefresh();
  }

  if (loading) {
    return <div className="text-center py-10">Loading clients…</div>;
  }

  if (!clients.length) {
    return <div className="text-center py-16">No clients yet 👥</div>;
  }

  return (
    <table className="w-full bg-white rounded-xl shadow">
      <thead>
        <tr>
          <th>Client</th>
          <th>Contact</th>
          <th>Appointments</th>
          <th>Total Spent</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {clients.map((c) => (
          <tr key={c.id}>
            <td>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-500">{c.phone}</div>
            </td>
            <td>{c.email || '—'}</td>
            <td>{c.total_appointments ?? 0}</td>
            <td>${(c.total_spent ?? 0).toFixed(2)}</td>
            <td className="flex gap-2">
              <button onClick={() => onEdit(c)}>Edit</button>
              <button onClick={() => deleteClient(c.id, c.name)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}