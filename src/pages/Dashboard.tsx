import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Generation } from '../types/database';
import { TrendingUp, Clock, Zap, Music, Plus, Loader2 } from 'lucide-react';
import { formatDate, truncateText, formatDuration, getModelDisplayName } from '../lib/utils';

export const Dashboard = () => {
  const { profile } = useAuth();
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
  const [stats, setStats] = useState({
    monthlyGenerations: 0,
    monthlyTokens: 0,
    avgTime: 0,
    favoriteModel: 'V3_5' as const,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!profile) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: generations } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: monthlyGens } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', profile.id)
      .gte('created_at', startOfMonth.toISOString());

    if (generations) {
      setRecentGenerations(generations);
    }

    if (monthlyGens) {
      const totalTokens = monthlyGens.reduce((sum, gen) => sum + gen.tokens_used, 0);
      const completedGens = monthlyGens.filter((g) => g.completed_at);
      const avgTime = completedGens.length > 0
        ? completedGens.reduce((sum, gen) => {
            const start = new Date(gen.created_at).getTime();
            const end = new Date(gen.completed_at!).getTime();
            return sum + (end - start) / 1000;
          }, 0) / completedGens.length
        : 0;

      const modelCounts: Record<string, number> = {};
      monthlyGens.forEach((gen) => {
        modelCounts[gen.model] = (modelCounts[gen.model] || 0) + 1;
      });
      const favoriteModel = Object.keys(modelCounts).sort(
        (a, b) => modelCounts[b] - modelCounts[a]
      )[0] || 'V3_5';

      setStats({
        monthlyGenerations: monthlyGens.length,
        monthlyTokens: totalTokens,
        avgTime: Math.round(avgTime),
        favoriteModel: favoriteModel as any,
      });
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'processing':
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.full_name || 'there'}!
          </h1>
          <p className="text-gray-400">Here's what's happening with your music creations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stats.monthlyGenerations}</p>
            <p className="text-sm text-gray-400">Generations This Month</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stats.monthlyTokens}</p>
            <p className="text-sm text-gray-400">Tokens Used This Month</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stats.avgTime}s</p>
            <p className="text-sm text-gray-400">Avg Generation Time</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-pink-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{getModelDisplayName(stats.favoriteModel)}</p>
            <p className="text-sm text-gray-400">Favorite Model</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Generations</h2>
              <Link
                to="/history"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          {recentGenerations.length === 0 ? (
            <div className="p-12 text-center">
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No generations yet. Start creating music!</p>
              <Link
                to="/studio"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Music</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Prompt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentGenerations.map((gen) => (
                    <tr key={gen.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {gen.title || 'Untitled'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {truncateText(gen.prompt, 50)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {getModelDisplayName(gen.model)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDuration(gen.duration_seconds)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(gen.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            gen.status
                          )}`}
                        >
                          {gen.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Ready to create?</h3>
          <p className="text-blue-100 mb-6">Transform your ideas into music with AI</p>
          <Link
            to="/studio"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Music</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
