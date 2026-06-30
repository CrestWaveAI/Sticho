'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, MessageSquare, Calendar, UserPlus, Check } from 'lucide-react';
import styles from './page.module.css';

const initialNotifications = [
  {
    id: 1,
    type: 'message',
    title: 'New message from Priya Sharma',
    message: 'Can we schedule a fitting for the bridal lehenga this weekend?',
    time: '2 hours ago',
    unread: true,
    icon: MessageSquare,
  },
  {
    id: 2,
    type: 'booking',
    title: 'New appointment booked',
    message: 'Rahul Verma booked a consultation for Men\'s Suit Alteration on Oct 26.',
    time: '5 hours ago',
    unread: true,
    icon: Calendar,
  },
  {
    id: 3,
    type: 'lead',
    title: 'New lead assigned',
    message: 'You have a new lead: Anjali Desai for Custom Blouse.',
    time: '1 day ago',
    unread: false,
    icon: UserPlus,
  },
  {
    id: 4,
    type: 'system',
    title: 'Profile completion reminder',
    message: 'Your profile is 80% complete. Add your portfolio items to attract more customers.',
    time: '2 days ago',
    unread: false,
    icon: Bell,
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const hasUnread = notifications.some(n => n.unread);

  return (
    <div>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Notifications</h1>
        {hasUnread && (
          <Button variant="secondary" onClick={markAllAsRead}>
            <Check size={16} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'text-bottom' }} /> Mark all as read
          </Button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <Card 
              key={notif.id} 
              className={styles.notificationCard} 
              interactive
              onClick={() => markAsRead(notif.id)}
            >
              <div className={`${styles.iconWrapper} ${notif.unread ? styles.unread : ''}`}>
                <Icon size={20} />
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>{notif.title}</h3>
                <p className={styles.message}>{notif.message}</p>
                <span className={styles.time}>{notif.time}</span>
              </div>
              {notif.unread && <div className={styles.unreadDot} />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
