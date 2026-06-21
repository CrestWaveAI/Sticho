import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import styles from './notifications.module.css';

const MOCK_NOTIFICATIONS = [
  { id: 'N1', type: 'lead', text: 'New Lead Received: Priya Das is looking for Bridal Blouse stitching.', time: '2 mins ago', read: false, action: 'View Lead' },
  { id: 'N2', type: 'quote', text: 'Quote Accepted: Amit Sharma accepted your quote for Order #ORD-1024.', time: '1 hour ago', read: false, action: 'View Order' },
  { id: 'N3', type: 'order', text: 'Order Reminder: Order #ORD-1021 is due for delivery tomorrow.', time: '5 hours ago', read: true, action: 'Update Stage' },
  { id: 'N4', type: 'payout', text: 'Payout Processed: ₹3,200 has been transferred to your bank account.', time: 'Yesterday', read: true, action: 'View History' },
  { id: 'N5', type: 'dispute', text: 'New Dispute Opened: Case #DISP-401 regarding Order #ORD-1012.', time: '2 days ago', read: false, action: 'Resolve Now' },
  { id: 'N6', type: 'review', text: 'New Review: Sanya Malhotra gave you 5 stars!', time: '3 days ago', read: true, action: 'View Review' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Notifications</h1>
          <p className={styles.subtitle}>Stay updated with your leads, orders, and platform alerts.</p>
        </div>
        <Button variant="secondary" onClick={markAllRead}>Mark all as read</Button>
      </header>

      <div className={styles.list}>
        {notifications.map(n => (
          <Card key={n.id} className={`${styles.notificationCard} ${!n.read ? styles.unread : ''}`}>
            <div className={styles.content}>
              <div className={styles.indicator} />
              <div className={styles.textArea}>
                <div className={styles.meta}>
                  <span className={styles.typeTag}>{n.type.toUpperCase()}</span>
                  <span className={styles.time}>{n.time}</span>
                </div>
                <p className={styles.message}>{n.text}</p>
              </div>
              <Button variant="secondary" className={styles.actionBtn}>{n.action}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
