'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createLocationAction,
  updateLocationAction,
  deleteLocationAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/lib/actions/routes';
import {
  MapPin,
  Plus,
  Building2,
  CheckCircle2,
  Loader2,
  Search,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Tag,
  FolderPlus,
  Layers,
} from 'lucide-react';

interface LocationItemWithCount {
  id: string;
  name: string;
  shortCode: string;
  category?: string;
  type?: string;
  originRoutes?: { id: string }[];
  destinationRoutes?: { id: string }[];
  createdAt?: string | Date;
}

interface CategoryItem {
  id: string;
  key: string;
  name: string;
  sortOrder?: number;
}

interface LocationManagerProps {
  locations: LocationItemWithCount[];
  initialCategories?: CategoryItem[];
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', key: 'AIRPORT', name: 'Paris Airports' },
  { id: 'cat-2', key: 'AMUSEMENT_PARK', name: 'Euro Disney Paris' },
  { id: 'cat-3', key: 'CITY_CENTER', name: 'Paris' },
  { id: 'cat-4', key: 'TRAIN_STATION', name: 'Paris Train Stations' },
  { id: 'cat-5', key: 'PALACE', name: 'Other' },
];

export function LocationManager({ locations, initialCategories = [] }: LocationManagerProps) {
  const router = useRouter();

  // Locations state
  const [locList, setLocList] = useState<LocationItemWithCount[]>(locations);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [category, setCategory] = useState('AIRPORT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing location state
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editShortCode, setEditShortCode] = useState('');
  const [editCategory, setEditCategory] = useState('AIRPORT');
  const [isUpdating, setIsUpdating] = useState(false);

  // Deleting location state
  const [deletingLocId, setDeletingLocId] = useState<string | null>(null);

  // Categories state
  const [catList, setCatList] = useState<CategoryItem[]>(
    initialCategories.length > 0 ? initialCategories : DEFAULT_CATEGORIES
  );
  const [showAddCatForm, setShowAddCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isSavingCat, setIsSavingCat] = useState(false);

  // Editing category state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [isUpdatingCat, setIsUpdatingCat] = useState(false);

  // --- LOCATION HUB HANDLERS ---
  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortCode.trim()) {
      setErrorMsg('Location name and short code are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await createLocationAction(name.trim(), shortCode.trim(), category);
      if (res.success && res.location) {
        const created = {
          ...res.location,
          originRoutes: [],
          destinationRoutes: [],
        } as LocationItemWithCount;

        setLocList([...locList, created].sort((a, b) => a.name.localeCompare(b.name)));
        setName('');
        setShortCode('');
        setCategory(catList[0]?.key || 'AIRPORT');
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

  const startEditLocation = (loc: LocationItemWithCount) => {
    setEditingLocId(loc.id);
    setEditName(loc.name);
    setEditShortCode(loc.shortCode);
    setEditCategory(loc.category || loc.type || catList[0]?.key || 'AIRPORT');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const cancelEditLocation = () => {
    setEditingLocId(null);
    setEditName('');
    setEditShortCode('');
    setEditCategory('AIRPORT');
  };

  const handleUpdateLocation = async (id: string) => {
    if (!editName.trim() || !editShortCode.trim()) {
      setErrorMsg('Name and short code cannot be empty.');
      return;
    }

    setIsUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await updateLocationAction(id, editName.trim(), editShortCode.trim(), editCategory);
      if (res.success && res.location) {
        setLocList(
          locList.map((loc) =>
            loc.id === id
              ? {
                  ...loc,
                  name: res.location.name,
                  shortCode: res.location.shortCode,
                  category: res.location.category,
                }
              : loc
          )
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

  const handleDeleteLocation = async (id: string) => {
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

  // --- CATEGORY HANDLERS ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setErrorMsg('Category name cannot be empty.');
      return;
    }

    setIsSavingCat(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await createCategoryAction(newCatName.trim());
      if (res.success && res.category) {
        setCatList([...catList, res.category]);
        setNewCatName('');
        setShowAddCatForm(false);
        setSuccessMsg(`Successfully created category '${res.category.name}'.`);
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to create category.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while creating category.');
    } finally {
      setIsSavingCat(false);
    }
  };

  const startEditCategory = (cat: CategoryItem) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCatName.trim()) {
      setErrorMsg('Category name cannot be empty.');
      return;
    }

    setIsUpdatingCat(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await updateCategoryAction(id, editCatName.trim());
      if (res.success && res.category) {
        setCatList(catList.map((c) => (c.id === id ? res.category : c)));
        setEditingCatId(null);
        setSuccessMsg(`Successfully updated category name to '${res.category.name}'.`);
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to update category.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while updating category.');
    } finally {
      setIsUpdatingCat(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!confirm(`Are you sure you want to delete category '${cat.name}'?`)) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await deleteCategoryAction(cat.id);
      if (res.success) {
        setCatList(catList.filter((c) => c.id !== cat.id));
        setSuccessMsg(`Successfully deleted category '${cat.name}'.`);
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to delete category.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while deleting category.');
    }
  };

  const filteredLocations = locList.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.category && l.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4 text-gold-600" />
            <span>Transfer System Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Location Hubs & Categories ({locList.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage origin/destination hubs and control dropdown section header categories dynamically.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setShowAddCatForm(!showAddCatForm);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 shrink-0"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>+ ADD CATEGORY</span>
          </button>

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
            <span>+ ADD LOCATION HUB</span>
          </button>
        </div>
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

      {/* ========================================================================= */}
      {/* SECTION 1: LOCATION CATEGORIES MANAGEMENT (NEW DYNAMIC CATEGORIES CONTROL) */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Location Categories & Header Groups ({catList.length})
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Add, edit, or remove dropdown section headers used on the booking form.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddCatForm(!showAddCatForm)}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-100 transition-all"
          >
            {showAddCatForm ? 'Cancel' : '+ New Category'}
          </button>
        </div>

        {/* Add New Category Form */}
        {showAddCatForm && (
          <form onSubmit={handleCreateCategory} className="p-4 bg-white border border-amber-300 rounded-2xl space-y-3 animate-in fade-in">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider">Add New Dropdown Category Header</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="text"
                required
                placeholder="e.g. Tours & Excursions, Luxury Hotels, Train Stations..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500"
              />
              <button
                type="submit"
                disabled={isSavingCat}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
              >
                {isSavingCat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>Save Category</span>
              </button>
            </div>
          </form>
        )}

        {/* Categories Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {catList.map((cat) => {
            const isEditingCat = editingCatId === cat.id;
            const linkedHubCount = locList.filter((l) => l.category === cat.key).length;

            if (isEditingCat) {
              return (
                <div key={cat.id} className="p-3 bg-amber-50 border-2 border-gold-400 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-gold-800">Edit Category</span>
                    <button type="button" onClick={() => setEditingCatId(null)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500"
                  />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      disabled={isUpdatingCat}
                      onClick={() => handleUpdateCategory(cat.id)}
                      className="w-full py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1"
                    >
                      {isUpdatingCat ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={cat.id} className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs hover:border-slate-300 transition-all">
                <div className="min-w-0 pr-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block truncate">
                    {cat.key}
                  </span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {cat.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                    {linkedHubCount} hub(s) linked
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Edit Category Name"
                    onClick={() => startEditCategory(cat)}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title="Delete Category"
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: LOCATION HUBS MANAGEMENT */}
      {/* ========================================================================= */}

      {/* Add New Location Form */}
      {showAddForm && (
        <form onSubmit={handleCreateLocation} className="p-6 bg-amber-50/90 border border-amber-200/90 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-3">
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
                onChange={(e) => setShortCode(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="text-xs font-bold text-slate-700">Display Category (Dropdown Header Group) *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                {catList.map((cat) => (
                  <option key={cat.id} value={cat.key}>
                    {cat.name} ({cat.key})
                  </option>
                ))}
              </select>
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
          placeholder="Filter location hubs by name, short code, or category..."
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
                  <button type="button" onClick={cancelEditLocation} className="text-slate-400 hover:text-slate-700">
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
                      onChange={(e) => setEditShortCode(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Display Category (Header Group)</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      {catList.map((cat) => (
                        <option key={cat.id} value={cat.key}>
                          {cat.name} ({cat.key})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelEditLocation}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleUpdateLocation(loc.id)}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            );
          }

          const matchedCat = catList.find((c) => c.key === loc.category);
          const currentCatLabel = matchedCat ? matchedCat.name : loc.category || 'CUSTOM';

          return (
            <div key={loc.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-gold-400 transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-white">
                      {loc.shortCode}
                    </span>
                    <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5 text-amber-600" />
                      <span>{currentCatLabel}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-2">{loc.name}</h4>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Edit Location Hub & Category"
                    onClick={() => startEditLocation(loc)}
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
                        handleDeleteLocation(loc.id);
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
