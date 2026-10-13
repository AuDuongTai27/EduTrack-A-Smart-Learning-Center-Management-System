import React from 'react';

export interface PaymentMethodCardProps {
  methodId: 'qr' | 'momo' | 'atm' | 'visa';
  isSelected: boolean;
  onSelect: () => void;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
}

export function PaymentMethodCard({
  isSelected,
  onSelect,
  icon,
  iconColor,
  title,
  description,
}: PaymentMethodCardProps) {
  return (
    <div
      className={`payment-method-card ${isSelected ? 'active' : ''}`}
      onClick={onSelect}
    >
      <i className={`bi ${icon} fs-4 ${iconColor}`}></i>
      <div className="flex-grow-1">
        <div className="fw-semibold text-dark">{title}</div>
        <div className="text-muted small">{description}</div>
      </div>
      <i
        className={`bi bi-check-circle-fill text-primary method-check-icon ${
          isSelected ? '' : 'd-none'
        }`}
      ></i>
    </div>
  );
};

export default PaymentMethodCard;
