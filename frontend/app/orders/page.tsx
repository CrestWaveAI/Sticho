import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import styles from './orders.module.css';

const ORDER_STAGES = [
  'Accepted',
  'Measurements Pending',
  'In Stitching',
  'Ready for Fitting',
  'Ready for Delivery',
  'Delivered',
  'Completed'
];

const MOCK_ORDERS = [
  { id: 'ORD-1024', customer: 'Amit Sharma', stage: 'In Stitching', amount: 1500, deliveryDate: '2026-06-25', measurements: { chest: '40"', waist: '34"', length: '28"' } },
  { id: 'ORD-1021', customer: 'Sanya Malhotra', stage: 'Ready for Fitting', amount: 2200, deliveryDate: '2026-06-22', measurements: { bust: '34"', waist: '28"', hip: '36"' } },
  { id: 'ORD-1019', customer: 'Rahul Verma', stage: 'Measurements Pending', amount: 800, deliveryDate: '2026-06-28', measurements: {} },
];

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<typeof MOCK_ORDERS[0] | null>(null);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Active Orders</h1>
          <p className={styles.subtitle}>Track your tailoring pipeline from fabric to delivery.</p>
        </div>
        <Button variant="secondary">Export Report</Button>
      </header>

      <div className={styles.mainLayout}>
        <section className={styles.orderList}>
          <div className={styles.listHeader}>
            <h2>Current Jobs</h2>
            <div className={styles.filter}>
              <select className={styles.select}>
                <option>All Stages</option>
                {ORDER_STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          
          <div className={styles.cardsGrid}>
            {MOCK_ORDERS.map(order => (
              <Card key={order.id} className={styles.orderCard} interactive onClick={() => setSelectedOrder(order)}>
                <div className={styles.cardTop}>
                  <span className={styles.orderId}>{order.id}</span>
                  <StatusChip label={order.stage} status={order.stage === 'Completed' ? 'success' : 'warning'} />
                </div>
                <div className={styles.cardMid}>
                  <h3 className={styles.customerName}>{order.customer}</h3>
                  <p className={styles.deliveryDate}>Due: {order.deliveryDate}</p>
                </div>
                <div className={styles.cardBot}>
                  <span className={styles.amount}>₹{order.amount}</span>
                  <Button variant="secondary" className={styles.manageBtn}>Manage</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {selectedOrder && (
          <section className={styles.detailView}>
            <Card className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <div className={styles.detailTitle}>
                  <h2>Order {selectedOrder.id}</h2>
                  <p>{selectedOrder.customer}</p>
                </div>
                <Button variant="danger" className={styles.cancelBtn}>Cancel Order</Button>
              </div>

              <div className={styles.stageTracker}>
                {ORDER_STAGES.map((stage, index) => {
                  const currentIdx = ORDER_STAGES.indexOf(selectedOrder.stage);
                  const isCompleted = index < currentIdx;
                  const isCurrent = index === currentIdx;
                  
                  return (
                    <div key={stage} className={`${styles.stageStep} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}>
                      <div className={styles.stepDot} />
                      <span className={styles.stepLabel}>{stage}</span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.actionPanel}>
                <Button 
                  fullWidth 
                  className={styles.nextStageBtn}
                  onClick={() => {
                    const currentIdx = ORDER_STAGES.indexOf(selectedOrder.stage);
                    if (currentIdx < ORDER_STAGES.length - 1) {
                      setSelectedOrder({ ...selectedOrder, stage: ORDER_STAGES[currentIdx + 1] });
                    }
                  }}
                >
                  Move to {ORDER_STAGES[ORDER_STAGES.indexOf(selectedOrder.stage) + 1] || 'Completed'}
                </Button>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoSection}>
                  <h3>Measurement Profile</h3>
                  <Card className={styles.measurementsCard}>
                    {Object.keys(selectedOrder.measurements).length > 0 ? (
                      <div className={styles.measurementsList}>
                        {Object.entries(selectedOrder.measurements).map(([key, val]) => (
                          <div key={key} className={styles.measureRow}>
                            <span className={styles.measureLabel}>{key}</span>
                            <span className={styles.measureVal}>{val}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyMeasurements}>
                        <p>No measurements saved for this customer.</p>
                        <Button variant="secondary" className={styles.addMeasureBtn}>Add Measurements</Button>
                      </div>
                    )}
                  </Card>
                </div>
                <div className={styles.infoSection}>
                  <h3>Order Details</h3>
                  <Card className={styles.detailsCard}>
                    <div className={styles.detailRow}>
                      <span>Total Amount:</span>
                      <span className="tabular-nums">₹{selectedOrder.amount}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Delivery Date:</span>
                      <span>{selectedOrder.deliveryDate}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Status:</span>
                      <StatusChip label={selectedOrder.stage} status="warning" />
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
