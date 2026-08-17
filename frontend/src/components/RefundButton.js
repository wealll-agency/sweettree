'use client';
import React from 'react';
import { useNotification } from '../context/NotificationContext';

export default function RefundButton() {
  const { showAlert } = useNotification();

  return (
    <button 
      className="btn btn-danger px-4 py-2 fw-medium rounded-pill shadow-sm" 
      style={{ transition: 'all 0.3s ease' }}
      onClick={() => showAlert('To request a refund, please email your unboxing video and order details to info@webmail.com.', 'info')}
    >
      <i className="fas fa-undo me-2"></i> Refund Request
    </button>
  );
}
