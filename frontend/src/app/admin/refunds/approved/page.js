import RefundsPageClient from '../RefundsPageClient.js';

export const metadata = {
  title: 'Approved Refunds | Admin Panel',
};

export default function ApprovedRefundsPage() {
  return <RefundsPageClient status="Approved" />;
}
