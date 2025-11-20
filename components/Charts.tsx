import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { TopicAnalytics } from '../types';

interface ChartsProps {
  data: TopicAnalytics;
}

export const AnalyticsCharts: React.FC<ChartsProps> = ({ data }) => {
  const radarData = [
    { subject: 'Complexity', A: data.complexity, fullMark: 100 },
    { subject: 'Relevance', A: data.relevance, fullMark: 100 },
    { subject: 'Sentiment', A: data.sentiment, fullMark: 100 },
    { subject: 'Length', A: Math.min(data.readingTimeMinutes * 10, 100), fullMark: 100 }, // Normalize reading time slightly
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Radar Chart: Core Metrics */}
      <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
        <h3 className="text-slate-300 text-sm font-semibold mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">
          Core Metrics
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Metrics"
                dataKey="A"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#60a5fa' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Key Topics */}
      <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
        <h3 className="text-slate-300 text-sm font-semibold mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">
          Key Topics Prominence
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.keyTopics}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
              />
              <Tooltip 
                 cursor={{fill: '#334155', opacity: 0.2}}
                 contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {data.keyTopics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#ec4899'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};