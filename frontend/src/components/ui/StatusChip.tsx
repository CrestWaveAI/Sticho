import React from 'react';
import styles from './StatusChip.module.css';

export type StatusType = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

interface StatusChipProps {
  label: string;
  status?: StatusType;
  onRemove?: () => void;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ label, status = 'neutral', onRemove, className = '' }) => {
  return (
    <span className={`${styles.chip} ${styles[status]} ${className}`}>
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className={styles.removeBtn} aria-label="Remove">
          &times;
        </button>
      )}
    </span>
  );
};
