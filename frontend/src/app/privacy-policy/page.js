import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Sweettree',
  description: 'Learn how Sweettree collects, uses, and protects your personal information. Read our Privacy Policy.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
            <h1 className="mb-4 fw-bold" style={{ color: 'var(--green-100)', fontFamily: 'var(--font-outfit)' }}>
              Privacy Policy
            </h1>
            
            <p className="text-muted mb-5">
              <strong>Effective Date:</strong> August 17, 2026
            </p>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>1. Introduction</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                Welcome to Sweettree. We value your privacy and are committed to protecting your personal data. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
                our website and use our services. By using our website, you consent to the data practices described in this policy.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>2. Information We Collect</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                We collect personal information that you voluntarily provide to us when you register on the website, 
                express an interest in obtaining information about us or our products, or when you participate in activities on the website.
              </p>
              <ul style={{ color: '#555', lineHeight: '1.8' }}>
                <li><strong>Account Information:</strong> Your name, email address, password, phone number, alternate phone number, gender, and date of birth.</li>
                <li><strong>Address Information:</strong> Names, phone numbers, pincodes, localities, street addresses, cities, states, and landmarks for shipping and billing purposes.</li>
                <li><strong>Order Information:</strong> Details regarding the products you purchase, your shipping address, coupon usage, and order totals.</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>3. How We Use Information</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                We use the information we collect or receive for the following purposes:
              </p>
              <ul style={{ color: '#555', lineHeight: '1.8' }}>
                <li>To facilitate account creation and the login process.</li>
                <li>To fulfill and manage your orders, payments, returns, and exchanges.</li>
                <li>To deliver and facilitate delivery of services and products to you.</li>
                <li>To send you administrative information, such as order confirmations and updates.</li>
                <li>To improve our website, user experience, and customer service.</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>4. Order and Payment Information</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                All payments are processed securely through our authorized payment gateway partner, <strong>CCAvenue</strong>. 
                Sweettree does not directly collect, store, or process your raw credit card numbers, debit card numbers, or UPI PINs. 
                We only retain transaction tracking IDs and bank reference numbers to verify payment status and manage refunds.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>5. Cookies and Local Storage</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                We use cookies and similar tracking technologies to access or store information. Specifically:
              </p>
              <ul style={{ color: '#555', lineHeight: '1.8' }}>
                <li><strong>Local Storage:</strong> Used to maintain your shopping cart (<code>sweettree_cart</code>), wishlist (<code>sweettree_wishlist</code>), and user session preferences (<code>sweettree_user</code>) to provide a seamless browsing experience.</li>
                <li><strong>Secure Cookies:</strong> We utilize secure, HttpOnly cookies for storing authentication tokens to keep your account safe from unauthorized access.</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>6. Third-Party Services</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                We may share your data with trusted third-party vendors, service providers, and partners who perform services for us, including:
              </p>
              <ul style={{ color: '#555', lineHeight: '1.8' }}>
                <li><strong>Payment Processors:</strong> CCAvenue for secure payment processing.</li>
                <li><strong>Shipping Partners:</strong> Logistics partners (such as Delhivery) to deliver your orders.</li>
                <li><strong>Cloud Storage:</strong> AWS S3 for secure data and media hosting.</li>
                <li><strong>Media Platforms:</strong> We may embed YouTube content using privacy-enhanced modes.</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>7. Data Security</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                We implement a variety of security measures to maintain the safety of your personal information. 
                Your passwords are encrypted using industry-standard hashing algorithms (bcrypt). 
                Our backend APIs are secured with JWT authentication, and we utilize security practices like HTTP header protections, 
                database sanitization, and rate limiting to prevent unauthorized access and data breaches.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>8. Data Retention</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, 
                unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>9. User Rights and Choices</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                Depending on your location, you may have certain rights regarding your personal data, including the right to access, 
                correct, or delete the personal information we hold about you. You can review, change, or terminate your account 
                at any time by logging into your account settings and updating your profile.
              </p>
            </section>
            
            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>10. Changes to This Privacy Policy</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                We may update this privacy policy from time to time. The updated version will be indicated by an updated 
                "Effective Date" and the updated version will be effective as soon as it is accessible. We encourage you to review 
                this privacy policy frequently to be informed of how we are protecting your information.
              </p>
            </section>

            <section>
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>11. Contact Information</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                If you have questions or comments about this notice, or wish to report a grievance regarding your privacy, you may contact us at:
              </p>
              <div className="bg-light p-4 rounded-3 mt-3">
                <p className="mb-1"><strong>Email:</strong> support@sweetree.com</p>
                <p className="mb-1"><strong>Phone:</strong> +91 9748724689</p>
                <p className="mb-0"><strong>Address:</strong> 33, Maharshi Devendra Road, Kolkata-700006</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
