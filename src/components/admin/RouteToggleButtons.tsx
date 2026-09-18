'use client';

import { useState } from 'react';
import { toggleRouteAction } from '@/lib/actions/routes';
import { Sparkles, Check, X } from 'lucide-react';

interface RouteToggleButtonsProps {
  routeId: string;
  isActive: boolean;
  isFeatured: boolean;
}

export function RouteToggleButtons({
  routeId,
  isActive: initialActive,
  isFeatured: initialFeatured,
}: RouteToggleButtonsProps) {
  const [active, setActive] = useState(initialActive);
  const [featured, setFeatured] = useState(initialFeatured);

  const handleToggleActive = async () => {
    const next = !active;
    setActive(next);
    await toggleRouteAction(routeId, 'isActive', next);
  };

  const handleToggleFeatured = async () => {
    const next = !featured;
    setFeatured(next);
    await toggleRouteAction(routeId, 'isFeatured', next);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggleActive}
        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all flex items-center gap-1 ${
          active
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}
      >
        {active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
        <span>{active ? 'ACTIVE' : 'INACTIVE'}</span>
      </button>

      <button
        type="button"
        onClick={handleToggleFeatured}
        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all flex items-center gap-1 ${
          featured
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            : 'bg-slate-800 text-slate-500 border-slate-700'
        }`}
      >
        <Sparkles className="w-3 h-3" />
        <span>{featured ? 'FEATURED' : 'STANDARD'}</span>
      </button>
    </div>
  );
}
