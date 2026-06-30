'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import styles from './page.module.css';

const viewData = [
  { name: 'Mon', views: 120 },
  { name: 'Tue', views: 132 },
  { name: 'Wed', views: 101 },
  { name: 'Thu', views: 145 },
  { name: 'Fri', views: 190 },
  { name: 'Sat', views: 230 },
  { name: 'Sun', views: 210 },
];

const leadData = [
  { name: 'Week 1', leads: 12, converted: 4 },
  { name: 'Week 2', leads: 15, converted: 6 },
  { name: 'Week 3', leads: 8, converted: 2 },
  { name: 'Week 4', leads: 22, converted: 10 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <div className={styles.header}>
        <h1>Analytics Overview</h1>
      </div>

      <div className={styles.chartGrid}>
        <Card className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Profile Views (7 Days)</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-2)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2} 
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Leads & Conversions (This Month)</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-2)'
                  }} 
                />
                <Bar dataKey="leads" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className={styles.summaryGrid}>
        <Card>
          <div className={styles.summaryTitle}>Total Leads Generated</div>
          <div className={`tabular-nums ${styles.summaryValue}`}>57</div>
        </Card>
        <Card>
          <div className={styles.summaryTitle}>Leads Converted</div>
          <div className={`tabular-nums ${styles.summaryValue}`}>22</div>
        </Card>
        <Card>
          <div className={styles.summaryTitle}>Conversion Percentage</div>
          <div className={`tabular-nums ${styles.summaryValue}`}>38.5%</div>
        </Card>
      </div>
    </div>
  );
}
