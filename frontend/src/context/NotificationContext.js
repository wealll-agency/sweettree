'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X, HelpCircle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'info', title: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', title: '' });
  const [progressKey, setProgressKey] = useState(0);

  const confirmResolver = useRef(null);
  const toastTimer = useRef(null);

  const showAlert = useCallback((message, type = 'info', title = null) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToast({ show: true, message, type, title });
    setProgressKey(prev => prev + 1);
    toastTimer.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4200);
  }, []);

  const hideAlert = useCallback(() => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const showConfirm = useCallback((message, title = 'Confirmation Required') => {
    setConfirmModal({ show: true, message, title });
    return new Promise((resolve) => {
      confirmResolver.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmModal({ show: false, message: '', title: '' });
    if (confirmResolver.current) {
      confirmResolver.current(true);
      confirmResolver.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmModal({ show: false, message: '', title: '' });
    if (confirmResolver.current) {
      confirmResolver.current(false);
      confirmResolver.current = null;
    }
  }, []);

  // Theme styling configuration for toast variants
  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
          borderColor: 'rgba(52, 211, 153, 0.4)',
          iconBg: 'rgba(52, 211, 153, 0.2)',
          iconColor: '#34D399',
          progressBg: '#34D399',
          icon: CheckCircle2,
          defaultTitle: 'Success'
        };
      case 'error':
      case 'danger':
        return {
          bg: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B91C1C 100%)',
          borderColor: 'rgba(248, 113, 113, 0.4)',
          iconBg: 'rgba(248, 113, 113, 0.2)',
          iconColor: '#F87171',
          progressBg: '#F87171',
          icon: XCircle,
          defaultTitle: 'Error'
        };
      case 'warning':
        return {
          bg: 'linear-gradient(135deg, #78350F 0%, #92400E 50%, #B45309 100%)',
          borderColor: 'rgba(251, 191, 36, 0.4)',
          iconBg: 'rgba(251, 191, 36, 0.2)',
          iconColor: '#FBBF24',
          progressBg: '#FBBF24',
          icon: AlertCircle,
          defaultTitle: 'Warning'
        };
      default: // info & default notifications
        return {
          bg: 'linear-gradient(135deg, #0A2F1D 0%, #164E32 50%, #1E6B45 100%)',
          borderColor: 'rgba(52, 211, 153, 0.4)',
          iconBg: 'rgba(52, 211, 153, 0.22)',
          iconColor: '#34D399',
          progressBg: '#34D399',
          icon: CheckCircle2,
          defaultTitle: 'Notification'
        };
    }
  };

  const toastConfig = getToastConfig(toast.type);
  const IconComponent = toastConfig.icon;

  return (
    <NotificationContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toastSlideIn {
          0% {
            transform: translateY(-20px) scale(0.92);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes toastProgressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        .premium-toast-card {
          animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.12);
        }
        .toast-close-btn {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .toast-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          color: #ffffff;
          transform: scale(1.08);
        }
      ` }} />

      {/* Premium Floating Toast Container */}
      <div 
        className="position-fixed top-0 end-0 p-3 p-md-4" 
        style={{ zIndex: 99999, maxWidth: '420px', width: '100%', pointerEvents: 'none' }}
      >
        {toast.show && (
          <div 
            className="premium-toast-card rounded-4 overflow-hidden position-relative"
            style={{ 
              background: toastConfig.bg,
              border: `1px solid ${toastConfig.borderColor}`,
              color: '#FFFFFF',
              pointerEvents: 'auto'
            }}
            role="alert"
          >
            <div className="p-3 px-4 d-flex align-items-start gap-3">
              {/* Status Icon */}
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5"
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  backgroundColor: toastConfig.iconBg,
                  color: toastConfig.iconColor
                }}
              >
                <IconComponent size={20} />
              </div>

              {/* Toast Message Body */}
              <div className="flex-grow-1 min-w-0 pe-2">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="fw-bold tracking-wide text-uppercase" style={{ color: toastConfig.iconColor, fontSize: '11px', letterSpacing: '0.5px' }}>
                    {toast.title || toastConfig.defaultTitle}
                  </span>
                </div>
                <p className="mb-0 fw-medium" style={{ fontSize: '13.5px', lineHeight: '1.45', color: '#F8FAFC' }}>
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button 
                type="button" 
                className="toast-close-btn flex-shrink-0 mt-0.5" 
                onClick={hideAlert} 
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Countdown Progress Bar */}
            <div 
              style={{
                height: '3px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                overflow: 'hidden'
              }}
            >
              <div 
                key={progressKey}
                style={{
                  height: '100%',
                  backgroundColor: toastConfig.progressBg,
                  animation: 'toastProgressBar 4.2s linear forwards'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Premium Confirm Modal */}
      {confirmModal.show && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 100000, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
              <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden" style={{ background: '#FFFFFF' }}>
                
                <div className="p-4 text-center pb-3">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', backgroundColor: '#FEF3C7', color: '#D97706' }}>
                    <HelpCircle size={30} />
                  </div>
                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '19px' }}>
                    {confirmModal.title || 'Confirmation Required'}
                  </h5>
                  <p className="mb-0 text-muted fs-7" style={{ lineHeight: '1.5' }}>
                    {confirmModal.message}
                  </p>
                </div>

                <div className="p-4 pt-2 border-top-0 d-flex align-items-center gap-2 bg-light bg-opacity-50">
                  <button 
                    type="button" 
                    className="btn btn-light w-50 py-2.5 fw-semibold rounded-3 text-secondary border border-secondary-subtle" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-brand w-50 py-2.5 fw-semibold rounded-3 text-white shadow-sm" 
                    style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
                    onClick={handleConfirm}
                  >
                    Confirm
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </NotificationContext.Provider>
  );
};
