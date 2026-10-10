import React, { useState } from 'react';
import { Columns, Eye, Calendar, MapPin, Sparkles } from 'lucide-react';

export function BeforeAfterSlider({ pair }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isSideBySide, setIsSideBySide] = useState(false);

  if (!pair || !pair.beforeImage || !pair.afterImage) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500">
        <p className="font-medium text-slate-700">No before-and-after photo comparison published yet.</p>
        <p className="text-xs text-slate-400 mt-1">
          Comparative photographic evidence will appear once official work validation reviews are completed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            Infrastructure Transformation Evidence
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified comparative viewpoint documentation
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSideBySide(!isSideBySide)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors self-start sm:self-auto"
        >
          <Columns className="w-3.5 h-3.5" />
          {isSideBySide ? 'Switch to Slider' : 'View Side-by-Side'}
        </button>
      </div>

      {/* Metadata labels */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 rounded-lg p-2.5 border border-slate-100">
        {pair.viewpoint && (
          <span className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Viewpoint: <strong className="text-slate-800">{pair.viewpoint}</strong>
          </span>
        )}
        <div className="flex items-center gap-3 text-slate-500">
          {pair.beforeDate && (
            <span>Before: <strong className="text-slate-700">{pair.beforeDate}</strong></span>
          )}
          {pair.afterDate && (
            <span>After: <strong className="text-emerald-700">{pair.afterDate}</strong></span>
          )}
        </div>
      </div>

      {/* Comparison Viewer */}
      {isSideBySide ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
            <img
              src={pair.beforeImage}
              alt="Before condition"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Before ({pair.beforeDate || 'Pre-work'})
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
            <img
              src={pair.afterImage}
              alt="After condition"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-emerald-700/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              After ({pair.afterDate || 'Post-work'})
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video select-none bg-slate-900">
          {/* After image (background) */}
          <img
            src={pair.afterImage}
            alt="After condition"
            className="w-full h-full object-cover pointer-events-none"
          />

          {/* Before image (clipped overlay) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={pair.beforeImage}
              alt="Before condition"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: `${100 / (sliderPos / 100 || 1)}%` }}
            />
          </div>

          {/* Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-lg border border-slate-300 flex items-center justify-center text-slate-800 text-xs font-bold">
              ↔
            </div>
          </div>

          {/* Range input slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            aria-label="Drag to compare before and after photos"
          />

          {/* Corner Badges */}
          <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider pointer-events-none">
            Before
          </div>
          <div className="absolute top-3 right-3 z-10 bg-emerald-700/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider pointer-events-none">
            After
          </div>
        </div>
      )}

      {/* Honest Synthetic Demo Label Notice */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 italic bg-amber-50/60 border border-amber-200/60 rounded-lg px-3 py-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          {pair.label || 'Synthetic Demonstration Illustration'}: Demonstrates matched-angle before/after visual verification. Not presented as genuine legal record.
        </span>
      </div>
    </div>
  );
}
