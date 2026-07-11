'use client';

import { useEffect, useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateOrderStatus, refundOrder } from '../../../store/adminSlice.js';
import { ShoppingBag, Eye, MapPin, Check, Filter, X, Printer } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function AdminOrdersContent() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterStatus = searchParams.get('status');
  const { orders, ordersLoading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  // Selected order modal details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const handleStatusChange = (id, status) => {
    setActionSuccess('');
    dispatch(updateOrderStatus({ id, status, trackingNumber: status === 'Shipped' ? trackingNumber : undefined }))
      .unwrap()
      .then((updatedOrder) => {
        setActionSuccess(`Order status advanced to ${status}!`);
        setSelectedOrder(updatedOrder);
        dispatch(fetchAdminOrders());
      })
      .catch((err) => {
        alert(err || 'Failed to update order status');
      });
  };

  const handleRefund = (id) => {
    if (confirm('Are you sure you want to cancel this order and refund the payment via Razorpay?')) {
      setActionSuccess('');
      dispatch(refundOrder(id))
        .unwrap()
        .then((updatedOrder) => {
          setActionSuccess('Order cancelled and fully refunded via Razorpay Gateway.');
          setSelectedOrder(updatedOrder);
          dispatch(fetchAdminOrders());
        })
        .catch((err) => {
          alert(err || 'Refund processing failed');
        });
    }
  };

  const closeDetailsModal = () => {
    setSelectedOrder(null);
    setTrackingNumber('');
    setActionSuccess('');
  };

  const displayOrders = filterStatus 
    ? orders.filter(ord => ord.orderStatus === filterStatus)
    : orders;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice').innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Invoice - ${selectedOrder._id.substring(0, 10).toUpperCase()}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { font-family: sans-serif; font-size: 12px; color: #000; padding: 20px; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font">Orders Queue</h1>
          <p className="text-muted m-0">View customer checkouts, ship packages, and verify transaction receipts.</p>
        </div>
        {filterStatus && (
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-brand text-white fs-7 px-3 py-2">
              <Filter size={14} className="me-1" /> Filter: {filterStatus}
            </span>
            <Link href="/admin/orders" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
              <X size={14} /> Clear
            </Link>
          </div>
        )}
      </div>

      {/* Orders Grid */}
      <div className="card shadow-sm p-4 border-0 rounded-4 bg-white mb-4">
        {ordersLoading ? (
          <p className="text-muted text-center py-4">Loading system orders...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-borderless align-middle m-0 fs-7">
              <thead>
                <tr className="border-bottom text-muted">
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No orders found{filterStatus ? ` for status: ${filterStatus}` : ''}.
                    </td>
                  </tr>
                ) : (
                  displayOrders.map((ord) => (
                    <tr key={ord._id} className="border-bottom">
                    <td className="py-3 fw-bold font-monospace">#{ord._id.substring(0, 10).toUpperCase()}</td>
                    <td>
                      <div>
                        <span className="fw-bold text-dark d-block">{ord.user?.name || 'Guest'}</span>
                        <small className="text-muted">{ord.user?.email || 'N/A'}</small>
                      </div>
                    </td>
                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="fw-bold">₹{ord.totalAmount}</td>
                    <td>
                      <span className={ord.paymentStatus === 'Paid' ? 'badge bg-success bg-opacity-10 text-success' : 'badge bg-warning bg-opacity-10 text-warning'}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={ord.orderStatus === 'Delivered' ? 'badge-status-green' : ord.orderStatus === 'Cancelled' ? 'badge-status-red' : 'badge-status-orange'}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="text-center">
                      <button 
                        onClick={() => setSelectedOrder(ord)} 
                        className="btn btn-brand-secondary btn-sm py-1 px-3 d-inline-flex align-items-center gap-1"
                      >
                        <Eye size={14} /> Process
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {/* Details modal overlay */}
      {selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={closeDetailsModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fw-bold">Order Details (#{selectedOrder._id.substring(0, 12).toUpperCase()})</h5>
                <div className="d-flex gap-2 align-items-center">
                  {(selectedOrder.orderStatus === 'Confirmed' || selectedOrder.orderStatus === 'Packed' || selectedOrder.orderStatus === 'Shipped' || selectedOrder.orderStatus === 'Delivered') && (
                    <button onClick={handlePrint} className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1">
                      <Printer size={14} /> Print
                    </button>
                  )}
                  <button type="button" onClick={closeDetailsModal} className="btn-close"></button>
                </div>
              </div>
              
              <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {actionSuccess && <div className="alert alert-success p-2 fs-8 mb-3">{actionSuccess}</div>}

                <div className="row g-4 mb-4">
                  {/* Summary */}
                  <div className="col-md-6">
                    <h6 className="fw-bold text-muted uppercase fs-8 mb-2">Customer Profile</h6>
                    <p className="m-0 fw-semibold text-dark">{selectedOrder.user?.name || 'Guest'}</p>
                    <p className="m-0 text-muted fs-7">Email: {selectedOrder.user?.email || 'N/A'}</p>
                    <p className="m-0 text-muted fs-7">Phone: {selectedOrder.user?.phone || 'N/A'}</p>
                  </div>
                  {/* Address */}
                  <div className="col-md-6">
                    <h6 className="fw-bold text-muted uppercase fs-8 mb-2">Shipping Destination</h6>
                    <div className="d-flex align-items-start gap-1">
                      <MapPin size={16} className="text-muted mt-1" />
                      <div>
                        <p className="m-0 text-dark fs-7">{selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}</p>
                        <p className="m-0 text-muted fs-7">{selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.zipCode}, {selectedOrder.deliveryAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <h6 className="fw-bold text-muted uppercase fs-8 mb-2">Ordered Items</h6>
                <div className="d-flex flex-column gap-2 mb-4 bg-light p-3 rounded border">
                  {selectedOrder.items.map(item => (
                    <div key={item._id} className="d-flex justify-content-between align-items-center fs-7 border-bottom pb-2">
                      <div>
                        <span className="fw-bold text-dark">{item.name}</span>
                        <small className="text-muted d-block">₹{item.price} x {item.quantity}</small>
                      </div>
                      <span className="fw-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between fs-6 fw-bold text-dark pt-2">
                    <span>Order Total</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Status flow advances */}
                <h6 className="fw-bold text-muted uppercase fs-8 mb-2">Administrative Status Control</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {selectedOrder.orderStatus === 'Placed' && (
                    <button onClick={() => handleStatusChange(selectedOrder._id, 'Confirmed')} className="btn btn-sm btn-success">Confirm Order</button>
                  )}
                  {selectedOrder.orderStatus === 'Confirmed' && (
                    <button onClick={() => handleStatusChange(selectedOrder._id, 'Packed')} className="btn btn-sm btn-primary">Pack Order</button>
                  )}
                  {selectedOrder.orderStatus === 'Packed' && (
                    <div className="d-flex gap-2 w-100">
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        placeholder="Enter tracking number"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        style={{ maxWidth: '240px' }}
                      />
                      <button 
                        onClick={() => handleStatusChange(selectedOrder._id, 'Shipped')} 
                        disabled={!trackingNumber}
                        className="btn btn-sm btn-info"
                      >
                        Ship Order
                      </button>
                    </div>
                  )}
                  {selectedOrder.orderStatus === 'Shipped' && (
                    <button onClick={() => handleStatusChange(selectedOrder._id, 'Delivered')} className="btn btn-sm btn-success">Mark Delivered</button>
                  )}
                  
                  {/* Cancel / Refund */}
                  {selectedOrder.orderStatus !== 'Delivered' && selectedOrder.orderStatus !== 'Cancelled' && user.role === 'Super Admin' && (
                    <button onClick={() => handleRefund(selectedOrder._id)} className="btn btn-sm btn-danger">Cancel & Refund Order</button>
                  )}
                </div>

                <div className="fs-8 text-muted border-top pt-3 mt-3">
                  <div className="mb-2">
                    Current Status: <strong className="text-dark">{selectedOrder.orderStatus}</strong> | Payment Status: <strong className="text-dark">{selectedOrder.paymentStatus}</strong>
                  </div>
                  {(selectedOrder.razorpayOrderId || selectedOrder.razorpayPaymentId) && (
                    <div className="bg-light p-3 rounded border">
                      <h6 className="fw-bold text-dark fs-8 mb-2 text-uppercase">Transaction Details</h6>
                      <div className="d-flex flex-column gap-1">
                        {selectedOrder.razorpayPaymentId && (
                          <div className="d-flex justify-content-between">
                            <span>Payment ID / TXN ID:</span>
                            <span className="text-dark fw-medium font-monospace">{selectedOrder.razorpayPaymentId}</span>
                          </div>
                        )}
                        {selectedOrder.razorpayOrderId && (
                          <div className="d-flex justify-content-between">
                            <span>Gateway Order ID:</span>
                            <span className="text-dark fw-medium font-monospace">{selectedOrder.razorpayOrderId}</span>
                          </div>
                        )}
                        {selectedOrder.paymentStatus === 'Paid' && (
                          <div className="d-flex justify-content-between">
                            <span>Payment Processed (Approx):</span>
                            <span className="text-dark fw-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer border-top py-2">
                <button type="button" onClick={closeDetailsModal} className="btn btn-sm btn-brand-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable Invoice - Flipkart Style */}
      {selectedOrder && (
        <div id="printable-invoice" className="d-none">
          
          <div className="d-flex justify-content-between align-items-center border-bottom border-dark pb-2 mb-3">
            <div>
              <h2 className="fw-bold m-0" style={{ fontSize: '24px' }}>Sweettree</h2>
              <div style={{ fontSize: '10px' }}>www.sweettreeon.com</div>
            </div>
            <div className="text-end">
              <h4 className="fw-bold m-0 text-uppercase" style={{ fontSize: '18px' }}>Tax Invoice</h4>
            </div>
          </div>

          <div className="row g-0 border border-dark mb-3">
            {/* Seller Details */}
            <div className="col-6 p-2 border-end border-dark">
              <div className="fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Sold By:</div>
              <div className="fw-bold">Sweettree Enterprises</div>
              <div>123 Herbal Avenue, Sector 5</div>
              <div>Kolkata, West Bengal - 700091, India</div>
              <div className="mt-2"><strong>GSTIN:</strong> 19AAACC1234D1Z5</div>
              <div><strong>PAN:</strong> AAACC1234D</div>
            </div>
            
            {/* Buyer Details */}
            <div className="col-6 p-2">
              <div className="fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Billing/Shipping Address:</div>
              <div className="fw-bold">{selectedOrder.user?.name || 'Guest Customer'}</div>
              <div>{selectedOrder.deliveryAddress.street}</div>
              <div>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.zipCode}</div>
              <div>{selectedOrder.deliveryAddress.country}</div>
              <div className="mt-2"><strong>Phone:</strong> {selectedOrder.user?.phone || 'N/A'}</div>
            </div>
          </div>

          <div className="row g-0 border border-dark border-bottom-0">
            <div className="col-3 p-2 border-end border-dark">
              <div className="text-uppercase" style={{ fontSize: '10px' }}>Order No:</div>
              <div className="fw-bold">{selectedOrder._id.substring(0, 14).toUpperCase()}</div>
            </div>
            <div className="col-3 p-2 border-end border-dark">
              <div className="text-uppercase" style={{ fontSize: '10px' }}>Order Date:</div>
              <div className="fw-bold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="col-3 p-2 border-end border-dark">
              <div className="text-uppercase" style={{ fontSize: '10px' }}>Invoice Date:</div>
              <div className="fw-bold">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="col-3 p-2">
              <div className="text-uppercase" style={{ fontSize: '10px' }}>Payment Mode:</div>
              <div className="fw-bold">{selectedOrder.paymentStatus === 'Paid' ? 'Prepaid' : 'COD'}</div>
            </div>
          </div>

          <table className="table table-bordered border-dark mb-0" style={{ borderColor: '#000' }}>
            <thead>
              <tr className="text-center bg-light" style={{ fontSize: '11px' }}>
                <th style={{ width: '5%' }}>Sl.</th>
                <th className="text-start" style={{ width: '35%' }}>Description</th>
                <th style={{ width: '10%' }}>Unit Price</th>
                <th style={{ width: '5%' }}>Qty</th>
                <th style={{ width: '10%' }}>Net Amt</th>
                <th style={{ width: '8%' }}>Tax Rate</th>
                <th style={{ width: '12%' }}>Tax Amt</th>
                <th style={{ width: '15%' }}>Total Amt</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items.map((item, idx) => {
                const basePrice = Math.round((item.price / 1.18) * 100) / 100;
                const taxAmt = Math.round((item.price - basePrice) * 100) / 100;
                
                return (
                  <tr key={item._id} className="text-center" style={{ fontSize: '11px' }}>
                    <td>{idx + 1}</td>
                    <td className="text-start fw-bold">{item.name}</td>
                    <td>₹{basePrice.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>₹{(basePrice * item.quantity).toFixed(2)}</td>
                    <td>18%</td>
                    <td>₹{(taxAmt * item.quantity).toFixed(2)}</td>
                    <td className="fw-bold text-end">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                );
              })}
              
              {/* Shipping Row */}
              <tr className="text-center" style={{ fontSize: '11px' }}>
                <td></td>
                <td className="text-start">Shipping Charges</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td className="text-end">₹{selectedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) > 500 ? '0.00' : '40.00'}</td>
              </tr>

              {/* Coupon Row */}
              {selectedOrder.couponCode && (
                <tr className="text-center" style={{ fontSize: '11px' }}>
                  <td></td>
                  <td className="text-start text-success">Coupon Discount ({selectedOrder.couponCode})</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td className="text-end text-success">-₹{(selectedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) + (selectedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) > 500 ? 0 : 40) - selectedOrder.totalAmount).toFixed(2)}</td>
                </tr>
              )}

              {/* Grand Total */}
              <tr className="fw-bold" style={{ fontSize: '13px' }}>
                <td colSpan="7" className="text-end">Grand Total:</td>
                <td className="text-end">₹{selectedOrder.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-end mt-4">
            <div style={{ fontSize: '10px' }}>
              <div><strong>Declaration:</strong></div>
              <div>The goods sold are intended for end user consumption and not for resale.</div>
              <div>Returns are accepted within 7 days in original packaging.</div>
            </div>
            <div className="text-center">
              <div style={{ borderBottom: '1px solid #000', width: '150px', marginBottom: '5px', height: '40px' }}></div>
              <div className="fw-bold" style={{ fontSize: '11px' }}>Authorized Signatory</div>
            </div>
          </div>
          
        </div>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading orders queue...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
