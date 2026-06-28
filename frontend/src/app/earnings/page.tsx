'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import styles from './earnings.module.css';

const MOCK_PAYOUTS = [
  { id: 'PAY-9901', date: '2026-06-01', amount: 4500, status: 'Paid', ref: 'TXN_88271625' },
  { id: 'PAY-9905', date: '2026-06-15', amount: 3200, status: 'Processing', ref: 'TXN_88271900' },
  { id: 'PAY-9890', date: '2026-05-20', amount: 5100, status: 'Paid', ref: 'TXN_88270112' },
  { id: 'PAY-9880', date: '2026-05-01', amount: 2800, status: 'Failed', ref: 'TXN_88269001' },
];

export default function EarningsPage() {
  const [activeTab, setActiveTab] = useState<'summary' | 'history' | 'settings'>('summary');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Earnings & Payouts</h1>
          <p className={styles.subtitle}>Transparent tracking of your hard-earned money.</p>
        </div>
        <Button variant="secondary">Download Statement (PDF)</Button>
      </header>

      <nav className={styles.tabs}>
        <button 
          className={activeTab === 'summary' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          className={activeTab === 'history' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('history')}
        >
          Payout History
        </button>
        <button 
          className={activeTab === 'settings' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('settings')}
        >
          Payout Settings
        </button>
      </nav>

      <main className={styles.content}>
        {activeTab === 'summary' && (
          <div className={styles.summaryGrid}>
            <Card className={styles.balanceCard}>
              <span className={styles.label}>Available Balance</span>
              <div className={styles.balanceValue}>
                <span className="tabular-nums">â‚¹12,400</span>
              </div>
              <Button fullWidth className={styles.withdrawBtn}>Request Payout</Button>
            </Card>

            <Card className={styles.pendingCard}>
              <span className={styles.label}>Pending Payouts</span>
              <div className={styles.balanceValue}>
                <span className="tabular-nums">â‚¹3,200</span>
              </div>
              <p className={styles.hint}>Expected by June 22, 2026</p>
            </Card>

            <Card className={styles.statsCard}>
              <h3 className={styles.cardTitle}>Earnings Breakdown</h3>
              <div className={styles.breakdownRow}>
                <span>Gross Earnings</span>
                <span className="tabular-nums">â‚¹15,600</span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Platform Commission (5%)</span>
                <span className={`${styles.dangerText} tabular-nums`}>- â‚¹780</span>
              </div>
              <div className={styles.totalRow}>
                <span>Net Payable</span>
                <span className={`${styles.accentText} tabular-nums`}>â‚¹14,820</span>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'history' && (
          <Card className={styles.tableCard}>
            <table className={styles.payoutTable}>
              <thead>
                <tr>
                  <th>Payout ID</th>
                  <th>Date</th>
                  <th className={styles.textRight}>Amount</th>
                  <th>Status</th>
                  <th className={styles.textRight}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PAYOUTS.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.date}</td>
                    <td className={`${styles.textRight} tabular-nums`}>â‚¹{p.amount}</td>
                    <td>
                      <StatusChip 
                        label={p.status} 
                        status={p.status === 'Paid' ? 'success' : p.status === 'Processing' ? 'warning' : 'danger'} 
                      />
                    </td>
                    <td className={`${styles.textRight} tabular-nums`}>{p.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className={styles.settingsCard}>
            <h2 className={styles.sectionTitle}>Bank Account Details</h2>
            <p className={styles.sectionSubtitle}>Your payouts will be transferred to this account.</p>
            
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Account Holder Name</label>
                <input type="text" defaultValue="John Doe" />
              </div>
              <div className={styles.inputGroup}>
                <label>Account Number</label>
                <input type="text" defaultValue="987654321012" />
              </div>
              <div className={styles.inputGroup}>
                <label>IFSC Code</label>
                <input type="text" defaultValue="HDFC0001234" />
              </div>
              <div className={styles.inputGroup}>
                <label>Bank Name</label>
                <input type="text" defaultValue="HDFC Bank" />
              </div>
            </div>
            <Button className={styles.saveBtn}>Update Bank Details</Button>
          </Card>
        )}
      </main>
    </div>
  );
}
