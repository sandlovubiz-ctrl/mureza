import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TokenPackage, TokenTransaction } from '../types/database';
import { Coins, TrendingUp, Loader2, CheckCircle } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const Billing = () => {
  const { profile, refreshProfile } = useAuth();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    if (!profile) return;

    const [packagesResult, transactionsResult] = await Promise.all([
      supabase.from('token_packages').select('*').eq('is_active', true).order('display_order'),
      supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    if (packagesResult.data) setPackages(packagesResult.data);
    if (transactionsResult.data) setTransactions(transactionsResult.data);

    setLoading(false);
  };

  const handlePurchase = async (pkg: TokenPackage) => {
    if (!profile) return;

    setProcessingPackageId(pkg.id);

    try {
      const { error: txError } = await supabase.from('token_transactions').insert({
        user_id: profile.id,
        transaction_type: 'purchase',
        token_amount: pkg.token_amount,
        price_usd: pkg.price_usd,
        package_name: pkg.name,
        stripe_payment_id: `sim_${Date.now()}`,
      });

      if (txError) throw txError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          token_balance: profile.token_balance + pkg.token_amount,
          total_tokens_purchased: profile.total_tokens_purchased + pkg.token_amount,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      await fetchBillingData();
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setProcessingPackageId(null);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'usage':
        return 'text-blue-400 bg-blue-400/10';
      case 'refund':
        return 'text-yellow-400 bg-yellow-400/10';
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
          <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
          <p className="text-gray-400">Manage your tokens and billing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{profile?.token_balance || 0}</p>
            <p className="text-sm text-gray-400">Current Balance</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{profile?.total_tokens_purchased || 0}</p>
            <p className="text-sm text-gray-400">Total Purchased</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{profile?.total_tokens_used || 0}</p>
            <p className="text-sm text-gray-400">Total Used</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Token Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-blue-500/50 transition-all"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                  {pkg.description && <p className="text-sm text-gray-400 mb-4">{pkg.description}</p>}
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${pkg.price_usd}</span>
                  </div>
                  <div className="bg-slate-800 rounded-lg py-3 px-4">
                    <p className="text-2xl font-bold text-blue-400">{pkg.token_amount}</p>
                    <p className="text-sm text-gray-400">tokens</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={processingPackageId === pkg.id}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {processingPackageId === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Buy Now</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-white">Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Coins className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tokens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(
                            tx.transaction_type
                          )}`}
                        >
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {tx.package_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        {tx.token_amount > 0 ? '+' : ''}
                        {tx.token_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {tx.price_usd ? `$${tx.price_usd.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
