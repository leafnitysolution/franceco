import { db } from '@/lib/db';
import { AdminMessagesClient } from '@/components/admin/AdminMessagesClient';
import { Mail, Clock, CheckCheck, Inbox } from 'lucide-react';

export const revalidate = 0;

export const metadata = {
  title: 'Contact Messages | FastForward Admin',
};

export default async function AdminMessagesPage() {
  const submissions = await db.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const totalCount = submissions.length;
  const unreadCount = submissions.filter((s) => !s.isRead).length;
  const readCount = submissions.filter((s) => s.isRead).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight flex items-center gap-2.5 font-serif">
            <Mail className="w-7 h-7 text-gold-600" />
            Contact Form Submissions
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            View, search, read, and manage customer inquiries submitted via the website contact form.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5D7BC] rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Inbox className="w-3.5 h-3.5 text-gold-600" />
            Total Inquiries
          </div>
          <div className="text-3xl font-black text-navy-900">{totalCount}</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Unread / Action Needed
          </div>
          <div className="text-3xl font-black text-amber-600">{unreadCount}</div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <CheckCheck className="w-3.5 h-3.5" />
            Processed / Read
          </div>
          <div className="text-3xl font-black text-emerald-700">{readCount}</div>
        </div>
      </div>

      {/* Messages Manager */}
      <AdminMessagesClient initialSubmissions={submissions} />
    </div>
  );
}
