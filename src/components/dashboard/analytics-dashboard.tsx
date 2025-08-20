"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import {
  BarChart3,
  TrendingUp,
  Mail,
  Users,
  MessageSquare,
  Target,
  Calendar,
  Award,
  Zap,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  overview: {
    total_emails_sent: number;
    total_responses: number;
    response_rate: number;
    positive_responses: number;
    meetings_scheduled: number;
    total_leads: number;
    active_leads: number;
    conversion_rate: number;
  };
  trends: {
    emails_by_day: Array<{ date: string; count: number; responses: number; }>;
    response_times: Array<{ period: string; avg_hours: number; }>;
    lead_quality_trends: Array<{ date: string; avg_score: number; }>;
  };
  performance: {
    best_performing_subjects: Array<{ subject: string; response_rate: number; sent: number; }>;
    top_companies: Array<{ company: string; emails_sent: number; responses: number; }>;
    geographical_insights: Array<{ state: string; leads: number; response_rate: number; }>;
    time_optimization: Array<{ hour: number; response_rate: number; emails_sent: number; }>;
  };
  goals: {
    weekly_target: number;
    weekly_progress: number;
    monthly_target: number;
    monthly_progress: number;
    success_streak: number;
    longest_streak: number;
  };
}

export default function AnalyticsDashboard() {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await fetchAnalytics();
  };

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/analytics/export?timeRange=${timeRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `job-hunter-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Unavailable</h3>
        <p className="text-gray-600 mb-4">Unable to load analytics data. Please try again.</p>
        <Button onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const formatTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    return {
      percentage: Math.abs(change).toFixed(1),
      isPositive,
      icon: isPositive ? ArrowUp : ArrowDown,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive insights into your job search performance</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalytics}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_emails_sent}</p>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+12.5% vs last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.response_rate.toFixed(1)}%</p>
              <div className="flex items-center space-x-1 mt-2">
                <ArrowUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+2.1% vs last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Leads</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.active_leads}</p>
              <div className="flex items-center space-x-1 mt-2">
                <Target className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-gray-600">{analytics.overview.total_leads} total</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.conversion_rate.toFixed(1)}%</p>
              <div className="flex items-center space-x-1 mt-2">
                <Award className="w-3 h-3 text-yellow-600" />
                <span className="text-xs text-gray-600">{analytics.overview.meetings_scheduled} meetings</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Goals & Progress */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Weekly Progress</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Email Target</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.goals.weekly_progress}/{analytics.goals.weekly_target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((analytics.goals.weekly_progress / analytics.goals.weekly_target) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {analytics.goals.success_streak}
                </div>
                <div className="text-xs text-gray-600">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {analytics.goals.longest_streak}
                </div>
                <div className="text-xs text-gray-600">Best Streak</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Monthly Overview</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Monthly Target</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.goals.monthly_progress}/{analytics.goals.monthly_target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((analytics.goals.monthly_progress / analytics.goals.monthly_target) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {analytics.overview.positive_responses}
                </div>
                <div className="text-xs text-gray-600">Positive Responses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {analytics.overview.meetings_scheduled}
                </div>
                <div className="text-xs text-gray-600">Meetings Booked</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performing Subject Lines</h3>
          <div className="space-y-3">
            {analytics.performance.best_performing_subjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {subject.subject}
                  </p>
                  <p className="text-xs text-gray-600">
                    {subject.sent} sent
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">
                    {subject.response_rate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">response rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Companies by Engagement</h3>
          <div className="space-y-3">
            {analytics.performance.top_companies.map((company, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {company.company}
                  </p>
                  <p className="text-xs text-gray-600">
                    {company.emails_sent} emails sent
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-600">
                    {company.responses}
                  </div>
                  <div className="text-xs text-gray-500">responses</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Optimization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Optimal Send Times</h3>
            <p className="text-sm text-gray-600">Best hours for email responses</p>
          </div>
        </div>

        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {analytics.performance.time_optimization.map((timeSlot) => (
            <div 
              key={timeSlot.hour}
              className="text-center p-2 rounded-lg border border-gray-200"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${timeSlot.response_rate / 100})`,
                color: timeSlot.response_rate > 50 ? 'white' : 'black'
              }}
            >
              <div className="text-xs font-medium">
                {timeSlot.hour}:00
              </div>
              <div className="text-xs mt-1">
                {timeSlot.response_rate.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>Low Response</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span>Medium Response</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span>High Response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geographical Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Target className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Geographical Performance</h3>
            <p className="text-sm text-gray-600">Response rates by state</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {analytics.performance.geographical_insights.map((geo, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{geo.state}</span>
                <span className="text-sm font-bold text-green-600">
                  {geo.response_rate.toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {geo.leads} leads contacted
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="bg-green-600 h-1 rounded-full"
                  style={{ width: `${geo.response_rate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}