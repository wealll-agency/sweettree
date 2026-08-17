import React from 'react';

export const metadata = {
  title: 'Shipping Policy | Sweettree',
  description: 'Review Sweettree\'s Shipping Policy. Learn about our delivery times, shipping locations, and shipping charges.',
};

export default function ShippingPolicy() {
  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
            <h1 className="mb-4 fw-bold" style={{ color: 'var(--green-100)', fontFamily: 'var(--font-outfit)' }}>
              Shipping Policy
            </h1>
            
            <p className="text-muted mb-5">
              <strong>Effective Date:</strong> August 17, 2026
            </p>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>1. Order Processing</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                All orders are typically processed and handed over to our shipping partner (Delhivery) within 24 to 48 hours of successful payment confirmation. 
                Orders are not processed or shipped on Sundays or national public holidays.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>2. Shipping Charges</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                We believe in transparent pricing. Our shipping charges are structured as follows:
              </p>
              <ul style={{ color: '#555', lineHeight: '1.8' }}>
                <li><strong>Free Shipping:</strong> On all orders with a taxable value strictly greater than <strong>₹2000</strong>.</li>
                <li><strong>Flat Rate:</strong> A nominal shipping fee of <strong>₹80</strong> applies to orders with a taxable value of ₹2000 or below.</li>
              </ul>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                Applicable shipping fees will be calculated and displayed clearly at checkout before you complete your payment.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>3. Estimated Delivery Time</h2>
              <div className="alert alert-info">
                <strong>[BUSINESS CONFIRMATION REQUIRED]</strong> Note: The following timeline is a standard estimate.
              </div>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                Delivery timelines depend on your location. While we strive to deliver your products as quickly as possible, typical delivery estimates are:
              </p>
              <ul style={{ color: '#555', lineHeight: '1.8' }}>
                <li><strong>Metropolitan Cities:</strong> 2-4 business days.</li>
                <li><strong>Other Areas (Pan-India):</strong> 5-7 business days.</li>
              </ul>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                Please note that these are estimated timelines. Deliveries may occasionally be delayed due to logistical challenges, bad weather, or other factors outside of our control.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>4. Delivery Tracking</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                Once your order has been manifested and shipped, you will receive tracking information. You can track the real-time status of your package directly from your <strong>Order History</strong> page in your account dashboard.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>5. Address Accuracy and Failed Deliveries</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                Please ensure that your shipping address (including Pin Code and Mobile Number) is complete and accurate. Our courier partner will typically make multiple attempts to deliver your package. If a delivery fails due to an incorrect address or if you are unavailable after multiple attempts, the package will be returned to our warehouse. In such cases, standard refund policies will apply, but original shipping charges may not be refunded.
              </p>
            </section>

            <section>
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>6. Contact Us</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                If you experience significant delays or have any questions regarding your shipment, please reach out to us:
              </p>
              <div className="bg-light p-4 rounded-3 mt-3">
                <p className="mb-1"><strong>Email:</strong> info@webmail.com</p>
                <p className="mb-1"><strong>Phone:</strong> +91 9748724689</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
