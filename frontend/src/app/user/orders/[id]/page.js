'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails } from '../../../../store/ordersSlice.js';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, MapPin, Truck, Check, Calendar, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { activeOrder: order, orderLoading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);
  
  const isNewSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [dispatch, id, user, router]);

  if (!user) return null;

  if (orderLoading || !order) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading order details...</span>
        </div>
      </div>
    );
  }

  // steps list
  const steps = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.orderStatus);

  const getStepStatus = (index) => {
    if (order.orderStatus === 'Cancelled') {
      return 'cancelled';
    }
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="container py-5 animate-fade-in">
      
      {/* Success banner */}
      {isNewSuccess && (
        <div className="alert alert-success p-4 rounded-4 shadow-sm mb-4 border d-flex flex-column align-items-center text-center">
          <div className="rounded-circle p-3 mb-2 bg-success text-white">
            <Check size={32} />
          </div>
          <h3 className="fw-bold m-0 display-font text-success">Order Placed Successfully!</h3>
          <p className="text-muted m-0 mt-1">Thank you for your purchase. We are processing your order.</p>
        </div>
      )}

      {/* Back button */}
      <div className="mb-4">
        <Link href="/user/orders" className="text-decoration-none text-muted hover-green d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>

      <div className="row g-5">
        
        {/* Left Side */}
        <div className="col-lg-8">
          
          <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 border-bottom pb-3 mb-3">
              <div>
                <h5 className="fw-bold m-0 text-dark">Order ID: #{order._id.substring(0, 12).toUpperCase()}</h5>
                <small className="text-muted">Placed on: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</small>
              </div>
              <div className="d-flex flex-column align-items-sm-end">
                <span className="fs-5 fw-bold text-dark">₹{order.totalAmount}</span>
                <small className="badge bg-success-subtle text-success mt-1">{order.paymentStatus}</small>
              </div>
            </div>

            {/* Address */}
            <div className="d-flex align-items-start gap-2 mb-3">
              <MapPin size={20} className="text-muted mt-1" />
              <div>
                <h6 className="fw-bold m-0">Shipping Destination:</h6>
                <p className="m-0 text-muted fs-7 mt-1">{order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
                <p className="m-0 text-muted fs-7">{order.deliveryAddress.state} - {order.deliveryAddress.zipCode}, {order.deliveryAddress.country}</p>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="d-flex align-items-start gap-2 pt-2 border-top">
                <Truck size={20} className="text-muted mt-1" />
                <div>
                  <h6 className="fw-bold m-0">Tracking Reference:</h6>
                  <p className="m-0 text-success fw-bold font-monospace fs-7 mt-1">{order.trackingNumber}</p>
                </div>
              </div>
            )}
          </div>

          {/* Items Recap */}
          <div className="bg-white p-4 rounded-4 shadow-sm border">
            <h5 className="fw-bold mb-3">Purchased Items</h5>
            
            <div className="d-flex flex-column gap-3">
              {order.items.map(item => (
                <div key={item._id} className="d-flex align-items-center justify-content-between border-bottom pb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light p-2 rounded">
                      <ShoppingBag size={24} className="text-success" />
                    </div>
                    <div>
                      <h6 className="fw-bold m-0">{item.name}</h6>
                      <small className="text-muted">₹{item.price} x {item.quantity}</small>
                    </div>
                  </div>
                  <span className="fw-bold text-dark">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Order Status Timeline Progress */}
        <div className="col-lg-4">
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-4 display-font text-dark border-bottom pb-2">Delivery Status</h4>
            
            {order.orderStatus === 'Cancelled' ? (
              <div className="text-center py-4">
                <div className="rounded-circle p-3 mb-2 bg-danger-subtle text-danger d-inline-block">
                  <ShieldCheck size={28} />
                </div>
                <h5 className="fw-bold text-danger">Cancelled</h5>
                <p className="text-muted fs-7">This order has been cancelled and refunded.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4 relative-timeline py-2 ps-2">
                {steps.map((step, idx) => {
                  const status = getStepStatus(idx);
                  return (
                    <div key={step} className="d-flex align-items-start gap-3">
                      <div className="position-relative">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: status === 'completed' || status === 'active' ? 'var(--accent-color)' : '#e9ecef',
                            color: status === 'completed' || status === 'active' ? '#fff' : '#6c757d',
                            zIndex: 2,
                            position: 'relative'
                          }}
                        >
                          {status === 'completed' ? <Check size={16} /> : <Calendar size={14} />}
                        </div>
                        {idx < steps.length - 1 && (
                          <div 
                            className="position-absolute start-50 translate-middle-x"
                            style={{
                              width: '2px',
                              height: '42px',
                              backgroundColor: idx < currentStepIndex ? 'var(--accent-color)' : '#dee2e6',
                              top: '32px',
                              zIndex: 1
                            }}
                          ></div>
                        )}
                      </div>
                      
                      <div>
                        <h6 className={`fw-bold m-0 ${status === 'active' ? 'text-success' : status === 'pending' ? 'text-muted' : 'text-dark'}`}>{step}</h6>
                        <small className="text-muted fs-8">
                          {status === 'completed' ? 'Activity recorded' : status === 'active' ? 'Current processing stage' : 'Pending completion'}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
