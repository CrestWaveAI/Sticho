'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import styles from './leads.module.css';

const MOCK_LEADS = [
  { id: 'L1', customer: 'Priya Das', requirement: 'Blouse Stitching - Bridal', date: '2026-06-20', status: 'New', phone: '+91 98765 43210' },
  { id: 'L2', customer: 'Vikram Singh', requirement: "Men's Suit Alteration", date: '2026-06-19', status: 'Contacted', phone: '+91 98765 11223' },
  { id: 'L3', customer: 'Ananya Iyer', requirement: 'Custom Kurti Design', date: '2026-06-18', status: 'Quoted', phone: '+91 98765 55667' },
  { id: 'L4', customer: 'Rahul Mehta', requirement: 'Shirt Stitching (3 pcs)', date: '2026-06-17', status: 'Converted', phone: '+91 98765 99887' },
];

export default function LeadsPage() {
  const [filter, setFilter] = useState('All');

  const filteredLeads = filter === 'All' 
    ? MOCK_LEADS 
    : MOCK_LEADS.filter(l => l.status === filter);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Leads & Inquiries</h1>
          <p className={styles.subtitle}>Convert marketplace inquiries into paying orders.</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.filterGroup}>
            {['All', 'New', 'Contacted', 'Quoted', 'Converted'].map(f => (
              <button 
                key={f} 
                className={filter === f ? styles.activeFilter : styles.filter} 
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.leadsGrid}>
        {filteredLeads.length > 0 ? (
          filteredLeads.map(lead => (
            <Card key={lead.id} className={styles.leadCard} interactive>
              <div className={styles.cardHeader}>
                <div className={styles.leadMeta}>
                  <span className={styles.leadId}>{lead.id}</span>
                  <StatusChip label={lead.status} status={lead.status === 'New' ? 'info' : lead.status === 'Converted' ? 'success' : 'warning'} />
                </div>
                <span className={styles.date}>{lead.date}</span>
              </div>
              
              <div className={styles.mainInfo}>
                <h3 className={styles.customerName}>{lead.customer}</h3>
                <p className={styles.requirement}>{lead.requirement}</p>
                <div className={styles.contactInfo}>
                  <span>ðŸ“ž {lead.phone}</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Button variant="secondary" className={styles.msgBtn}>Message</Button>
                <Button className={styles.quoteBtn}>Create Quote</Button>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState 
            title="No Leads Yet" 
            description="Your marketplace profile is live, but no one has inquired yet. Try adding more portfolio photos to attract customers!" 
            actionLabel="Update Portfolio" 
            onAction={() => {}} 
            icon="ðŸ“©"
          />
        )}
      </div>
    </div>
  );
}
