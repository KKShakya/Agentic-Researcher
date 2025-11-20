import React from 'react';
import { Link2, ExternalLink } from 'lucide-react';

interface SourceListProps {
  chunks: Array<{ web?: { uri: string; title: string } }>;
}

export const SourceList: React.FC<SourceListProps> = ({ chunks }) => {
  // Filter out chunks that don't have web data and deduplicate by URI
  const validSources = chunks
    .filter((c) => c.web)
    .map((c) => c.web!)
    .reduce((acc, current) => {
      const x = acc.find(item => item.uri === current.uri);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as Array<{ uri: string; title: string }>);

  if (validSources.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-700">
      <h4 className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-4">
        <Link2 className="w-4 h-4" />
        Resources Gathered
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {validSources.map((source, idx) => (
          <a
            key={idx}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start p-3 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-all group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-400 truncate group-hover:text-blue-300">
                {source.title}
              </p>
              <p className="text-xs text-slate-500 truncate mt-1">
                {source.uri}
              </p>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 ml-2 mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
};