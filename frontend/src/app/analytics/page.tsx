'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import styles from './analytics.module.css';

const FUNNEL_DATA = [
  { stage: 'Leads', count: 120, color: 'var(--color-info)' },
  { stage: 'Quotes Sent', count: 85, color: 'var(--color-warning)' },
  { stage: 'Orders Accepted', count: 42, color: 'var(--color-primary)' },
  { stage: 'Completed', count: 38, color: 'var(--color-success)' },
];

const PERFORMANCE_METRICS = [
  { label: 'Profile Views', value: '1,240', trend: '+15%', trendType: 'success' },
  { label: 'WhatsApp Clicks', value: '312', trend: '+8%', trendType: 'success' },
  { label: 'Call Clicks', value: '84', trend: '-2%', trendType: 'danger' },
  { label: 'Avg. Order Value', value: 'â‚¹1,850', trend: '+4%', trendType: 'success' },
];

export default function AnalyticsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Business Analytics</h1>
          <p className={styles.subtitle}>Understand your growth and optimize your conversion funnel.</p>
        </div>
        <div className={styles.dateFilter}>
          <select className={styles.select}>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </header>

      <div className={styles.mainGrid}>
        {/* Performance Metrics */}
        <section className={styles.metricsSection}>
          <h2 className={styles.sectionTitle}>Performance Metrics</h2>
          <div className={styles.metricsGrid}>
            {PERFORMANCE_METRICS.map((m, i) => (
              <Card key={i} className={styles.metricCard}>
                <span className={styles.metricLabel}>{m.label}</span>
                <div className={styles.metricValue}><span className="tabular-nums">{m.value}</span></div>
                <span className={`${styles.metricTrend} ${styles[m.trendType]}`}>{m.trend}</span>
              </Card>
            ))}
          </div>
        </section>

        {/* Conversion Funnel */}
        <section className={styles.funnelSection}>
          <h2 className={styles.sectionTitle}>Conversion Funnel</h2>
          <Card className={styles.funnelCard}>
            <div className={styles.funnelContainer}>
              {FUNNEL_DATA.map((step) => {
                const width = (step.count / FUNNEL_DATA[0].count) * 100;
                return (
                  <div key={step.stage} className={styles.funnelRow}>
                    <div className={styles.funnelLabel}>
                      <span>{step.stage}</span>
                      <span className="tabular-nums">{step.count}</span>
                    </div>
                    <div className={styles.funnelBarWrapper}>
                      <div 
                        className={styles.funnelBar} 
                        style={{ width: `${width}%`, backgroundColor: step.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className={styles.funnelHint}>Your Lead $\rightarrow$ Order conversion rate is 35%.</p>
          </Card>
        </section>
      </div>

      {/* Growth & Visibility Module */}
      <section className={styles.growthSection}>
        <h2 className={styles.sectionTitle}>Growth & Visibility</h2>
        <div className={styles.growthGrid}>
          <Card className={styles.visibilityCard}>
            <div className={styles.visHeader}>
              <h3>Visibility Score</h3>
              <StatusChip label="Medium" status="warning" />
            </div>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreValue}>64%</span>
            </div>
            <p className={styles.scoreDesc}>Your profile is visible to about 64% of customers searching in your locality.</p>
            
            <div className={styles.improvementList}>
              <h4 className={styles.listTitle}>How to increase your score:</h4>
              <div className={styles.improvementItem}>
                <span className={styles.check}>âœ“</span>
                <span>Add 5+ portfolio photos (Current: 3)</span>
              </div>
              <div className={styles.improvementItem}>
                <span className={styles.check}>âœ“</span>
                <span>Reduce response time to under 2 hours</span>
              </div>
              <div className={styles.improvementItem}>
                <span className={styles.check}>âœ“</span>
                <span>Get 2 more 5-star reviews</span>
              </div>
            </div>
          </Card>

          <Card className={styles.boostCard}>
            <div className={styles.boostContent}>
              <div className={styles.boostIcon}>ðŸš€</div>
              <h3>Boost Your Visibility</h3>
              <p>Get featured at the top of search results in your locality and get 3x more leads.</p>
              <div className={styles.lockedBadge}>Coming Soon</div>
              <Button fullWidth className={styles.boostBtn} disabled>
                Unlock Featured Placement
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
