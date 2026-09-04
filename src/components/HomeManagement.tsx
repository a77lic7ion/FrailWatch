import React, { useState, useEffect } from 'react';
import { Shield, Plus, Building2, X, Pencil, Trash2, Users } from 'lucide-react';
import { api } from '../services/api';

interface HomeManagementProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
  onRefresh: () => Promise<void>;
}

interface CareHomeForm {
  id: string;
  name: string;
  location: string;
  cutoffTime: string;
  careStaffOnDuty: number;
  primaryNurse: string;
  providerPartner: string;
}

export function HomeManagement({ isOpen, onClose, staff, onRefresh }: HomeManagementProps) {
  const [homes, setHomes] = useState<CareHomeForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingHome, setEditingHome] = useState<CareHomeForm | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newHome, setNewHome] = useState<CareHomeForm>({
    id: '',
    name: '',
    location: '',
    cutoffTime: '09:00',
    careStaffOnDuty: 0,
    primaryNurse: '',
    providerPartner: '',
  });

  const canGlobalManage = staff?.role === 'superadmin' || staff?.homeId === '*';

  const loadHomes = async () => {
    setLoading(true);
    try {
      const list = await api.getHomes();
      setHomes(list || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load homes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHomes();
    }
  }, [isOpen]);

  const createHome = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await api.createHome({
        id: newHome.id,
        name: newHome.name,
        location: newHome.location,
        cutoffTime: newHome.cutoffTime,
      });
      if (data) {
        setSuccess(`Home created: ${data.home.name}`);
        setNewHome({
          id: '',
          name: '',
          location: '',
          cutoffTime: '09:00',
          careStaffOnDuty: 0,
          primaryNurse: '',
          providerPartner: '',
        });
        setShowAddForm(false);
        await onRefresh();
        await loadHomes();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to create home');
    } finally {
      setSaving(false);
    }
  };

  const updateHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHome) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateHome(editingHome.id, {
        name: editingHome.name,
        location: editingHome.location,
        cutoffTime: editingHome.cutoffTime,
        primaryNurse: editingHome.primaryNurse,
        providerPartner: editingHome.providerPartner,
      });
      if (updated) {
        setSuccess('Home updated');
        setEditingHome(null);
        await onRefresh();
        await loadHomes();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to update home');
    } finally {
      setSaving(false);
    }
  };

  const deleteHome = async (id: string) => {
    const ok = window.confirm('Delete this home? This cannot be undone.');
    if (!ok) return;
    const removed = await api.deleteHome(id);
    if (removed) {
      setSuccess('Home deleted');
      await onRefresh();
      await loadHomes();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1722] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Home Management
            </h2>
            <p className="text-xs text-[#94a3b8] mt-1">
              {canGlobalManage ? 'Add, edit, and delete homes. View admins per home.' : 'View assigned home details.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#141d27] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}

          {canGlobalManage && !editingHome && (
            <form onSubmit={createHome} className="bg-[#0f1722] border border-[#1e293b] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Plus className="w-4 h-4" /> Create New Home
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="border rounded-lg p-2"
                  placeholder="Home ID (e.g. home-test-2)"
                  value={newHome.id}
                  onChange={(e) => setNewHome({ ...newHome, id: e.target.value })}
                  required
                />
                <input
                  className="border rounded-lg p-2"
                  placeholder="Home Name"
                  value={newHome.name}
                  onChange={(e) => setNewHome({ ...newHome, name: e.target.value })}
                  required
                />
                <input
                  className="border rounded-lg p-2"
                  placeholder="Location"
                  value={newHome.location}
                  onChange={(e) => setNewHome({ ...newHome, location: e.target.value })}
                />
                <input
                  type="time"
                  className="border rounded-lg p-2"
                  value={newHome.cutoffTime}
                  onChange={(e) => setNewHome({ ...newHome, cutoffTime: e.target.value })}
                />
              </div>
              <button
                disabled={saving}
                className="bg-emerald-600 text-[#e2e8f0] px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create Home'}
              </button>
            </form>
          )}

          <div>
            <div className="flex items-center gap-2 text-sm font-bold mb-2">
              <Building2 className="w-4 h-4" /> Homes ({homes.length})
            </div>
            {loading ? (
              <p className="text-xs text-[#94a3b8]">Loading...</p>
            ) : (
              <div className="space-y-2">
                {homes.map((h) => (
                  <div key={h.id} className="border rounded-xl px-3 py-3">
                    {editingHome?.id === h.id ? (
                      <form onSubmit={updateHome} className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            className="border rounded-lg p-2 text-xs"
                            value={editingHome.name}
                            onChange={(e) => setEditingHome({ ...editingHome, name: e.target.value })}
                            required
                          />
                          <input
                            className="border rounded-lg p-2 text-xs"
                            value={editingHome.location}
                            onChange={(e) => setEditingHome({ ...editingHome, location: e.target.value })}
                          />
                          <input
                            type="time"
                            className="border rounded-lg p-2 text-xs"
                            value={editingHome.cutoffTime}
                            onChange={(e) => setEditingHome({ ...editingHome, cutoffTime: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" disabled={saving} className="bg-emerald-600 text-[#e2e8f0] px-3 py-1.5 rounded-lg text-xs font-bold">
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button type="button" onClick={() => setEditingHome(null)} className="bg-[#141d27] text-[#e2e8f0] px-3 py-1.5 rounded-lg text-xs font-bold">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{h.name}</p>
                          <p className="text-xs text-[#94a3b8]">
                            {h.location} · Cutoff: {h.cutoffTime} AM · ID: {h.id}
                          </p>
                        </div>
                        {canGlobalManage && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditingHome(h)} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => deleteHome(h.id)} className="text-xs font-semibold text-rose-400 hover:text-rose-900 underline flex items-center gap-1">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {!homes.length && <p className="text-xs text-[#94a3b8]">No homes found.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
