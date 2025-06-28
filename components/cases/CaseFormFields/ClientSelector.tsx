"use client";
import React, { useState } from "react";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

const MOCK_CLIENTS: Client[] = [
  { id: "1", name: "Rahul Sharma", email: "rahul@example.com", phone: "9876543210" },
  { id: "2", name: "Priya Singh", email: "priya@example.com", phone: "9123456780" }
];

type ClientSelectorProps = {
  value: Client | null;
  onChange: (client: Client | null) => void;
};

const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange }) => {
  const [showNew, setShowNew] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create client");
      const created = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
      };
      setClients(prev => [...prev, created]);
      onChange(created); // auto-select new client
      setShowNew(false);
      setNewClient({ name: "", email: "", phone: "" });
    } catch (err: any) {
      setError(err.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Client</label>
      {!showNew ? (
        <select
          className="input w-full"
          value={value ? value.id : ""}
          onChange={e => {
            if (e.target.value === "new") {
              setShowNew(true);
            } else {
              const client = clients.find(c => c.id === e.target.value) || null;
              onChange(client);
            }
          }}
        >
          <option value="">Select Client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
          ))}
          <option value="new">Add New Client...</option>
        </select>
      ) : (
        <form className="space-y-2 mt-2" onSubmit={handleNewClient}>
          <input
            className="input w-full"
            type="text"
            placeholder="Client Name"
            value={newClient.name}
            onChange={e => setNewClient({ ...newClient, name: e.target.value })}
            required
          />
          <input
            className="input w-full"
            type="email"
            placeholder="Client Email"
            value={newClient.email}
            onChange={e => setNewClient({ ...newClient, email: e.target.value })}
            required
          />
          <input
            className="input w-full"
            type="tel"
            placeholder="Client Phone"
            value={newClient.phone}
            onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Adding..." : "Add Client"}</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowNew(false)} disabled={loading}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ClientSelector; 