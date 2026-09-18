import { VehicleTier } from '@/types';
import { Users, Briefcase, Baby, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface VehicleCardProps {
  tier: VehicleTier;
  title: string;
  paxLimit: number;
  bagLimit: number;
  price: number;
  rateLabel?: string;
  isRoundTrip?: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function VehicleCard({
  tier,
  title,
  paxLimit,
  bagLimit,
  price,
  rateLabel,
  isRoundTrip = false,
  isSelected,
  onSelect,
}: VehicleCardProps) {
  const finalFare = isRoundTrip ? price * 2 : price;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group ${
        isSelected
          ? 'bg-gradient-to-b from-[#F7F2E7] to-white border-gold-600 ring-2 ring-gold-500/30 shadow-md scale-[1.02]'
          : 'bg-white border-[#E5D7BC]/80 hover:border-gold-500 hover:bg-[#F5F3ED]/40 hover:scale-[1.01]'
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-1 bg-gold-600 text-white rounded-full p-1 shadow-md z-10">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      <div className="space-y-2.5 w-full">
        {/* Title & Price Header */}
        <div className="flex items-start justify-between gap-1">
          <div>
            <h4 className="font-serif font-bold text-navy-900 text-xs sm:text-sm leading-snug tracking-tight">
              {title}
            </h4>
            {rateLabel && (
              <span className="text-[10px] font-bold text-gold-800 bg-[#F7F2E7] px-1.5 py-0.5 rounded border border-[#E5D7BC] inline-block mt-0.5">
                {rateLabel}
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm sm:text-base font-extrabold text-navy-900">
              {formatCurrency(finalFare)}
            </span>
            {isRoundTrip && (
              <span className="block text-[9px] text-slate-500 font-bold">
                (Round Trip)
              </span>
            )}
          </div>
        </div>

        {/* Feature Specs Pills */}
        <div className="flex flex-wrap items-center gap-1 text-[10px] font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1 bg-[#F5F3ED] px-2 py-0.5 rounded-md border border-[#E5D7BC]/60 text-navy-900 font-medium">
            <Users className="w-3 h-3 text-gold-600" />
            <span>Up to {paxLimit}</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-[#F5F3ED] px-2 py-0.5 rounded-md border border-[#E5D7BC]/60 text-navy-900 font-medium">
            <Briefcase className="w-3 h-3 text-gold-600" />
            <span>{bagLimit} Bags</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-700 font-bold">
            <Baby className="w-3 h-3 text-emerald-600" />
            <span>Free Seats</span>
          </span>
        </div>
      </div>
    </button>
  );
}
