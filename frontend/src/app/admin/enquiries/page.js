'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Mail, MailOpen, Trash2, RefreshCw, FileText, X, Download } from 'lucide-react';
import { createPortal } from 'react-dom';
import api from '../../../utils/axiosConfig.js';
import { useNotification } from '../../../context/NotificationContext';

export default function EnquiriesPage() {
  const { user } = useSelector((state) => state.auth);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogLeads, setCatalogLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const { showConfirm } = useNotification();

  const fetchCatalogLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await api.get('/enquiries/catalog-leads');
      if (res.data.success) {
        setCatalogLeads(res.data.leads);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/enquiries`);
      if (res.data.success) setEnquiries(res.data.enquiries);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const markRead = async (id) => {
    try {
      await api.patch(`/enquiries/${id}/read`);
      setEnquiries(prev => prev.map(e => e._id === id ? { ...e, isRead: true } : e));
      if (selected?._id === id) setSelected(prev => ({ ...prev, isRead: true }));
    } catch (e) { console.error(e); }
  };

  const deleteEnquiry = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this enquiry?');
    if (!confirmed) return;
    try {
      await api.delete(`/enquiries/${id}`);
      setEnquiries(prev => prev.filter(e => e._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (e) { console.error(e); }
  };

  const openEnquiry = (enquiry) => {
    setSelected(enquiry);
    if (!enquiry.isRead) markRead(enquiry._id);
  };

  const unread = enquiries.filter(e => !e.isRead).length;

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1">Customer Enquiries</h2>
          <p className="text-muted mb-0">All messages submitted via the Contact page</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          {unread > 0 && (
            <span className="badge bg-danger fs-6 px-3 py-2 rounded-pill">
              🔔 {unread} New
            </span>
          )}
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => { setShowCatalogModal(true); fetchCatalogLeads(); }}>
            <FileText size={16} /> Catalog Data
          </button>
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={fetchEnquiries}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* List Panel */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status" />
              </div>
            ) : enquiries.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Mail size={40} className="mb-3 opacity-50" />
                <p>No enquiries yet.</p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {enquiries.map((enq) => (
                  <button
                    key={enq._id}
                    onClick={() => openEnquiry(enq)}
                    className={`list-group-item list-group-item-action border-0 py-3 px-4 ${selected?._id === enq._id ? 'bg-success bg-opacity-10' : ''}`}
                    style={{ borderLeft: !enq.isRead ? '3px solid #198754' : '3px solid transparent' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-center gap-2">
                        {enq.isRead
                          ? <MailOpen size={16} className="text-muted flex-shrink-0" />
                          : <Mail size={16} className="text-success flex-shrink-0" />}
                        <div className="text-start">
                          <div className={`mb-0 ${!enq.isRead || selected?._id === enq._id ? 'fw-bold' : ''} ${selected?._id === enq._id ? 'text-dark' : ''}`} style={{ fontSize: '14px' }}>
                            {enq.firstName} {enq.lastName}
                          </div>
                          <small className={selected?._id === enq._id ? 'text-dark fw-medium' : 'text-muted'}>{enq.queryType}</small>
                        </div>
                      </div>
                      <small className={`${selected?._id === enq._id ? 'text-dark fw-medium' : 'text-muted'} flex-shrink-0 ms-2`} style={{ fontSize: '11px' }}>
                        {formatDate(enq.createdAt)}
                      </small>
                    </div>
                    <p className={`${selected?._id === enq._id ? 'text-dark' : 'text-muted'} mb-0 mt-1 text-truncate`} style={{ fontSize: '13px' }}>{enq.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="col-md-7">
          {selected ? (
            <div className="card border-0 shadow-sm p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="fw-bold mb-1">{selected.firstName} {selected.lastName}</h5>
                  <div className="text-muted" style={{ fontSize: '14px' }}>
                    <span className="me-3">📧 {selected.email}</span>
                    <span>📞 {selected.phone}</span>
                  </div>
                  <span className="badge bg-success text-white mt-2 py-2 px-3">{selected.queryType}</span>
                </div>
                <div className="d-flex gap-2">
                  {!selected.isRead && (
                    <button className="btn btn-sm btn-outline-success" onClick={() => markRead(selected._id)}>
                      <MailOpen size={14} className="me-1" /> Mark Read
                    </button>
                  )}
                  {['Super Admin', 'Manager'].includes(user?.role) && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteEnquiry(selected._id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="border-top pt-3">
                <small className="text-muted d-block mb-2">Message — {formatDate(selected.createdAt)}</small>
                <p className="mb-0" style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{selected.message}</p>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
              <div className="text-center text-muted">
                <Mail size={48} className="mb-3 opacity-25" />
                <p>Select an enquiry to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Leads Modal */}
      {showCatalogModal && typeof document !== 'undefined' && createPortal(
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, backdropFilter: 'blur(4px)' }} onClick={() => setShowCatalogModal(false)}>
          <div className="card shadow-lg border-0 rounded-4" style={{ width: '600px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-4 px-4 pb-3">
              <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <FileText size={20} className="text-primary" /> Catalog Download Leads
              </h5>
              <button className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={() => setShowCatalogModal(false)}>
                <X size={18} className="text-muted" />
              </button>
            </div>
            <div className="card-body px-0 pb-0" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
              {loadingLeads ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="text-muted mt-3">Loading leads...</p>
                </div>
              ) : catalogLeads.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Download size={40} className="mb-3 opacity-25 mx-auto" />
                  <p>No catalog downloads yet.</p>
                </div>
              ) : (
                <div className="table-responsive px-4 pb-4">
                  <table className="table table-hover align-middle bg-white rounded-3 overflow-hidden shadow-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Mobile Number</th>
                        <th>Date Downloaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalogLeads.map((lead) => (
                        <tr key={lead._id}>
                          <td className="fw-medium text-dark">{lead.name}</td>
                          <td><a href={`tel:${lead.phone}`} className="text-decoration-none">{lead.phone}</a></td>
                          <td className="text-muted fs-7">{formatDate(lead.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
