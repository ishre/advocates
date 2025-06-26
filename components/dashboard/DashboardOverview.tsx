'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  // Mock data - replace with real data from API
  const stats = [
    {
      title: 'Active Cases',
      value: '24',
      change: '+12%',
      icon: Briefcase,
      href: '/dashboard/cases',
    },
    {
      title: 'Total Clients',
      value: '156',
      change: '+8%',
      icon: Users,
      href: '/dashboard/clients',
    },
    {
      title: 'Documents',
      value: '1,234',
      change: '+23%',
      icon: FileText,
      href: '/dashboard/documents',
    },
    {
      title: 'Upcoming Hearings',
      value: '8',
      change: 'This week',
      icon: Calendar,
      href: '/dashboard/calendar',
    },
  ];

  const recentCases = [
    {
      id: '1',
      title: 'Smith vs. Johnson',
      caseNumber: 'CR-2024-001',
      status: 'active',
      nextHearing: '2024-01-15',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Brown Estate Case',
      caseNumber: 'PR-2024-002',
      status: 'pending',
      nextHearing: '2024-01-20',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Corporate Dispute',
      caseNumber: 'CV-2024-003',
      status: 'active',
      nextHearing: '2024-01-18',
      priority: 'urgent',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, Advocate!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your cases today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Cases
              <Link href="/dashboard/cases">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>
              Your most recent case updates and upcoming hearings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases.map((case_) => (
                <div
                  key={case_.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{case_.title}</h4>
                      <Badge className={getStatusColor(case_.status)}>
                        {case_.status}
                      </Badge>
                      <Badge className={getPriorityColor(case_.priority)}>
                        {case_.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{case_.caseNumber}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Next hearing: {case_.nextHearing}
                    </p>
                  </div>
                  <Link href={`/dashboard/cases/${case_.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/cases/new">
              <Button className="w-full justify-start" variant="outline">
                <Briefcase className="mr-2 h-4 w-4" />
                New Case
              </Button>
            </Link>
            <Link href="/dashboard/clients/new">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </Link>
            <Link href="/dashboard/documents/upload">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Hearing
              </Button>
            </Link>
            <Link href="/dashboard/financial/invoices/new">
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
            Important Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Clock className="mr-3 h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Upcoming Deadline
                </p>
                <p className="text-xs text-orange-600">
                  Filing deadline for Smith vs. Johnson case is tomorrow
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <TrendingUp className="mr-3 h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  New Document Uploaded
                </p>
                <p className="text-xs text-blue-600">
                  Client uploaded new evidence for Brown Estate case
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 