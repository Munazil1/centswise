import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useData } from '@/contexts/DataContext';
import { Wallet, TrendingUp, TrendingDown, Package, PackageCheck, PackageX } from 'lucide-react';

export default function Dashboard() {
  const { metrics, recentTransactions } = useData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your financial overview.
          </p>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Total Collected"
            malayalamTitle="ആകെ സംഭാവന"
            value={formatCurrency(metrics.totalCollected)}
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="Total Spent"
            malayalamTitle="ആകെ ചെലവ്"
            value={formatCurrency(metrics.totalSpent)}
            icon={TrendingDown}
            variant="warning"
          />
          <MetricCard
            title="Available Balance"
            malayalamTitle="ബാക്കി തുക"
            value={formatCurrency(metrics.availableBalance)}
            icon={Wallet}
            variant="primary"
          />
        </div>

        {/* Property Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Items"
            malayalamTitle="ആകെ വസ്തുക്കൾ"
            value={metrics.totalItems}
            icon={Package}
          />
          <MetricCard
            title="Distributed"
            malayalamTitle="വിതരണം ചെയ്തവ"
            value={metrics.distributedItems}
            icon={PackageX}
          />
          <MetricCard
            title="Available"
            malayalamTitle="ലഭ്യമായവ"
            value={metrics.availableItems}
            icon={PackageCheck}
          />
        </div>

        {/* Recent Transactions & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions transactions={recentTransactions} />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
