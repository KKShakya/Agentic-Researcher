import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  status: string;
}

export const Loader: React.FC<LoaderProps> = ({ status }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
      </div>
      <p className="text-slate-400 text-sm font-medium tracking-wider uppercase animate-pulse">
        {status}
      </p>
    </div>
  );
};