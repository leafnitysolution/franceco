'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLocationAction, updateLocationAction, deleteLocationAction } from '@/lib/actions/routes';
import { MapPin, Plus, Building2, CheckCircle2, Loader2, Search, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';

interface LocationItemWithCount {
  id: string;
  name: string;
  shortCode: string;
  type?: string;
  originRoutes?: { id: string }[];
  destinationRoutes?: { id: string }[];
  createdAt?: string | Date;
}

interface LocationManagerProps {
  locations: LocationItemWithCount[];
}

export function LocationManager({ locations }: LocationManagerProps) {
  const router = useRouter();
  const [locList, setLocList] = useState<LocationItemWithCount[]>(locations);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [type, setType] = useState('CUSTOM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing state
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editShortCode, setEditShortCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Deleting state
  const [deletingLocId, setDeletingLocId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortCode.trim()) {
      setErrorMsg('Location name and short code are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await createLocationAction(name.trim(), shortCode.trim(), type);
      if (res.success && res.location) {
        const created = {
          ...res.location,
          originRoutes: [],
          destinationRoutes: [],
        } as LocationItemWithCount;

        setLocList([...locList, created].sort((a, b) => a.name.localeCompare(b.name)));
        setName('');
        setShortCode('');
        setShowAddForm(false);
        setSuccessMsg(`Successfully created location hub '${created.name}'.`);
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to add location hub.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while creating location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (loc: LocationItemWithCount) => {
    setEditingLocId(loc.id);
    setEditName(loc.name);
    setEditShortCode(loc.shortCode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const cancelEdit = () => {
    setEditingLocId(null);
    setEditName('');
    setEditShortCode('');
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() || !editShortCode.trim()) {
      setErrorMsg('Name and short code cannot be empty.');
      return;
    }

    setIsUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await updateLocationAction(id, editName.trim(), editShortCode.trim());
      if (res.success && res.location) {
        setLocList(
          locList.map((loc) => (loc.id === id ? { ...loc, name: res.location.name, shortCode: res.location.shortCode } : loc))
        );
        setEditingLocId(null);
        setSuccessMsg(`Successfully updated location hub '${res.location.name}'.`);
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to update location hub.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while updating location.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingLocId(id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await deleteLocationAction(id);
      if (res.success) {
        const deletedLoc = locList.find((l) => l.id === id);
        setLocList(locList.filter((l) => l.id !== id));
        setSuccessMsg(`Successfully deleted location hub '${deletedLoc?.name || id}'.`);
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to delete location hub.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while deleting location.');
    } finally {
      setDeletingLocId(null);
    }
  };

  const filteredLocations = locList.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4 text-gold-600" />
            <span>Transfer System Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Location Hubs & Transfer Destinations ({locList.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Create, edit, or delete origin and destination hubs used for fares, dropdowns, and route generation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-black text-xs shadow-md shadow-amber-900/10 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD NEW LOCATION HUB</span>
        </button>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add New Location Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 bg-amber-50/90 border border-amber-200/90 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gold-600" />
              <span>Create New Origin / Destination Hub</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Hub Location Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Parc Astérix Theme Park, Le Bourget Airport..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Short Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. AST"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500 uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Hub...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SAVE LOCATION HUB</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Filter location hubs by name or short code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
        />
      </div>

      {/* Locations Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map((loc) => {
          const routeCount = (loc.originRoutes?.length || 0) + (loc.destinationRoutes?.length || 0);
          const isEditing = editingLocId === loc.id;
          const isDeleting = deletingLocId === loc.id;

          if (isEditing) {
            return (
              <div key={loc.id} className="bg-amber-50/90 border-2 border-gold-400 rounded-2xl p-4 shadow-md space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="text-xs font-black uppercase text-gold-800 tracking-wider">Edit Location Hub</span>
                  <button type="button" onClick={cancelEdit} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Location Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Short Code</label>
                    <input
                      type="text"
                      value={editShortCode}
                      onChange={(e) => setEditShortCode(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500 uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleUpdate(loc.id)}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={loc.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-gold-400 transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    {loc.shortCode}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-2">{loc.name}</h4>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Edit Location Hub"
                    onClick={() => startEdit(loc)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-gold-50 text-slate-600 hover:text-gold-700 transition-colors border border-slate-200"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete Location Hub"
                    disabled={isDeleting}
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete '${loc.name}'?`)) {
                        handleDelete(loc.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors border border-slate-200 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-semibold">
                <span>Associated Routes:</span>
                <span className="font-bold text-slate-900">{routeCount} Routes</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
