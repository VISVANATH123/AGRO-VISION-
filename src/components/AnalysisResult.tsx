import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { AlertTriangle, CheckCircle2, Info, Leaf } from 'lucide-react';
import { AnalysisResponse } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface AnalysisResultProps {
  result: AnalysisResponse;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const severityColors = {
    Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    High: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  const severityIcons = {
    Low: <CheckCircle2 size={20} />,
    Medium: <Info size={20} />,
    High: <AlertTriangle size={20} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mt-8 space-y-6"
    >
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Leaf size={18} />
              <span className="text-sm font-semibold uppercase tracking-wider">{result.crop_name}</span>
            </div>
            <h2 className="text-3xl font-bold text-stone-900">{result.disease_name}</h2>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-full border flex items-center gap-2 font-medium",
            severityColors[result.severity]
          )}>
            {severityIcons[result.severity]}
            {result.severity} Severity
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">💊</span>
              Recommended Treatment
            </h3>
            <div className="prose prose-emerald max-w-none text-stone-600 bg-stone-50 p-6 rounded-2xl border border-stone-100">
              <ReactMarkdown>{result.treatment}</ReactMarkdown>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Status</p>
              <p className="text-stone-800 font-medium">Diagnosis Complete</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <p className="text-xs font-bold text-stone-500 uppercase mb-1">Confidence</p>
              <p className="text-stone-800 font-medium">High (AI Analysis)</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
