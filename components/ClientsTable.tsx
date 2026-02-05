import { Client } from '@/app/admin-dashboard/clients/page';

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
            <td>
              <button onClick={() => onEdit(c)}>Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}