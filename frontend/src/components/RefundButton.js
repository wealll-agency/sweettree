'use client';
import React from 'react';

export default function RefundButton() {
  return (
    <button 
      className="btn btn-danger px-4 py-2 fw-medium rounded-pill shadow-sm" 
      style={{ transition: 'all 0.3s ease' }}
      onClick={() => alert('Refund request backend integration coming soon!')}
    >
      <i className="fas fa-undo me-2"></i> Refund Request
    </button>
  );
}
