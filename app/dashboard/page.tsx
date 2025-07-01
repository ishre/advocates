'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from 'recharts';
import { 
  Calendar, 
  FileText, 
  Users, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Upload,
  Plus,
} from 'lucide-react';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  pendingFees: number;
  upcomingHearings: number;
  overdueTasks: number;
  completedTasks: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    pendingFees: 0,
    upcomingHearings: 0,
    overdueTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCase = () => {
    // TODO: Implement new case creation
    alert('New Case functionality coming soon!');
  };

  const handleNewClient = () => {
    // TODO: Implement new client creation
    alert('New Client functionality coming soon!');
  };

  const handleScheduleHearing = () => {
    // TODO: Implement hearing scheduling
    alert('Schedule Hearing functionality coming soon!');
  };

  const handleUploadDocument = () => {
    // TODO: Implement document upload
    alert('Upload Document functionality coming soon!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const caseTypeData = [
    { type: 'Civil', cases: 25 },
    { type: 'Criminal', cases: 15 },
    { type: 'Family', cases: 20 },
    { type: 'Corporate', cases: 10 },
    { type: 'Property', cases: 8 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
    
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCases} active, {stats.closedCases} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeClients} active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.pendingFees)} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Hearings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingHearings}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="hearings">Hearings</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Legal Case Manager</CardTitle>
              <CardDescription>Your comprehensive legal practice management solution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col" onClick={handleNewCase}>
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">New Case</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={handleNewClient}>
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Add Client</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={handleScheduleHearing}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Schedule Hearing</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={handleUploadDocument}>
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-sm">Upload Document</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cases Tab */}
        <TabsContent value="cases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                All Cases
                <Button variant="outline" size="sm" onClick={handleNewCase}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Case
                </Button>
              </CardTitle>
              <CardDescription>Manage and track all legal cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No cases found. Create your first case to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                All Clients
                <Button variant="outline" size="sm" onClick={handleNewClient}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Client
                </Button>
              </CardTitle>
              <CardDescription>Manage client information and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No clients found. Add your first client to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hearings Tab */}
        <TabsContent value="hearings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Upcoming Hearings
                <Button variant="outline" size="sm" onClick={handleScheduleHearing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Hearing
                </Button>
              </CardTitle>
              <CardDescription>Track court hearings and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No upcoming hearings found. Schedule your first hearing to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tasks & Deadlines</CardTitle>
              <CardDescription>Manage case-related tasks and important deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No tasks found. Create your first task to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
{/* Case Types Chart */}
<div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
            <CardDescription>Distribution of cases across different legal categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cases" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>      
    </>
  );
} 