import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, DollarSign, Calendar } from 'lucide-react';
import React from 'react';

interface DashboardStats {
  cases: {
    total: number;
    active: number;
    closed: number;
    pending: number;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  financial: {
    totalFees: number;
    totalPaid: number;
    totalPending: number;
  };
  recent: unknown[];
  upcoming: unknown[];
}

interface DashboardStatsCardsProps {
  stats: DashboardStats;
  formatCurrency: (amount: number) => string;
}

const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ stats, formatCurrency }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
        <Briefcase className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.cases.total}</div>
        <p className="text-xs text-muted-foreground">
          {stats.cases.active} active, {stats.cases.closed} closed
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.clients.total}</div>
        <p className="text-xs text-muted-foreground">
          {stats.clients.active} active, {stats.clients.inactive} inactive clients
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(stats.financial.totalFees)}</div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(stats.financial.totalPending)} pending
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Hearings</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.upcoming.length}</div>
        <p className="text-xs text-muted-foreground">
          Next 7 days
        </p>
      </CardContent>
    </Card>
  </div>
);

export default DashboardStatsCards; 