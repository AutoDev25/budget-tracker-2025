import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  padding = 'medium',
  shadow = 'medium'
}) => {
  const cardClassName = `card card--padding-${padding} card--shadow-${shadow} ${className}`;

  return (
    <div className={cardClassName}>
      {title && <h3 className="card__title">{title}</h3>}
      <div className="card__content">
        {children}
      </div>
    </div>
  );
};

export default Card;