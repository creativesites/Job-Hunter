"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import {
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Calendar,
  Target,
  Zap,
  X,
  Eye,
  MoreHorizontal,
  Filter,
  Settings
} from "lucide-react";

interface SmartNotification {
  id: string;
  type: 'insight' | 'alert' | 'achievement' | 'reminder' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  data?: any;
  read: boolean;
  created_at: string;
  expires_at?: string;
}

interface NotificationStats {
  total_unread: number;
  high_priority: number;
  insights_count: number;
  alerts_count: number;
}

export default function SmartNotifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'insights' | 'alerts'>('all');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        
        if (stats) {
          setStats({
            ...stats,
            total_unread: Math.max(0, stats.total_unread - 1)
          });
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'high' ? 'w-5 h-5' : 'w-4 h-4';
    
    switch (type) {
      case 'insight':
        return <TrendingUp className={`${iconClass} text-blue-600`} />;
      case 'alert':
        return <AlertTriangle className={`${iconClass} text-red-600`} />;
      case 'achievement':
        return <CheckCircle2 className={`${iconClass} text-green-600`} />;
      case 'reminder':
        return <Calendar className={`${iconClass} text-yellow-600`} />;
      case 'opportunity':
        return <Target className={`${iconClass} text-purple-600`} />;
      default:
        return <Bell className={`${iconClass} text-gray-600`} />;
    }
  };

  const getNotificationBg = (type: string, priority: string, read: boolean) => {
    if (read) return 'bg-gray-50 border-gray-200';
    
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'insights':
        return notification.type === 'insight';
      case 'alerts':
        return notification.type === 'alert';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-blue-600" />
              {stats && stats.total_unread > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {stats.total_unread > 9 ? '9+' : stats.total_unread}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Smart Notifications</h2>
              <p className="text-gray-600">AI-powered insights and alerts for your job search</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {stats.total_unread}
              </div>
              <div className="text-xs text-blue-700">Unread</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {stats.high_priority}
              </div>
              <div className="text-xs text-red-700">High Priority</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {stats.insights_count}
              </div>
              <div className="text-xs text-green-700">AI Insights</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {stats.alerts_count}
              </div>
              <div className="text-xs text-yellow-700">Active Alerts</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="flex space-x-6">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: stats?.total_unread || 0 },
              { key: 'insights', label: 'Insights', count: stats?.insights_count || 0 },
              { key: 'alerts', label: 'Alerts', count: stats?.alerts_count || 0 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    filter === tab.key 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No Notifications' : `No ${filter} notifications`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'You\'re all caught up! New notifications will appear here.'
                : `No ${filter} notifications at the moment.`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${
                getNotificationBg(notification.type, notification.priority, notification.read)
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium text-gray-900 ${
                        !notification.read ? 'font-semibold' : ''
                      }`}>
                        {notification.title}
                      </h4>
                      
                      {notification.priority === 'high' && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          High Priority
                        </span>
                      )}
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                      
                      {notification.action_text && notification.action_url && (
                        <Button size="sm" variant="outline">
                          {notification.action_text}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 ml-4">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mark All as Read */}
      {stats && stats.total_unread > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              // Mark all as read logic
              setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
              setStats(prev => prev ? { ...prev, total_unread: 0 } : null);
            }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        </div>
      )}
    </div>
  );
}