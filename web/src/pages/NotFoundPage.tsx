import React from 'react';
import { BatteryWarning, Home } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
        <BatteryWarning className="w-8 h-8" aria-hidden="true" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404 - Grid Node Not Found</h1>
      <p className="text-slate-600 max-w-md mx-auto text-sm">
        The requested URL does not correspond to an active service endpoint, policy document, or battery telemetry node.
      </p>
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition-colors shadow-xs inline-flex items-center space-x-2 text-sm"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          <span>Return to System Home</span>
        </button>
      </div>
    </div>
  );
};
