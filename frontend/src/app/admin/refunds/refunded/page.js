import RefundsPageClient from '../RefundsPageClient.js';

export const metadata = {
  title: 'Refunded Requests | Admin Panel',
};

export default function RefundedRequestsPage() {
  return <RefundsPageClient status="Refunded" />;
}
