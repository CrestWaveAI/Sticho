'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, Phone, Download } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { Modal } from '@/components/ui/Modal';
import { fetchLeads, DashboardLead } from '../../api';
import styles from './page.module.css';

export default function LeadsPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [tailorId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tailor_profile_id') || '';
    }
    return '';
  });

  const [tailorToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tailor_token');
    }
    return null;
  });

  const [leadsList, setLeadsList] = useState<DashboardLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<DashboardLead | null>(null);

  // Fetch leads from backend
  useEffect(() => {
    if (!tailorToken || !tailorId) {
      addToast('Please log in to manage your leads.', 'error');
      router.push('/login');
      return;
    }

    async function loadLeads() {
      setIsLoading(true);
      try {
        const data = await fetchLeads(tailorId, tailorToken!);
        setLeadsList(data);
      } catch (err) {
        console.error('Failed to load leads:', err);
        addToast(err instanceof Error ? err.message : 'Failed to retrieve leads list.', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadLeads();
  }, [tailorId, tailorToken, router, addToast]);

  const filteredLeads = useMemo(() => {
    return leadsList.filter(lead => 
      lead.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      lead.requirement_description.toLowerCase().includes(search.toLowerCase())
    );
  }, [leadsList, search]);

  const handleExport = async () => {
    if (leadsList.length === 0) {
      addToast('No leads available to export.', 'error');
      return;
    }
    addToast('Preparing export...', 'info');
    
    // Simulate generation of CSV file download
    const headers = ['Customer Name', 'Phone', 'Stitching Requirement', 'Created At'];
    const rows = leadsList.map(lead => [
      lead.customer_name,
      lead.customer_mobile,
      lead.requirement_description,
      new Date(lead.created_at).toLocaleDateString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Stichoh_Leads_Tailor_${tailorId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('Leads exported successfully as CSV.', 'success');
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Lead Management</h1>
        <Button variant="primary" onClick={handleExport} disabled={isLoading}>
          <Download size={16} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'text-bottom' }} /> 
          Export Leads
        </Button>
      </div>

      <Card>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <Input 
              placeholder="Search customers or requirements..." 
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="secondary" className={styles.filterBtn} onClick={() => setIsFilterOpen(true)}>
            <Filter size={18} />
            Filter
          </Button>
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
            Loading your leads...
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Requirement</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>{lead.customer_name}</td>
                    <td>
                      <a href={`tel:${lead.customer_mobile.replace(/\s+/g, '')}`} className={styles.phoneLink}>
                        <Phone size={14} style={{ marginRight: '0.25rem' }} /> {lead.customer_mobile}
                      </a>
                    </td>
                    <td>{lead.requirement_description}</td>
                    <td className="tabular-nums">
                      {new Date(lead.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td><StatusChip label="New" status="info" /></td>
                    <td><Button variant="secondary" onClick={() => setSelectedLead(lead)}>View</Button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-ink-muted)' }}>
                    No leads match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Leads">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Status</label>
            <select style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}>
              <option>All Statuses</option>
              <option>New</option>
              <option>In Progress</option>
              <option>Converted</option>
            </select>
          </div>
          <Button fullWidth onClick={() => { setIsFilterOpen(false); addToast('Filters applied', 'success'); }}>Apply Filters</Button>
        </div>
      </Modal>

      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title="Lead Details">
        {selectedLead && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><strong>Customer:</strong> {selectedLead.customer_name}</div>
            <div><strong>Phone:</strong> {selectedLead.customer_mobile}</div>
            <div><strong>Requirement:</strong> {selectedLead.requirement_description}</div>
            <div><strong>Date:</strong> {new Date(selectedLead.created_at).toLocaleString()}</div>
            <div><strong>Status:</strong> <StatusChip label="New" status="info" /></div>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <Button fullWidth variant="primary" onClick={() => { addToast('Status updated to In Progress', 'success'); setSelectedLead(null); }}>Mark In Progress</Button>
              <Button fullWidth variant="secondary" onClick={() => { addToast('Message template opened', 'info'); }}>Message</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
