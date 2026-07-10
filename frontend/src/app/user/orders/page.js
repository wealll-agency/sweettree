'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../../store/ordersSlice.js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react';

export default function OrderHistoryPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { list: orders, orderLoading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, user, router]);

  if (!user) return null;

  if (orderLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4" style={{ color: '#203d74' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-5 card border-0 shadow-sm max-w-lg mx-auto">
          <i className="fas fa-shopping-bag fa-3x text-muted mb-3 mx-auto d-block"></i>
          <h4 className="fw-bold mb-2">No Orders Placed Yet</h4>
          <p className="text-muted mb-4">You have not placed any orders yet on our platform.</p>
          <Link href="/products" className="btn btn-dark">Browse Products</Link>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-4 shadow-sm border overflow-auto">
          <table className="table table-borderless align-middle m-0" style={{ minWidth: '600px' }}>
            <thead>
              <tr className="border-bottom text-muted fs-7">
                <th>Order ID</th>
                <th>Date</th>
                <th>Items Count</th>
                <th>Total Paid</th>
                <th>Order Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-bottom">
                  <td className="py-3">
                    <span className="fw-bold text-dark font-monospace fs-7">#{order._id.substring(0, 10).toUpperCase()}</span>
                  </td>
                  <td>
                    <span className="text-muted fs-7">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <span className="text-dark fw-medium fs-7">{order.items.reduce((acc, item) => acc + item.quantity, 0)} items</span>
                  </td>
                  <td>
                    <span className="fw-bold text-dark fs-6">₹{order.totalAmount}</span>
                  </td>
                  <td>
                    <span className={
                      order.orderStatus === 'Delivered' 
                        ? 'badge-status-green' 
                        : order.orderStatus === 'Cancelled'
                        ? 'badge-status-red'
                        : 'badge-status-orange'
                    }>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="text-center">
                    <Link href={`/user/orders/${order._id}`} className="btn btn-brand-outline btn-sm py-1 px-3 d-inline-flex align-items-center gap-1">
                      <Eye size={14} /> Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
