import RefundsPageClient from '../RefundsPageClient.js';

export const metadata = {
  title: 'Rejected Refunds | Admin Panel',
};

export default function RejectedRefundsPage() {
  return <RefundsPageClient status="Rejected" />;
}
