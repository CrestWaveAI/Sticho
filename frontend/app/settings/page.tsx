import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'business' | 'notifications'>('account');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Settings</h1>
          <p className={styles.subtitle}>Manage your account preferences and business operations.</p>
        </div>
      </header>

      <div className={styles.layout}>
        <nav className={styles.sidebar}>
          <button 
            className={activeTab === 'account' ? styles.activeTab : styles.tab} 
            onClick={() => setActiveTab('account')}
          >
            Account Security
          </button>
          <button 
            className={activeTab === 'business' ? styles.activeTab : styles.tab} 
            onClick={() => setActiveTab('business')}
          >
            Business Operations
          </button>
          <button 
            className={activeTab === 'notifications' ? styles.activeTab : styles.tab} 
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </nav>

        <main className={styles.content}>
          {activeTab === 'account' && (
            <Card className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Account Security</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Email Address</label>
                  <input type="email" defaultValue="tailor@example.com" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Phone Number</label>
                  <input type="tel" defaultValue="+91 98765 43210" />
                </div>
                <div className={styles.inputGroup fullWidth}>
                  <label>New Password</label>
                  <input type="password" placeholder="Leave blank to keep current" />
                </div>
              </div>
              <Button className={styles.saveBtn}>Update Account</Button>
            </Card>
          )}

          {activeTab === 'business' && (
            <Card className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Business Operations</h2>
              <div className={styles.operationRow}>
                <div className={styles.opInfo}>
                  <span className={styles.opLabel}>Availability Status</span>
                  <span className={styles.opDesc}>Control if you appear as "Bookable" in the marketplace.</span>
                </div>
                <div className={styles.toggle}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Business Hours</label>
                <div className={styles.hoursGrid}>
                  <div className={styles.hourRow}>
                    <span>Mon-Fri</span>
                    <input type="text" defaultValue="09:00 AM - 08:00 PM" />
                  </div>
                  <div className={styles.hourRow}>
                    <span>Sat-Sun</span>
                    <input type="text" defaultValue="10:00 AM - 04:00 PM" />
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Order Capacity (Max Active Orders)</label>
                <input type="number" defaultValue="15" />
                <p className={styles.hint}>When you reach this limit, your status automatically switches to "Temporarily Unavailable".</p>
              </div>
              
              <Button className={styles.saveBtn}>Save Business Settings</Button>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Notification Preferences</h2>
              <p className={styles.subtitle}>Control how and when we interrupt your workday.</p>
              
              <div className={styles.prefList}>
                {[
                  { id: 'new_lead', label: 'New Lead Received', desc: 'Get notified immediately when a customer inquires.' },
                  { id: 'quote_update', label: 'Quote Status Change', desc: 'Know when a customer accepts or declines a quote.' },
                  { id: 'order_reminder', label: 'Order Due Reminders', desc: 'Alerts for orders due within 24 hours.' },
                  { id: 'payout_alert', label: 'Payout Processed', desc: 'Notification when funds are transferred to your bank.' },
                  { id: 'dispute_alert', label: 'New Dispute Opened', desc: 'Immediate alert for customer complaints.' },
                ].map(pref => (
                  <div key={pref.id} className={styles.prefItem}>
                    <div className={styles.prefInfo}>
                      <span className={styles.prefLabel}>{pref.label}</span>
                      <span className={styles.prefDesc}>{pref.desc}</span>
                    </div>
                    <div className={styles.toggle}>
                      <input type="checkbox" defaultChecked />
                      <span className={styles.slider}></span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
