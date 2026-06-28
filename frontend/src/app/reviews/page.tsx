'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './reviews.module.css';

const MOCK_REVIEWS = [
  { id: 'R1', customer: 'Sanya Malhotra', rating: 5, comment: 'Perfect fit for my bridal blouse! The attention to detail was amazing.', date: '2026-06-10', orderId: 'ORD-1021', response: 'Thank you Sanya! It was a pleasure working on your special outfit.' },
  { id: 'R2', customer: 'Amit Sharma', rating: 4, comment: 'Good quality work, but the delivery was delayed by two days.', date: '2026-06-05', orderId: 'ORD-1024', response: '' },
  { id: 'R3', customer: 'Priya Das', rating: 5, comment: 'Best tailor in the locality. Very professional and precise.', date: '2026-05-28', orderId: 'ORD-1015', response: 'We appreciate your kind words, Priya!' },
];

export default function ReviewsPage() {
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Ratings & Reviews</h1>
          <p className={styles.subtitle}>Your reputation is your strongest asset. Respond to customers to build trust.</p>
        </div>
        <div className={styles.aggregateRating}>
          <span className={styles.ratingValue}>4.8</span>
          <span className={styles.ratingLabel}>Average Rating</span>
        </div>
      </header>

      <div className={styles.reviewsList}>
        {MOCK_REVIEWS.map(review => (
          <Card key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.customerInfo}>
                <span className={styles.customerName}>{review.customer}</span>
                <span className={styles.orderRef}>Order {review.orderId}</span>
              </div>
              <div className={styles.ratingStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < review.rating ? styles.starFilled : styles.starEmpty}>â˜…</span>
                ))}
              </div>
            </div>

            <p className={styles.comment}>{review.comment}</p>
            
            <div className={styles.reviewFooter}>
              <span className={styles.date}>{review.date}</span>
              {review.response ? (
                <div className={styles.responseBox}>
                  <span className={styles.responseLabel}>Your Response:</span>
                  <p className={styles.responseText}>{review.response}</p>
                </div>
              ) : (
                <Button 
                  variant="secondary" 
                  className={styles.respondBtn}
                  onClick={() => setRespondingTo(review.id)}
                >
                  Respond Publicly
                </Button>
              )}
            </div>

            {respondingTo === review.id && (
              <div className={styles.responseForm}>
                <textarea 
                  placeholder="Write a professional response..." 
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                />
                <div className={styles.formActions}>
                  <Button variant="secondary" onClick={() => setRespondingTo(null)}>Cancel</Button>
                  <Button onClick={() => {
                    alert('Response posted!');
                    setRespondingTo(null);
                    setResponseText('');
                  }}>Post Response</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
