'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ClientTable from '@/components/ClientTable'
import ClientModal from '@/components/ClientModal'
import SearchBar from '@/components/SearchBar'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any | null>(null)

  async function loadClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from('client_stats')
      .select('*')
      .order('name')

    if (!error && data) {
      setClients(data)
      setFiltered(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadClients()
  }, [])

  function handleSearch(value: string) {
    const v = value.toLowerCase()
    setFiltered(
      clients.filter(c =>
        c.name.toLowerCase().includes(v) ||
        c.phone.includes(v) ||
        c.email?.toLowerCase().includes(v)
      )
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Client Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingClient(null)
            setModalOpen(true)
          }}
        >
          + Add Client
        </button>
      </header>

      <SearchBar onSearch={handleSearch} />

      <ClientTable
        clients={filtered}
        loading={loading}
        onEdit={(c) => {
          setEditingClient(c)
          setModalOpen(true)
        }}
        onRefresh={loadClients}
      />

      {modalOpen && (
        <ClientModal
          client={editingClient}
          onClose={() => setModalOpen(false)}
          onSaved={loadClients}
        />
      )}
    </div>
  )
}