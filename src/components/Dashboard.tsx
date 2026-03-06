import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, History, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { Scan, Stat } from '@/src/types';
import { cn } from '@/src/lib/utils';

export default function Dashboard() {
  const [history, setHistory] = useState<Scan[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [historyRes, statsRes] = await Promise.all([
        fetch('/api/history'),
        fetch('/api/stats')
      ]);
      const historyData = await historyRes.json();
      const statsData = await statsRes.json();
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-full mb-4" />
        <div className="h-4 w-32 bg-stone-100 rounded" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <History size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Scans</p>
              <p className="text-2xl font-bold text-stone-900">{history.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <TrendingUp size={16} />
            <span>+12% from last week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Common Disease</p>
              <p className="text-2xl font-bold text-stone-900">
                {stats[0]?.disease_name || 'None'}
              </p>
            </div>
          </div>
          <p className="text-sm text-stone-500">Most frequent diagnosis</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Last Scan</p>
              <p className="text-2xl font-bold text-stone-900">
                {history[0] ? new Date(history[0].created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <p className="text-sm text-stone-500">Recent activity</p>
        </motion.div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-bottom border-stone-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-stone-900">Recent Scans</h3>
          <button className="text-emerald-600 font-semibold text-sm hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50">
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Crop & Disease</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Severity</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {history.map((scan) => (
                <tr key={scan.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={scan.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-stone-900">{scan.disease_name}</p>
                        <p className="text-xs text-stone-500">{scan.crop_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-bold",
                      scan.severity === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                      scan.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    )}>
                      {scan.severity}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-stone-600">
                    {new Date(scan.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button className="text-stone-400 hover:text-emerald-600 transition-colors">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-stone-500 italic">
                    No scan history found. Start by scanning a leaf.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
