import RefundsPageClient from '../RefundsPageClient.js';

export const metadata = {
  title: 'Pending Refunds | Admin Panel',
};

export default function PendingRefundsPage() {
  return <RefundsPageClient status="Pending" />;
}
