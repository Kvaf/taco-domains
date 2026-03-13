"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Pencil, Trash2, Globe } from "lucide-react";

interface DomainOption {
  id: string;
  name: string;
  dnssec: boolean;
}

interface DNSRecord {
  id: string;
  domainId?: string;
  type: string;
  name: string;
  value?: string;
  content?: string;
  ttl: number;
  priority?: number | null;
  proxied?: boolean;
  createdAt?: string;
}

/** Get the value/content from a record (handles both Cloudflare and local format) */
function recordValue(r: DNSRecord): string {
  return r.content || r.value || "";
}

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA"] as const;

const TYPE_COLORS: Record<string, string> = {
  A: "bg-cyan/10 text-cyan",
  AAAA: "bg-cyan/10 text-cyan",
  CNAME: "bg-fire/10 text-fire",
  MX: "bg-gold/10 text-gold",
  TXT: "bg-lime/10 text-lime",
  NS: "bg-text3/10 text-text3",
  SRV: "bg-fire-light/10 text-fire-light",
  CAA: "bg-red/10 text-red",
};

export default function DNSPage() {
  const [domains, setDomains] = useState<DomainOption[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<DomainOption | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);

  // Form state
  const [formType, setFormType] = useState<string>("A");
  const [formName, setFormName] = useState("@");
  const [formValue, setFormValue] = useState("");
  const [formTtl, setFormTtl] = useState("3600");
  const [formPriority, setFormPriority] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch user's domains
  useEffect(() => {
    async function fetchDomains() {
      try {
        const res = await fetch("/api/domain/list");
        if (res.ok) {
          const data = await res.json();
          const opts = data.domains.map((d: { id: string; name: string; dnssec?: boolean }) => ({
            id: d.id,
            name: d.name,
            dnssec: d.dnssec ?? false,
          }));
          setDomains(opts);
          if (opts.length > 0 && !selectedDomainId) {
            setSelectedDomainId(opts[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDomains();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch DNS records when domain changes
  const fetchRecords = useCallback(async () => {
    if (!selectedDomainId) return;
    try {
      const res = await fetch(`/api/dns?domainId=${selectedDomainId}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
        setSelectedDomain(data.domain);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedDomainId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  function resetForm() {
    setFormType("A");
    setFormName("@");
    setFormValue("");
    setFormTtl("3600");
    setFormPriority("");
    setFormError("");
    setEditingRecord(null);
    setShowForm(false);
  }

  function openEditForm(record: DNSRecord) {
    setEditingRecord(record);
    setFormType(record.type);
    setFormName(record.name);
    setFormValue(recordValue(record));
    setFormTtl(record.ttl.toString());
    setFormPriority(record.priority?.toString() || "");
    setFormError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!formValue.trim()) {
      setFormError("Value is required");
      return;
    }

    setSaving(true);
    setFormError("");

    const record = {
      type: formType,
      name: formName.trim() || "@",
      value: formValue.trim(),
      ttl: parseInt(formTtl) || 3600,
      priority: formPriority ? parseInt(formPriority) : undefined,
    };

    try {
      if (editingRecord) {
        // Update
        const res = await fetch("/api/dns", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId: editingRecord.id, domainId: selectedDomainId, record }),
        });
        if (!res.ok) {
          const data = await res.json();
          setFormError(data.error || "Failed to update");
          return;
        }
      } else {
        // Create
        const res = await fetch("/api/dns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domainId: selectedDomainId, record }),
        });
        if (!res.ok) {
          const data = await res.json();
          setFormError(data.error || "Failed to create");
          return;
        }
      }

      resetForm();
      fetchRecords();
    } catch {
      setFormError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(recordId: string) {
    if (!confirm("Delete this DNS record?")) return;
    try {
      const res = await fetch("/api/dns", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, domainId: selectedDomainId }),
      });
      if (res.ok) fetchRecords();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleDnssec() {
    if (!selectedDomain) return;
    try {
      const res = await fetch("/api/dns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: selectedDomainId, enabled: !selectedDomain.dnssec }),
      });
      if (res.ok) fetchRecords();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-fire" />
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Globe className="h-12 w-12 text-text3 mb-4" />
          <h2 className="font-[family-name:var(--font-anybody)] text-xl font-bold mb-2">
            No domains to manage
          </h2>
          <p className="text-sm text-text2 mb-4">Register a domain first to manage its DNS records.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-anybody)] text-2xl font-bold">DNS Record Editor</h1>
        <p className="text-sm text-text2">
          Manage A, CNAME, MX, TXT records with our intuitive editor. DNSSEC, custom TTL support.
        </p>
      </div>

      {/* Domain selector + actions bar */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <select
            value={selectedDomainId}
            onChange={(e) => setSelectedDomainId(e.target.value)}
            className="px-4 py-2.5 rounded-[--radius-xs] bg-bg border border-border text-sm text-text outline-none focus:border-fire min-w-[200px]"
          >
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Record
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit form */}
      {showForm && (
        <Card>
          <CardHeader>
            <h3 className="font-[family-name:var(--font-anybody)] font-bold">
              {editingRecord ? "Edit Record" : "Add Record"}
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-text3 mb-1.5">Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[--radius-xs] bg-bg border border-border text-sm text-text outline-none focus:border-fire"
                >
                  {RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  label="Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="@"
                />
              </div>
              <div className="lg:col-span-2">
                <Input
                  label="Value"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder={formType === "A" ? "192.168.1.1" : formType === "CNAME" ? "example.com" : formType === "MX" ? "mail.example.com" : "value"}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label="TTL"
                    value={formTtl}
                    onChange={(e) => setFormTtl(e.target.value)}
                    placeholder="3600"
                  />
                </div>
                {(formType === "MX" || formType === "SRV") && (
                  <div className="w-20">
                    <Input
                      label="Priority"
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      placeholder="10"
                    />
                  </div>
                )}
              </div>
            </div>

            {formError && <p className="text-sm text-red">{formError}</p>}

            <div className="flex gap-2">
              <Button onClick={handleSave} loading={saving} size="sm">
                {editingRecord ? "Update Record" : "Add Record"}
              </Button>
              <Button onClick={resetForm} variant="ghost" size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records table */}
      <Card>
        <div className="overflow-x-auto">
          {records.length === 0 ? (
            <CardContent className="flex flex-col items-center py-10 text-center">
              <p className="text-sm text-text3 mb-2">No DNS records yet</p>
              <p className="text-xs text-text4">Click &quot;Add Record&quot; to create your first DNS record.</p>
            </CardContent>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text3 uppercase tracking-wider">
                  <th className="px-4 py-3 w-20">Type</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3 w-20">TTL</th>
                  <th className="px-4 py-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_COLORS[record.type] || "bg-surface text-text3"}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">{record.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text2 max-w-[300px] truncate">
                      {record.priority != null && <span className="text-text3 mr-1">(pri:{record.priority})</span>}
                      {recordValue(record)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text3">{record.ttl}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditForm(record)}
                          className="p-1.5 rounded hover:bg-surface text-text3 hover:text-fire transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1.5 rounded hover:bg-surface text-text3 hover:text-red transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* DNSSEC toggle */}
      {selectedDomain && (
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-text3" />
          <span className="text-sm text-text2">DNSSEC:</span>
          <button
            onClick={toggleDnssec}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              selectedDomain.dnssec ? "bg-fire" : "bg-surface2"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                selectedDomain.dnssec ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-xs text-text3">
            {selectedDomain.dnssec ? "Enabled — DS record published" : "Disabled"}
          </span>
        </div>
      )}
    </div>
  );
}
