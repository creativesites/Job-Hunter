"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import {
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Target,
  ArrowRight,
  X
} from "lucide-react";

interface SmartNotification {
  id: string;
  type: 'insight' | 'alert' | 'achievement' | 'reminder' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsWidget() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        // Show only top 3 unread notifications for the widget
        setNotifications(data.notifications.filter((n: SmartNotification) => !n.read).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'achievement':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'reminder':
        return <Calendar className="w-4 h-4 text-yellow-600" />;
      case 'opportunity':
        return <Target className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationBg = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-blue-600" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">Smart Notifications</h3>
          </div>
          
          <Link href="/notifications">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">All Caught Up!</h4>
            <p className="text-sm text-gray-600">
              No new notifications. Keep up the great work on your job search!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-3 transition-all hover:shadow-sm ${
                  getNotificationBg(notification.priority)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                        </span>
                        
                        {notification.action_text && notification.action_url && (
                          <Link href={notification.action_url}>
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6">
                              {notification.action_text}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                    className="text-gray-400 hover:text-red-600 ml-2 h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {notifications.length === 3 && (
              <div className="text-center pt-2">
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View More Notifications
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}