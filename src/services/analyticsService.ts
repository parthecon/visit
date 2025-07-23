const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface AnalyticsFilters {
  from?: Date;
  to?: Date;
  companyId?: string;
}

export interface VisitorStats {
  total: number;
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
  byDay: Array<{
    _id: string;
    count: number;
  }>;
}

export interface CheckinStats {
  byHour: Array<{
    _id: number;
    count: number;
  }>;
  peakHour: {
    _id: number;
    count: number;
  };
  averageDuration: number;
  checkedOutCount: number;
}

export interface TopHost {
  name: string;
  visitors: number;
  avgResponseTime: number | null;
}

export interface RecentActivity {
  visitor: string;
  host: string;
  time: string;
  status: string;
}

export interface AnalyticsData {
  visitors: VisitorStats | null;
  checkins: CheckinStats | null;
  topHosts: TopHost[] | null;
  recentActivity: RecentActivity[] | null;
}

class AnalyticsService {
  private async makeRequest<T>(endpoint: string, filters?: AnalyticsFilters): Promise<T> {
    const params = new URLSearchParams();
    
    if (filters?.from) {
      params.append('from', filters.from.toISOString());
    }
    if (filters?.to) {
      params.append('to', filters.to.toISOString());
    }
    if (filters?.companyId) {
      params.append('companyId', filters.companyId);
    }

    const url = `${API_BASE_URL}${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getVisitorStats(filters?: AnalyticsFilters): Promise<VisitorStats> {
    return this.makeRequest<VisitorStats>('/analytics/visitors', filters);
  }

  async getCheckinStats(filters?: AnalyticsFilters): Promise<CheckinStats> {
    return this.makeRequest<CheckinStats>('/analytics/checkins', filters);
  }

  async getTopHosts(filters?: AnalyticsFilters, limit: number = 5): Promise<TopHost[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const url = `${API_BASE_URL}/analytics/top-hosts?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getRecentActivity(filters?: AnalyticsFilters, limit: number = 10): Promise<RecentActivity[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const url = `${API_BASE_URL}/analytics/recent-activity?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getAllAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsData> {
    try {
      const [visitors, checkins, topHosts, recentActivity] = await Promise.all([
        this.getVisitorStats(filters),
        this.getCheckinStats(filters),
        this.getTopHosts(filters),
        this.getRecentActivity(filters),
      ]);

      return {
        visitors,
        checkins,
        topHosts,
        recentActivity,
      };
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      throw error;
    }
  }

  // Helper methods for data formatting
  formatVisitorTrendData(byDay: Array<{ _id: string; count: number }>) {
    return byDay.map(day => ({
      date: new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors: day.count,
    }));
  }

  formatHourlyData(byHour: Array<{ _id: number; count: number }>) {
    return byHour.map(hour => ({
      hour: `${hour._id}:00`,
      checkins: hour.count,
    }));
  }

  formatStatusData(byStatus: Array<{ _id: string; count: number }>) {
    return byStatus.map(status => ({
      name: status._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: status.count,
      color: this.getStatusColor(status._id),
    }));
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'checked_in':
        return '#10b981';
      case 'checked_out':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  }

  // Calculate trends and insights
  calculateTrends(currentData: number, previousData: number): { value: number; isPositive: boolean } {
    if (previousData === 0) return { value: 0, isPositive: true };
    
    const change = ((currentData - previousData) / previousData) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0,
    };
  }

  getPeakHour(byHour: Array<{ _id: number; count: number }>): number {
    if (!byHour.length) return 0;
    return byHour.reduce((max, curr) => curr.count > max.count ? curr : max)._id;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  }
}

export const analyticsService = new AnalyticsService(); 