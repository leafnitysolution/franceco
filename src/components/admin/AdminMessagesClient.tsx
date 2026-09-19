'use client';

import { useState } from 'react';
import {
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  Search,
  Phone,
  User,
  Calendar,
  AlertTriangle,
  Eye,
  Filter,
  CheckCheck,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface AdminMessagesClientProps {
  initialSubmissions: ContactSubmission[];
}

export function AdminMessagesClient({ initialSubmissions }: AdminMessagesClientProps) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);

  const [viewMessage, setViewMessage] = useState<ContactSubmission | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Submissions
  const filteredSubmissions = submissions.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.phone && item.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'UNREAD' && !item.isRead) ||
      (statusFilter === 'READ' && item.isRead);

    return matchesSearch && matchesStatus;
  });

  // Toggle Read Status
  const handleToggleRead = async (id: string, currentReadState: boolean) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !currentReadState }),
      });

      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((sub) => (sub.id === id ? { ...sub, isRead: !currentReadState } : sub))
        );
        if (viewMessage && viewMessage.id === id) {
          setViewMessage({ ...viewMessage, isRead: !currentReadState });
        }
      }
    } catch (err) {
      console.error('Failed to toggle read state:', err);
    }
  };

  // Delete Single Message
  const handleDeleteSingle = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
        setSelectedSubmissions((prev) => prev.filter((item) => item !== id));
        if (viewMessage?.id === id) setViewMessage(null);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedSubmissions.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        selectedSubmissions.map((id) =>
          fetch(`/api/contact/${id}`, { method: 'DELETE' })
        )
      );
      setSubmissions((prev) => prev.filter((item) => !selectedSubmissions.includes(item.id)));
      setSelectedSubmissions([]);
    } catch (err) {
      console.error('Failed bulk delete:', err);
    } finally {
      setIsDeleting(false);
      setIsBulkDeleting(false);
    }
  };

  // Selection Checkbox Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedSubmissions(filteredSubmissions.map((s) => s.id));
    } else {
      setSelectedSubmissions([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedSubmissions.includes(id)) {
      setSelectedSubmissions(selectedSubmissions.filter((item) => item !== id));
    } else {
      setSelectedSubmissions([...selectedSubmissions, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Filters */}
      <div className="bg-white p-5 rounded-3xl border border-[#E5D7BC] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FBF9F5] border border-[#E5D7BC] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-navy-900 focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Filters & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#FBF9F5] border border-[#E5D7BC] px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-gold-600" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer text-navy-900 font-extrabold"
            >
              <option value="ALL">All Messages ({submissions.length})</option>
              <option value="UNREAD">Unread ({submissions.filter((s) => !s.isRead).length})</option>
              <option value="READ">Read ({submissions.filter((s) => s.isRead).length})</option>
            </select>
          </div>

          {/* Bulk Delete Button */}
          {selectedSubmissions.length > 0 && (
            <button
              type="button"
              onClick={() => setIsBulkDeleting(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 animate-in fade-in"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedSubmissions.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-3xl border border-[#E5D7BC] shadow-sm overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F7F2E7] border border-[#E5D7BC] flex items-center justify-center mx-auto text-gold-700">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-navy-900">No Contact Messages Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When visitors submit the Contact Us form on your website, their inquiries will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF9F5] border-b border-[#E5D7BC] text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredSubmissions.length > 0 &&
                        selectedSubmissions.length === filteredSubmissions.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-gold-600 focus:ring-gold-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Message Snippet</th>
                  <th className="py-3.5 px-4">Received Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredSubmissions.map((sub) => {
                  const dateStr = new Date(sub.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-[#FBF9F5]/80 transition-colors ${
                        !sub.isRead ? 'bg-amber-50/40 font-bold' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.includes(sub.id)}
                          onChange={() => handleSelectRow(sub.id)}
                          className="rounded border-slate-300 text-gold-600 focus:ring-gold-500 cursor-pointer"
                        />
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {!sub.isRead ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-black uppercase">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Unread
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-extrabold uppercase">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            Read
                          </span>
                        )}
                      </td>

                      {/* Sender Details */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-navy-900 text-xs flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                            <span>{sub.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{sub.email}</span>
                          </div>
                          {sub.phone && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{sub.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-4 font-bold text-navy-900">
                        <span className="bg-[#F7F2E7] px-2.5 py-1 rounded-lg border border-[#E5D7BC] inline-block text-[11px]">
                          {sub.subject}
                        </span>
                      </td>

                      {/* Message Snippet */}
                      <td className="py-4 px-4 max-w-xs truncate text-slate-600 font-normal">
                        {sub.message}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Full Message */}
                          <button
                            type="button"
                            onClick={() => {
                              setViewMessage(sub);
                              if (!sub.isRead) handleToggleRead(sub.id, false);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                            title="View Full Message"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle Read */}
                          <button
                            type="button"
                            onClick={() => handleToggleRead(sub.id, sub.isRead)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              sub.isRead
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={sub.isRead ? 'Mark as Unread' : 'Mark as Read'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(sub.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW MESSAGE MODAL */}
      {viewMessage && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#E5D7BC] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-gold-700 tracking-wider bg-[#F7F2E7] px-3 py-1 rounded-full border border-[#E5D7BC]">
                  CONTACT INQUIRY DETAILS
                </span>
                <h3 className="font-serif text-xl font-bold text-navy-900 mt-2">
                  {viewMessage.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewMessage(null)}
                className="text-slate-400 hover:text-navy-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#FBF9F5] p-4 rounded-2xl border border-[#E5D7BC]">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Sender Name</div>
                <div className="font-extrabold text-navy-900">{viewMessage.name}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Email Address</div>
                <div className="font-bold text-navy-900">{viewMessage.email}</div>
              </div>
              {viewMessage.phone && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Phone Number</div>
                  <div className="font-bold text-navy-900">{viewMessage.phone}</div>
                </div>
              )}
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Date Received</div>
                <div className="font-bold text-navy-900">
                  {new Date(viewMessage.createdAt).toLocaleString('en-GB')}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Message Content
              </label>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-wrap max-h-60 overflow-y-auto">
                {viewMessage.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`mailto:${viewMessage.email}?subject=RE: ${encodeURIComponent(
                  viewMessage.subject
                )}`}
                className="px-5 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Reply via Email</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleRead(viewMessage.id, viewMessage.isRead)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  {viewMessage.isRead ? 'Mark Unread' : 'Mark Read'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetId(viewMessage.id);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#E5D7BC] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-navy-900">Delete Contact Message?</h3>
              <p className="text-xs text-slate-500 font-medium">
                Are you sure you want to permanently delete this contact inquiry? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteSingle(deleteTargetId)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#E5D7BC] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-navy-900">
                Delete {selectedSubmissions.length} Selected Messages?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                This will permanently delete all {selectedSubmissions.length} selected messages from the database.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleting(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
