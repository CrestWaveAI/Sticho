'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { fetchTailorDashboard, TailorDashboardData } from '../api';
import { useToast } from '@/components/ui/ToastProvider';
import { Eye, Phone, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

export default function DashboardOverview() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [tailorId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tailor_profile_id') || 'e6ae71c7-c5be-43a9-a9a3-a7d0cb74431e';
    }
    return 'e6ae71c7-c5be-43a9-a9a3-a7d0cb74431e';
  });
  
  const [tailorToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tailor_token');
    }
    return null;
  });

  const [businessName, setBusinessName] = useState<string>('Partner');

  const [dashboardData, setDashboardData] = useState<TailorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('tailor_profile');
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          const name = parsed.businessName || 'Partner';
          setTimeout(() => {
            setBusinessName(name);
          }, 0);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Fetch Dashboard Stats
  useEffect(() => {
    if (!tailorId) return;

    // If token is missing, redirect to login
    if (!tailorToken) {
      addToast('Please log in to view the dashboard.', 'error');
      router.push('/login');
      return;
    }

    async function loadDashboard() {
      setIsLoading(true);
      try {
        const data = await fetchTailorDashboard(tailorId!, tailorToken!);
        setDashboardData(data);
        localStorage.setItem('tailor_profile_status', data.approval_status);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
        addToast('Session expired or unauthorized. Please log in again.', 'error');
        // Clear local storage tokens and redirect to login
        localStorage.removeItem('tailor_token');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [tailorId, tailorToken, router, addToast]);

  const mapFieldToLabel = (field: string) => {
    switch (field) {
      case 'bio': return 'Business Bio';
      case 'address': return 'Shop Address';
      case 'contact_number': return 'Contact Phone Number';
      case 'whatsapp_number': return 'WhatsApp Number';
      case 'location_id': return 'Shop Location (Pin/City)';
      case 'experience': return 'Years of Experience';
      default: return field;
    }
  };

  const getMissingFieldLink = (field: string) => {
    if (['bio', 'address', 'location_id', 'experience'].includes(field)) {
      return '/dashboard/profile';
    }
    return '/dashboard/settings';
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Welcome back, {businessName}</h1>
          <p className={styles.subtitle}>Here&apos;s how your tailoring business is doing today.</p>
        </div>
        {dashboardData?.approval_status === 'pending' ? (
          <StatusChip label="Pending Approval" status="warning" />
        ) : (
          <StatusChip label="Profile Approved" status="success" />
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your dashboard...
        </div>
      ) : (
        <>
          <div className={styles.kpiGrid}>
            <Card>
              <div className={styles.kpiHeader}>
                <Eye size={20} className={styles.kpiIcon} strokeWidth={1.5} />
                <span className={styles.kpiTitle}>Total Profile Views</span>
              </div>
              <div className={styles.kpiBody}>
                <span className={`tabular-nums ${styles.kpiValue}`}>1,248</span>
              </div>
            </Card>

            <Card>
              <div className={styles.kpiHeader}>
                <TrendingUp size={20} className={styles.kpiIcon} strokeWidth={1.5} />
                <span className={styles.kpiTitle}>Total Leads</span>
              </div>
              <div className={styles.kpiBody}>
                <span className={`tabular-nums ${styles.kpiValue}`}>{dashboardData?.lead_count || 0}</span>
              </div>
            </Card>

            <Card>
              <div className={styles.kpiHeader}>
                <MessageSquare size={20} className={styles.kpiIcon} strokeWidth={1.5} />
                <span className={styles.kpiTitle}>WhatsApp Clicks</span>
              </div>
              <div className={styles.kpiBody}>
                <span className={`tabular-nums ${styles.kpiValue}`}>{dashboardData?.whatsapp_clicks || 0}</span>
              </div>
            </Card>

            <Card>
              <div className={styles.kpiHeader}>
                <Phone size={20} className={styles.kpiIcon} strokeWidth={1.5} />
                <span className={styles.kpiTitle}>Call Clicks</span>
              </div>
              <div className={styles.kpiBody}>
                <span className={`tabular-nums ${styles.kpiValue}`}>{dashboardData?.call_clicks || 0}</span>
              </div>
            </Card>
          </div>

          <div className={styles.dashboardLayout}>
            <div className={styles.mainCol}>
              <div className={styles.recentSection} style={{ marginTop: 0 }}>
                <h2 className={styles.sectionTitle}>Recent Leads</h2>
                <Card>
                  {(!dashboardData?.recent_leads || dashboardData.recent_leads.length === 0) ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      No leads captured yet. Keep updating your profile to attract customers!
                    </div>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Customer Name</th>
                          <th>Requirement Description</th>
                          <th>Contact Info</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recent_leads.map(lead => (
                          <tr key={lead.id}>
                            <td>{lead.customer_name}</td>
                            <td>{lead.requirement_description}</td>
                            <td className="tabular-nums">{lead.customer_mobile}</td>
                            <td className="tabular-nums">
                              {new Date(lead.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Card>
              </div>
            </div>

            <div className={styles.sideCol}>
              <Card className={styles.completenessCard}>
                <h2 className={styles.sectionTitle} style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Profile Completeness</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                    {dashboardData?.completeness_percentage || 0}%
                  </span>
                </div>
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${dashboardData?.completeness_percentage || 0}%` }}
                  />
                </div>

                {dashboardData?.missing_fields && dashboardData.missing_fields.length > 0 ? (
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>Complete your profile to get more leads:</span>
                    <div className={styles.checklist}>
                      {dashboardData.missing_fields.map(field => (
                        <div key={field} className={styles.checklistItem}>
                          <AlertTriangle size={14} className={styles.checkWarning} />
                          <span>{mapFieldToLabel(field)}</span>
                          <Link href={getMissingFieldLink(field)} className={styles.checklistLink}>
                            Add
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    ✨ Your profile is 100% complete!
                  </p>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
