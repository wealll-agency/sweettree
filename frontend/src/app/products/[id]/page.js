import { redirect } from 'next/navigation';

export default async function ProductDetailsRedirectPage({ params }) {
  const resolvedParams = await params;
  redirect(`/shop-details?id=${resolvedParams.id}`);
}
