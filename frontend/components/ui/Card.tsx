import React, { HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, interactive = false, className = '', ...props }) => {
  const cardClass = `${styles.card} ${interactive ? styles.interactive : ''} ${className}`;
  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};
