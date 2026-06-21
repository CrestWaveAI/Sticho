import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import styles from './page.module.css';
import { ArrowUpRight, ArrowDownRight, Eye, Phone, MessageSquare, TrendingUp } from 'lucide-react';

export default function DashboardOverview() {
  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Welcome back, Studio M</h1>
          <p className={styles.subtitle}>Here's how your tailoring business is doing today.</p>
        </div>
        <StatusChip label="Profile Approved" status="success" />
      </div>

      <div className={styles.kpiGrid}>
        <Card>
          <div className={styles.kpiHeader}>
            <Eye size={20} className={styles.kpiIcon} strokeWidth={1.5} />
            <span className={styles.kpiTitle}>Total Profile Views</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={`tabular-nums ${styles.kpiValue}`}>1,248</span>
            <span className={`${styles.kpiTrend} ${styles.trendUp}`}>
              <ArrowUpRight size={16} /> 12%
            </span>
          </div>
        </Card>

        <Card>
          <div className={styles.kpiHeader}>
            <TrendingUp size={20} className={styles.kpiIcon} strokeWidth={1.5} />
            <span className={styles.kpiTitle}>Total Leads</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={`tabular-nums ${styles.kpiValue}`}>42</span>
            <span className={`${styles.kpiTrend} ${styles.trendUp}`}>
              <ArrowUpRight size={16} /> 8%
            </span>
          </div>
        </Card>

        <Card>
          <div className={styles.kpiHeader}>
            <MessageSquare size={20} className={styles.kpiIcon} strokeWidth={1.5} />
            <span className={styles.kpiTitle}>WhatsApp Clicks</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={`tabular-nums ${styles.kpiValue}`}>86</span>
            <span className={`${styles.kpiTrend} ${styles.trendDown}`}>
              <ArrowDownRight size={16} /> 2%
            </span>
          </div>
        </Card>

        <Card>
          <div className={styles.kpiHeader}>
            <Phone size={20} className={styles.kpiIcon} strokeWidth={1.5} />
            <span className={styles.kpiTitle}>Call Clicks</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={`tabular-nums ${styles.kpiValue}`}>34</span>
            <span className={`${styles.kpiTrend} ${styles.trendUp}`}>
              <ArrowUpRight size={16} /> 5%
            </span>
          </div>
        </Card>
      </div>

      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Recent Leads</h2>
        <Card>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Requirement</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Priya Sharma</td>
                <td>Bridal Lehenga Stitching</td>
                <td className="tabular-nums">Oct 24, 2024</td>
                <td><StatusChip label="New" status="info" /></td>
              </tr>
              <tr>
                <td>Rahul Verma</td>
                <td>Men's Suit Alteration</td>
                <td className="tabular-nums">Oct 23, 2024</td>
                <td><StatusChip label="In Progress" status="warning" /></td>
              </tr>
              <tr>
                <td>Anjali Desai</td>
                <td>Custom Blouse</td>
                <td className="tabular-nums">Oct 21, 2024</td>
                <td><StatusChip label="Converted" status="success" /></td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
