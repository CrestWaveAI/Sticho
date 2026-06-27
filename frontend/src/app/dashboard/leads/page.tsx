'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, Phone, Download } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { Modal } from '@/components/ui/Modal';
import styles from './page.module.css';

const initialLeads = [
  { id: 1, customer: 'Priya Sharma', phone: '+91 98765 43210', req: 'Bridal Lehenga Stitching', date: 'Oct 24, 2024', status: 'New', statusType: 'info' as const },
  { id: 2, customer: 'Rahul Verma', phone: '+91 91234 56789', req: 'Men\'s Suit Alteration', date: 'Oct 23, 2024', status: 'In Progress', statusType: 'warning' as const },
  { id: 3, customer: 'Anjali Desai', phone: '+91 99887 76655', req: 'Custom Blouse', date: 'Oct 21, 2024', status: 'Converted', statusType: 'success' as const },
  { id: 4, customer: 'Vikram Singh', phone: '+91 98765 12345', req: 'Sherwani Alteration', date: 'Oct 19, 2024', status: 'Closed', statusType: 'neutral' as const },
  { id: 5, customer: 'Neha Gupta', phone: '+91 98989 89898', req: 'Boutique Design Consultation', date: 'Oct 18, 2024', status: 'Contacted', statusType: 'accent' as const },
];

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<typeof initialLeads[0] | null>(null);
  const { addToast } = useToast();

  const filteredLeads = useMemo(() => {
    return initialLeads.filter(lead => 
      lead.customer.toLowerCase().includes(search.toLowerCase()) ||
      lead.req.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleExport = async () => {
    addToast('Preparing export...', 'info');
    await new Promise(res => setTimeout(res, 1000));
    addToast('Leads exported successfully as CSV.', 'success');
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Lead Management</h1>
        <Button variant="primary" onClick={handleExport}>
          <Download size={16} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'text-bottom' }} /> 
          Export Leads
        </Button>
      </div>

      <Card>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <Input 
              placeholder="Search customers or reqs..." 
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
                  <td>{lead.customer}</td>
                  <td>
                    <a href={`tel:${lead.phone.replace(/\s+/g, '')}`} className={styles.phoneLink}>
                      <Phone size={14} /> {lead.phone}
                    </a>
                  </td>
                  <td>{lead.req}</td>
                  <td className="tabular-nums">{lead.date}</td>
                  <td><StatusChip label={lead.status} status={lead.statusType} /></td>
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
            <div><strong>Customer:</strong> {selectedLead.customer}</div>
            <div><strong>Phone:</strong> {selectedLead.phone}</div>
            <div><strong>Requirement:</strong> {selectedLead.req}</div>
            <div><strong>Date:</strong> {selectedLead.date}</div>
            <div><strong>Status:</strong> <StatusChip label={selectedLead.status} status={selectedLead.statusType} /></div>
            
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
