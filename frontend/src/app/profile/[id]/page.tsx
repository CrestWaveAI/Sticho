'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { fetchTailorDetail, submitLead, fetchReviews, submitReview, trackClick, Tailor, Review } from '../../api';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TailorDetailsPage({ params }: PageProps) {
  const { id: tailorId } = use(params);
  const { addToast } = useToast();

  const [tailor, setTailor] = useState<Tailor | null>(null);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [unlockedContacts, setUnlockedContacts] = useState<Record<string, {
    contact_number: string;
    whatsapp_number: string;
    latitude: number | null;
    longitude: number | null;
  }>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Form states for lead capture
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [requirementDesc, setRequirementDesc] = useState('');
  const [leadError, setLeadError] = useState('');

  // Form states for review submission
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Customer session token from localStorage
  const [customerToken, setCustomerToken] = useState<string | null>(null);

  const isUnlocked = tailorId in unlockedContacts;

  // 1. Load session and local storage cache on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('customer_token');
      const stored = localStorage.getItem('unlocked_tailors');
      
      setTimeout(() => {
        if (token) {
          setCustomerToken(token);
        }
        if (stored) {
          try {
            setUnlockedContacts(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse unlocked tailors cache:', e);
          }
        }
      }, 0);
    }
  }, []);

  // 2. Fetch tailor detail & reviews list
  useEffect(() => {
    if (!tailorId) return;

    async function loadTailorData() {
      setIsLoading(true);
      try {
        const detail = await fetchTailorDetail(tailorId);
        setTailor(detail);
      } catch (err) {
        console.error('Failed to load tailor details:', err);
        addToast('Failed to load tailor information.', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    async function loadReviews() {
      setIsLoadingReviews(true);
      try {
        const reviews = await fetchReviews(tailorId);
        setReviewsList(reviews);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setIsLoadingReviews(false);
      }
    }

    loadTailorData();
    loadReviews();
  }, [tailorId, addToast]);

  // 3. Submit Lead Form
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError('');

    if (!customerName.trim()) {
      setLeadError('Please enter your name.');
      return;
    }
    if (!customerMobile.trim()) {
      setLeadError('Please enter your mobile number.');
      return;
    }
    if (!requirementDesc.trim()) {
      setLeadError('Please enter your requirements.');
      return;
    }

    const cleanMobile = customerMobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setLeadError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmittingLead(true);
    try {
      const unlockedTailor = await submitLead({
        tailor_id: tailorId,
        customer_name: customerName.trim(),
        customer_mobile: cleanMobile,
        requirement_description: requirementDesc.trim()
      });

      if (unlockedTailor.contact_number) {
        const updatedUnlocked = {
          ...unlockedContacts,
          [unlockedTailor.id]: {
            contact_number: unlockedTailor.contact_number,
            whatsapp_number: unlockedTailor.whatsapp_number || unlockedTailor.contact_number,
            latitude: unlockedTailor.latitude ?? null,
            longitude: unlockedTailor.longitude ?? null
          }
        };

        setUnlockedContacts(updatedUnlocked);
        localStorage.setItem('unlocked_tailors', JSON.stringify(updatedUnlocked));
        addToast('Contact details successfully unlocked!', 'success');
      } else {
        setLeadError('Failed to unlock contact details. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setLeadError(err instanceof Error ? err.message : 'Failed to submit lead gating. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // 4. Submit Review Form
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToken) {
      addToast('Please sign in as a customer to submit a review.', 'error');
      return;
    }
    if (!reviewComment.trim()) {
      addToast('Please write a comment for your review.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newReview = await submitReview({
        tailor_id: tailorId,
        rating: reviewRating,
        comment: reviewComment.trim()
      }, customerToken);

      addToast('Review submitted successfully!', 'success');
      setReviewComment('');
      setReviewRating(5);
      setReviewsList(prev => [newReview, ...prev]);

      // Locally update tailor rating count
      if (tailor) {
        const count = tailor.reviews_count || 0;
        const currentRating = tailor.rating || 0;
        const newCount = count + 1;
        const newRating = parseFloat(((currentRating * count + reviewRating) / newCount).toFixed(1));
        setTailor({
          ...tailor,
          reviews_count: newCount,
          rating: newRating
        });
      }
    } catch (err) {
      console.error(err);
      addToast(err instanceof Error ? err.message : 'Failed to submit review.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // 5. Track Call/WhatsApp button clicks
  const handleTrackClick = async (type: 'whatsapp' | 'call') => {
    try {
      await trackClick(tailorId, type);
    } catch (err) {
      console.error('Failed to track click analytics:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Loading boutique profile details...</div>
        </div>
      </div>
    );
  }

  if (!tailor) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Boutique profile not found.</h2>
          <Link href="/">
            Back to Marketplace Discovery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <span>←</span> Back to Marketplace Discovery
      </Link>

      <div className={styles.profileLayout}>
        <div className={styles.mainCol}>
          {/* Hero Banner Card */}
          <article className={styles.heroCard}>              <div 
              className={styles.heroBanner}
              style={{ background: tailor.gradient || 'linear-gradient(135deg, #bf91ac 0%, #7d4d68 100%)' }}
            >
              <div className={styles.heroPattern} />
              <div className={styles.logoBadge}>
                {tailor.name.charAt(0).toUpperCase()}
              </div>
              {tailor.is_verified && (
                <div className={styles.verifiedBadge}>
                  ✓ Verified Partner
                </div>
              )}
            </div>
            <div className={styles.heroInfo}>
              <div className={styles.headerRow}>
                <h1 className={styles.tailorName}>{tailor.name}</h1>
                <div className={styles.ratingBadge}>
                  <span className={styles.starIcon}>★</span>
                  <span>{tailor.rating}</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>({tailor.reviews_count})</span>
                </div>
              </div>
              <p className={styles.subtitle}>
                <span className={styles.subtitleIcon}>📍</span>
                {tailor.location ? `${tailor.location.name}, ${tailor.location.city} (${tailor.location.pin_code})` : 'Location not specified'}
              </p>

              <div className={styles.metadataGrid}>
                <div className={styles.metadataItem}>
                  <span className={styles.metaLabel}>Experience</span>
                  <span className={styles.metaVal}>{tailor.experience || 0} Years</span>
                </div>
                <div className={styles.metadataItem}>
                  <span className={styles.metaLabel}>Reviews Completed</span>
                  <span className={styles.metaVal}>{tailor.reviews_count || 0} Reviews</span>
                </div>
                <div className={styles.metadataItem}>
                  <span className={styles.metaLabel}>Verification Status</span>
                  <span className={`${styles.metaVal} ${styles.approved}`}>Approved Partner</span>
                </div>
              </div>
            </div>
          </article>

          {/* Business Biography */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionTitleIcon}>✦</span>
              About Boutique
            </h2>
            <p className={styles.bioText}>{tailor.bio || 'No bio details provided.'}</p>
          </section>

          {/* Service Specializations */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionTitleIcon}>◈</span>
              Specializations & Services
            </h2>
            <div className={styles.categoryContainer}>
              {tailor.categories.length > 0 ? (
                tailor.categories.map(cat => (
                  <span key={cat} className={styles.categoryTag}>
                    {cat}
                  </span>
                ))
              ) : (
                <span className={styles.categoryTag}>General Stitching & Custom Alterations</span>
              )}
            </div>
          </section>

          {/* Portfolio Image Gallery */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionTitleIcon}>◉</span>
              Work Portfolio Gallery
            </h2>
            <div className={styles.portfolioGrid}>
              {tailor.portfolio_images && tailor.portfolio_images.length > 0 ? (
                tailor.portfolio_images.map(img => (
                  <div key={img.id} className={styles.portfolioCard} 
                    style={{ backgroundImage: `url(${img.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
                    title={img.caption || ''}
                  />
                ))
              ) : (
                <>
                  <div className={styles.portfolioCard}>
                    <span className={styles.placeholderText}>Sample Styling 1</span>
                  </div>
                  <div className={styles.portfolioCard}>
                    <span className={styles.placeholderText}>Sample Styling 2</span>
                  </div>
                  <div className={styles.portfolioCard}>
                    <span className={styles.placeholderText}>Sample Styling 3</span>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Dynamic Reviews & Submission Form */}
          <section className={`${styles.section} ${styles.reviewsSection}`}>
            <div className={styles.reviewsHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionTitleIcon}>★</span>
                Customer Feedback ({reviewsList.length})
              </h2>
            </div>

            <div className={styles.reviewsList}>
              {isLoadingReviews ? (
                <div className={styles.loadingText}>Loading customer feedback list...</div>
              ) : reviewsList.length === 0 ? (
                <div className={styles.loadingText}>No reviews submitted yet. Be the first to share your experience!</div>
              ) : (
                reviewsList.map(rev => (
                  <article key={rev.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewerName}>{rev.customer_name}</span>
                      <span className={styles.reviewDate}>
                        {new Date(rev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className={styles.reviewStars}>
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p className={styles.reviewComment}>{rev.comment}</p>
                  </article>
                ))
              )}
            </div>

            {/* Submit Review Form */}
            {customerToken ? (
              <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                <h3 className={styles.reviewFormTitle}>Write a Review</h3>
                
                <div className={styles.ratingSelector}>
                  <span className={styles.ratingLabel}>Select Star Rating:</span>
                  {Array.from({ length: 5 }).map((_, index) => {
                    const val = index + 1;
                    return (
                      <button
                        key={val}
                        type="button"
                        aria-label={`${val} star${val !== 1 ? 's' : ''}`}
                        onClick={() => setReviewRating(val)}
                        className={`${styles.starBtn} ${val <= reviewRating ? styles.selected : ''}`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

                <div className={styles.reviewInputGroup}>
                  <label htmlFor="review-comment">Stitching Feedback & Fitting Experience</label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Describe the styling fit, completion timing, and boutique customer service quality..."
                    className={styles.reviewTextarea}
                  />
                </div>

                <Button type="submit" variant="primary" disabled={isSubmittingReview} className={styles.submitReviewBtn}>
                  {isSubmittingReview ? 'Submitting Review...' : 'Submit Feedback'}
                </Button>
              </form>
            ) : (
              <div className={styles.signInPrompt}>
                <h3>Want to review {tailor.name}?</h3>
                <p>
                  Please sign in as a customer on the discovery home page to submit fitting ratings and reviews.
                </p>
                <Link href="/">
                  <Button variant="secondary">Go to Discovery Home</Button>
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Gating Column */}
        <aside className={styles.sidebar}>
          {isUnlocked ? (
            <div className={styles.unlockedCard}>
              <div className={styles.unlockedHeader}>
                <span>✅ Details Unlocked</span>
              </div>
              
              <div className={styles.unlockedDetailList}>
                <div className={styles.unlockedDetailItem}>
                  <span className={styles.detailLabel}>📞 Call Direct</span>
                  <span className={styles.detailValue}>
                    {unlockedContacts[tailorId].contact_number}
                  </span>
                </div>
                
                <div className={styles.unlockedDetailItem}>
                  <span className={styles.detailLabel}>💬 WhatsApp Message</span>
                  <span className={styles.detailValue}>
                    {unlockedContacts[tailorId].whatsapp_number}
                  </span>
                </div>

                <div className={styles.unlockedDetailItem}>
                  <span className={styles.detailLabel}>📍 Shop Location Address</span>
                  <span className={styles.detailValue}>
                    {tailor.address}
                  </span>
                </div>

                {unlockedContacts[tailorId].latitude !== null && unlockedContacts[tailorId].longitude !== null && (
                  <div className={styles.unlockedDetailItem}>
                    <span className={styles.detailLabel}>🗺️ GPS Map Pin</span>
                    <span className={styles.detailValue}>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${unlockedContacts[tailorId].latitude},${unlockedContacts[tailorId].longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.mapLink}
                      >
                        View Shop Route on Maps
                      </a>
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.sidebarActionBtns}>
                <a 
                  href={`https://wa.me/${unlockedContacts[tailorId].whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleTrackClick('whatsapp')}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="primary" fullWidth style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', color: 'white' }}>
                    Open WhatsApp Chat
                  </Button>
                </a>
                <a 
                  href={`tel:${unlockedContacts[tailorId].contact_number}`}
                  onClick={() => handleTrackClick('call')}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="secondary" fullWidth>
                    Place Call Now
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className={styles.gatedCard}>
              <h2 className={styles.gatedTitle}>Connect with Partner</h2>
              <p className={styles.gatedSubtitle}>
                Boutique contact numbers and GPS map route guides are hidden to protect privacy. Fill in your requirements below to unlock.
              </p>

              <form onSubmit={handleLeadSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="customer-name" className={styles.formLabel}>Customer Name</label>
                  <Input
                    id="customer-name"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="customer-mobile" className={styles.formLabel}>Mobile Phone Number</label>
                  <Input
                    id="customer-mobile"
                    value={customerMobile}
                    onChange={e => setCustomerMobile(e.target.value)}
                    placeholder="Enter 10-digit number"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="requirement-desc" className={styles.formLabel}>Stitching Requirements</label>
                  <textarea
                    id="requirement-desc"
                    rows={4}
                    value={requirementDesc}
                    onChange={e => setRequirementDesc(e.target.value)}
                    placeholder="e.g. Bridal Lehenga custom stitching, Suit resizing alter, etc."
                    className={styles.formTextarea}
                  />
                </div>

                {leadError && <div className={styles.formError}>{leadError}</div>}

                <Button type="submit" variant="primary" fullWidth disabled={isSubmittingLead}>
                  {isSubmittingLead ? 'Submitting Details...' : 'Request Contact Details'}
                </Button>
              </form>
            </div>
          )}

          {/* Working Hours Card */}              <div className={styles.hoursCard}>
            <h3 className={styles.hoursTitle}>
              <span>🕐</span> Shop Hours
            </h3>
            <div className={styles.hoursList}>
              {tailor.working_hours ? (
                Object.entries(tailor.working_hours).map(([day, value]) => {
                  const isClosed = typeof value === 'string' 
                    ? value.toLowerCase() === 'closed'
                    : value.closed;

                  const timeStr = typeof value === 'string'
                    ? value
                    : isClosed ? 'Closed' : `${value.open} - ${value.close}`;

                  return (
                    <div key={day} className={styles.hoursRow}>
                      <span className={styles.dayName}>{day}</span>
                      <span className={`${styles.dayValue} ${isClosed ? styles.closed : styles.open}`}>
                        {timeStr}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className={styles.loadingText}>Hours not specified</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
