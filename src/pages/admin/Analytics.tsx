import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  RefreshCw,
  UserCheck,
  UserX,
  Timer
} from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { analyticsService, type AnalyticsData } from '@/services/analyticsService';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    visitors: null,
    checkins: null,
    topHosts: null,
    recentActivity: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const analyticsData = await analyticsService.getAllAnalytics({
        from: dateRange.from,
        to: dateRange.to
      });

      setData(analyticsData);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    const now = new Date();
    let from: Date;

    switch (range) {
      case '7d':
        from = subDays(now, 7);
        break;
      case '30d':
        from = subDays(now, 30);
        break;
      case '90d':
        from = subDays(now, 90);
        break;
      default:
        from = subDays(now, 30);
    }

    setDateRange({ from, to: now });
  };

  // Metrics calculations
  const totalVisitors = data.visitors?.total ?? 0;
  const checkedInToday = data.visitors?.byStatus?.find(s => s._id === 'checked_in')?.count ?? 0;
  const checkedOutToday = data.visitors?.byStatus?.find(s => s._id === 'checked_out')?.count ?? 0;
  const pending = data.visitors?.byStatus?.find(s => s._id === 'pending')?.count ?? 0;
  const averageDuration = data.checkins?.averageDuration ?? 0;
  const peakHour = data.checkins?.peakHour?._id ?? 0;

  // Chart data preparation with better error handling and sample data
  const visitorTrendData = React.useMemo(() => {
    if (!data.visitors?.byDay || data.visitors.byDay.length === 0) {
      // Generate sample data for demonstration
      const sampleData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        sampleData.push({
          date: format(date, 'MMM dd'),
          visitors: Math.floor(Math.random() * 50) + 10
        });
      }
      return sampleData;
    }
    return data.visitors.byDay.map(day => ({
      date: format(parseISO(day._id), 'MMM dd'),
      visitors: day.count
    }));
  }, [data.visitors?.byDay]);

  const hourlyData = React.useMemo(() => {
    if (!data.checkins?.byHour || data.checkins.byHour.length === 0) {
      // Generate sample hourly data for demonstration
      const sampleData = [];
      for (let hour = 9; hour <= 18; hour++) {
        sampleData.push({
          hour: `${hour}:00`,
          checkins: Math.floor(Math.random() * 20) + 1
        });
      }
      return sampleData;
    }
    return data.checkins.byHour.map(hour => ({
      hour: `${hour._id}:00`,
      checkins: hour.count
    }));
  }, [data.checkins?.byHour]);

  const statusData = React.useMemo(() => {
    if (!data.visitors?.byStatus || data.visitors.byStatus.length === 0) {
      // Generate sample status data for demonstration
      return [
        { name: 'Checked In', value: 15, color: '#10b981' },
        { name: 'Checked Out', value: 28, color: '#3b82f6' },
        { name: 'Pending', value: 5, color: '#f59e0b' }
      ];
    }
    return data.visitors.byStatus.map(status => ({
      name: status._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: status.count,
      color: status._id === 'checked_in' ? '#10b981' : 
             status._id === 'checked_out' ? '#3b82f6' : 
             status._id === 'pending' ? '#f59e0b' : '#6b7280'
    }));
  }, [data.visitors?.byStatus]);

  // Debug logging
  React.useEffect(() => {
    console.log('Analytics Data:', {
      visitors: data.visitors,
      checkins: data.checkins,
      visitorTrendData,
      hourlyData,
      statusData
    });
  }, [data, visitorTrendData, hourlyData, statusData]);

  const MetricCard = ({ title, value, icon: Icon, trend, subtitle }: {
    title: string;
    value: React.ReactNode;
    icon: React.ComponentType<any>;
    trend?: { value: number; isPositive: boolean };
    subtitle?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? "+" : "-"}{trend.value}% from last period
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor visitor activity and insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Visitors"
          value={loading ? <Skeleton className="h-8 w-16" /> : totalVisitors}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Currently Checked In"
          value={loading ? <Skeleton className="h-8 w-16" /> : checkedInToday}
          icon={UserCheck}
          subtitle="Active visitors"
        />
        <MetricCard
          title="Average Visit Duration"
          value={loading ? <Skeleton className="h-8 w-16" /> : `${Math.round(averageDuration / 60)}m`}
          icon={Timer}
          subtitle="Time spent on premises"
        />
        <MetricCard
          title="Peak Hour"
          value={loading ? <Skeleton className="h-8 w-16" /> : `${peakHour}:00`}
          icon={Activity}
          subtitle="Busiest time of day"
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Visitor Trends Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Visitor Trends</CardTitle>
                {(!data.visitors?.byDay || data.visitors.byDay.length === 0) && (
                  <p className="text-xs text-muted-foreground">Showing sample data</p>
                )}
              </CardHeader>
              <CardContent className="pl-2">
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : visitorTrendData.length > 0 ? (
                  (() => {
                    const chartMaxHeight = 220; // px
                    const maxValue = Math.max(...visitorTrendData.map(d => d.visitors));
                    const minValue = Math.min(...visitorTrendData.map(d => d.visitors));
                    const allEqual = maxValue === minValue;
                    return (
                      <div className="h-[300px] flex items-end gap-2">
                        {visitorTrendData.map((item, index) => {
                          let height;
                          if (allEqual) {
                            height = chartMaxHeight * 0.6;
                          } else {
                            height = Math.max((item.visitors / maxValue) * chartMaxHeight, 20);
                          }
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div
                                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                                style={{ height: `${height}px` }}
                                title={`${item.date}: ${item.visitors} visitors`}
                              />
                              <span className="text-xs mt-2 text-muted-foreground">{item.date}</span>
                              <span className="text-xs text-muted-foreground mt-1">{item.visitors}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p>No visitor data available</p>
                      <p className="text-xs mt-1">Try selecting a different time range</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Visitor Status</CardTitle>
                {(!data.visitors?.byStatus || data.visitors.byStatus.length === 0) && (
                  <p className="text-xs text-muted-foreground">Showing sample data</p>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : statusData.length > 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                      {statusData.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.value} visitors
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Hourly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Check-in Distribution</CardTitle>
              {(!data.checkins?.byHour || data.checkins.byHour.length === 0) && (
                <p className="text-xs text-muted-foreground">Showing sample data</p>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
                                              ) : hourlyData.length > 0 ? (
                  (() => {
                    const chartMaxHeight = 220; // px
                    const maxValue = Math.max(...hourlyData.map(d => d.checkins));
                    const minValue = Math.min(...hourlyData.map(d => d.checkins));
                    const allEqual = maxValue === minValue;
                    return (
                      <div className="h-[300px] flex items-end gap-2">
                        {hourlyData.map((item, index) => {
                          let height;
                          if (allEqual) {
                            height = chartMaxHeight * 0.6;
                          } else {
                            height = Math.max((item.checkins / maxValue) * chartMaxHeight, 20);
                          }
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div
                                className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                                style={{ height: `${height}px` }}
                                title={`${item.hour}: ${item.checkins} check-ins`}
                              />
                              <span className="text-xs mt-2 text-muted-foreground">{item.hour}</span>
                              <span className="text-xs text-muted-foreground mt-1">{item.checkins}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p>No check-in data available</p>
                      <p className="text-xs mt-1">Try selecting a different time range</p>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Hosts */}
            <Card>
              <CardHeader>
                <CardTitle>Top Hosts</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Hosts with most visitors
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : data.topHosts?.length ? (
                  <div className="space-y-4">
                    {data.topHosts.map((host, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-medium text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{host.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {host.visitors} visitors
                            </p>
                          </div>
                        </div>
                        {host.avgResponseTime && (
                          <Badge variant="secondary">
                            {Math.round(host.avgResponseTime)}m avg
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No host data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Average Response Time</span>
                  </div>
                  <span className="font-medium">
                    {loading ? <Skeleton className="h-4 w-16" /> : "2.5 min"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Conversion Rate</span>
                  </div>
                  <span className="font-medium">
                    {loading ? <Skeleton className="h-4 w-16" /> : "94.2%"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Return Visitors</span>
                  </div>
                  <span className="font-medium">
                    {loading ? <Skeleton className="h-4 w-16" /> : "23%"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest visitor check-ins and check-outs
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data.recentActivity?.length ? (
                <div className="space-y-4">
                  {data.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          activity.status === 'checked_in' ? "bg-green-100" : "bg-blue-100"
                        )}>
                          {activity.status === 'checked_in' ? (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <UserX className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.visitor}</p>
                          <p className="text-sm text-muted-foreground">
                            Host: {activity.host}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.status === 'checked_in' ? 'default' : 'secondary'}>
                          {activity.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(parseISO(activity.time), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 