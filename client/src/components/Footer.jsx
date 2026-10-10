import React from 'react';
import { Shield, ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                TransparanceCity
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              TransparanceCity empowers citizens with open transparency into municipal infrastructure works,
              accountable expenditure audits, explainable inter-departmental coordination, and durable civic problem resolution.
            </p>
            <div className="inline-block bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-amber-300">
              ⚡ Built for the CivicTech Hackathon — Demonstration Dataset Active
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-1.5">
              <li><a href="/" className="hover:text-white transition-colors">Explore Projects</a></li>
              <li><a href="/insights" className="hover:text-white transition-colors">Community Heatmap</a></li>
              <li><a href="/reports/new" className="hover:text-white transition-colors">Report an Issue</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Official Portal</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Transparency Principles</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Real Milestone Weighting</li>
              <li>• Explainable Rules Engine</li>
              <li>• 250m Privacy Grid Protection</li>
              <li>• Integer Paise Financial Storage</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            &copy; 2026 TransparanceCity. Open Source under MIT License.
          </div>
          <div className="flex items-center gap-4">
            <span>Synthetic Demonstration Data (Chennai, Bengaluru, Hyderabad)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
