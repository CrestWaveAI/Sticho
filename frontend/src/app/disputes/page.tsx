'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import styles from './disputes.module.css';

const MOCK_DISPUTES = [
  { id: 'DISP-401', orderId: 'ORD-1012', reason: 'Wrong Fit', description: 'Customer claims the sleeve length is 2 inches too long.', status: 'Open', date: '2026-06-18', priority: 'High' },
  { id: 'DISP-388', orderId: 'ORD-1005', reason: 'Late Delivery', description: 'Order delivered 4 days after the promised date.', status: 'Resolved', date: '2026-06-01', priority: 'Medium' },
  { id: 'DISP-350', orderId: 'ORD-0992', reason: 'Damaged Fabric', description: 'Small tear found in the lining of the jacket.', status: 'Under Review', date: '2026-05-15', priority: 'High' },
];

export default function DisputesPage() {
  const [selectedDispute, setSelectedDispute] = useState<typeof MOCK_DISPUTES[0] | null>(null);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Dispute Center</h1>
          <p className={styles.subtitle}>Resolve customer issues professionally to maintain your standing.</p>
        </div>
        <div className={styles.standingCard}>
          <span className={styles.standingLabel}>Account Standing:</span>
          <StatusChip label="Good Standing" status="success" />
        </div>
      </header>

      <div className={styles.mainLayout}>
        <section className={styles.disputeList}>
          <div className={styles.listHeader}>
            <h2>Active Cases</h2>
            <Button variant="secondary" className={styles.filterBtn}>Filter</Button>
          </div>
          
          <div className={styles.cardsGrid}>
            {MOCK_DISPUTES.map(dispute => (
              <Card key={dispute.id} className={styles.disputeCard} interactive onClick={() => setSelectedDispute(dispute)}>
                <div className={styles.cardTop}>
                  <span className={styles.disputeId}>{dispute.id}</span>
                  <StatusChip 
                    label={dispute.status} 
                    status={dispute.status === 'Resolved' ? 'success' : dispute.status === 'Open' ? 'danger' : 'warning'} 
                  />
                </div>
                <div className={styles.cardMid}>
                  <h3 className={styles.reason}>{dispute.reason}</h3>
                  <p className={styles.orderRef}>Order {dispute.orderId}</p>
                  <p className={styles.date}>Opened: {dispute.date}</p>
                </div>
                <div className={styles.cardBot}>
                  <span className={`${styles.priority} ${styles[dispute.priority.toLowerCase()]}`}>
                    {dispute.priority} Priority
                  </span>
                  <Button variant="secondary" className={styles.viewBtn}>View Case</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {selectedDispute && (
          <section className={styles.detailView}>
            <Card className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <div className={styles.detailTitle}>
                  <h2>Case {selectedDispute.id}</h2>
                  <p>Order {selectedDispute.orderId} â€¢ {selectedDispute.reason}</p>
                </div>
                <StatusChip label={selectedDispute.status} status="warning" />
              </div>

              <div className={styles.evidenceSection}>
                <h3>Evidence & Details</h3>
                <div className={styles.evidenceGrid}>
                  <div className={styles.imagePlaceholder}>
                    <span>Photo 1</span>
                  </div>
                  <div className={styles.imagePlaceholder}>
                    <span>Photo 2</span>
                  </div>
                  <div className={styles.uploadBox}>
                    <span>+ Add Photo</span>
                  </div>
                </div>
                <p className={styles.description}>{selectedDispute.description}</p>
              </div>

              <div className={styles.resolutionPanel}>
                <h3>Resolution</h3>
                <div className={styles.resolutionOptions}>
                  <Button variant="secondary" className={styles.optionBtn}>Offer Refund</Button>
                  <Button variant="secondary" className={styles.optionBtn}>Request Re-measurement</Button>
                  <Button className={styles.resolveBtn}>Mark as Resolved</Button>
                </div>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
