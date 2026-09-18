import { Globe, Search } from 'lucide-react';

interface SerpPreviewProps {
  title: string;
  slug: string;
  description: string;
}

export function SerpPreview({ title, slug, description }: SerpPreviewProps) {
  const displayTitle = title || 'Route Title | FastForward Shuttle';
  const displaySlug = slug ? `/transfers/${slug}` : '/transfers/your-route-slug';
  const displayDesc =
    description ||
    'Book door-to-door private transfers from Paris Airports to Disneyland Paris. Fixed rates, free booster seats, and pay on arrival.';

  const titleLength = title.length;
  const descLength = description.length;

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Search className="w-4 h-4 text-brand-500" />
          <span>Live Google SERP Snippet Preview</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className={titleLength > 60 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
            Title: {titleLength}/60 chars
          </span>
          <span className={descLength > 160 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
            Meta Desc: {descLength}/160 chars
          </span>
        </div>
      </div>

      {/* Google Result Mockup Card */}
      <div className="bg-white rounded-xl p-4 text-slate-900 font-sans shadow-md space-y-1">
        {/* Favicon & Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <div className="w-4 h-4 rounded-full bg-gold-600 text-white flex items-center justify-center text-[9px] font-bold">
            E
          </div>
          <span className="font-medium text-slate-800">FastForward Shuttle</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 truncate">https://fastforwardshuttle.com{displaySlug}</span>
        </div>

        {/* Title */}
        <h3 className="text-blue-800 font-medium text-lg leading-snug hover:underline cursor-pointer">
          {displayTitle}
        </h3>

        {/* Snippet */}
        <p className="text-xs text-slate-600 leading-normal line-clamp-2">
          {displayDesc}
        </p>
      </div>
    </div>
  );
}
