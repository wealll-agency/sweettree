import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | Sweettree',
  description: 'Terms and Conditions, Privacy, and Refund Policies for using the Sweettree website.',
};

export default function TermsAndConditions() {
  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
            <h1 className="mb-4 fw-bold" style={{ color: 'var(--green-100)', fontFamily: 'var(--font-outfit)' }}>
              Terms & Conditions
            </h1>
            
            <p className="text-muted mb-5">
              <strong>Effective Date:</strong> August 17, 2026
            </p>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Personal Information</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                SweetTree respects your privacy.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Services Overview</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                As part of the registration process on the Site, SweetTree may collect the following personally identifiable information about you: Name including first and last name, alternate email address, mobile phone number and contact details, postal code, demographic profile (like your age, gender, occupation, education, address etc.) and information about the pages on the site you visit/access, the links you click on the site, the number of times you access the page and any such browsing information.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Eligibility</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                Services of the Site would be available to only select geographies in India. Persons who are “incompetent to contract” within the meaning of the Indian Contract Act, 1872 including un-discharged insolvents etc. are not eligible to use the Site. If you are a minor i.e. under the age of 18 years but at least 13 years of age you may use the Site only under the supervision of a parent or legal guardian who agrees to be bound by these Terms of Use. If your age is below 18 years your parents or legal guardians can transact on behalf of you if they are registered users. You are prohibited from purchasing any material which is for adult consumption and the sale of which to minors is prohibited.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>License & Site Access</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                SweetTree grants you a limited sub-license to access and make personal use of this site and not to download (other than page caching) or modify it, or any portion of it, except with the express written consent of SweetTree. This license does not include any resale or commercial use of this site or its contents; any collection and use of any product listings, descriptions, or prices; any derivative use of this site or its contents; any downloading or copying of account information for the benefit of another merchant; or any use of data mining, robots, or similar data gathering and extraction tools. This site or any portion of this site may not be reproduced, duplicated, copied, sold, resold, visited, or otherwise exploited for any commercial purpose without express written consent of SweetTree. You may not frame or utilize framing techniques to enclose any trademark, logo, or other proprietary information (including images, text, page layout, or form) of the Site or of SweetTree and its affiliates without express written consent. You may not use any meta tags or any other “hidden text” utilizing the Site’s or SweetTree’s name or trademarks without the express written consent of SweetTree. Any unauthorized use terminates the permission or license granted by SweetTree.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Account & Registration Obligations</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                All shoppers have to register and login for placing orders on the Site. You have to keep your account and registration details current and correct for communications related to your purchases from the site. By agreeing to the terms and conditions, the shopper agrees to receive promotional communication and newsletters upon registration. The customer can opt-out either by unsubscribing in “My Account” or by contacting the customer service.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Pricing</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                All the products listed on the Site will be sold at MRP unless otherwise specified. The prices mentioned at the time of ordering will be the prices charged on the date of the delivery. Although prices of most of the products do not fluctuate on a daily basis.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Return & Refunds</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                We have a “7-day return and refund policy” which entitles all our members to return the product at the time of delivery if due to some reason they are not satisfied with the quality, freshness or quantity of the product. We will take the returned product back with us and issue a refund to you by way of a discount coupon of same amount that can be accrued on any product on our website.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>You Agree and Confirm</h2>
              <ul style={{ color: '#555', lineHeight: '1.8' }}>
                <li className="mb-2">That in the event that a non-delivery occurs on account of a mistake by you (i.e. wrong name or address or any other wrong information) any extra cost incurred by SweetTree for redelivery shall be claimed from you.</li>
                <li className="mb-2">That you will use the services provided by the Site, its affiliates, consultants and contracted companies, for lawful purposes only and comply with all applicable laws and regulations while using and transacting on the Site.</li>
                <li className="mb-2">You will provide authentic and true information in all instances where such information is requested of you. SweetTree reserves the right to confirm and validate the information and other details provided by you at any point in time. If upon confirmation your details are found not to be true (wholly or partly), it has the right in its sole discretion to reject the registration and debar you from using the Services and / or other affiliated websites without prior intimation whatsoever.</li>
                <li className="mb-2">That you are accessing the services available on this Site and transacting at your sole risk and are using your best and prudent judgment before entering into any transaction through this Site.</li>
                <li className="mb-2">That the address at which delivery of the product ordered by you is to be made will be correct and proper in all respects.</li>
                <li className="mb-2">That before placing an order you will check the product description carefully. By placing an order for a product you agree to be bound by the conditions of sale included in the item’s description.</li>
              </ul>
              
              <h3 className="h5 fw-bold mt-4 mb-3" style={{ color: '#333' }}>You may not use the Site for any of the following purposes:</h3>
              <ul style={{ color: '#555', lineHeight: '1.8' }}>
                <li className="mb-2">Disseminating any unlawful, harassing, libelous, abusive, threatening, harmful, vulgar, obscene, or otherwise objectionable material.</li>
                <li className="mb-2">Transmitting material that encourages conduct that constitutes a criminal offence or results in civil liability or otherwise breaches any relevant laws, regulations or code of practice.</li>
                <li className="mb-2">Gaining unauthorized access to other computer systems.</li>
                <li className="mb-2">Interfering with any other person’s use or enjoyment of the Site.</li>
                <li className="mb-2">Breaching any applicable laws;</li>
                <li className="mb-2">Interfering or disrupting networks or web sites connected to the Site.</li>
                <li className="mb-2">Making, transmitting or storing electronic copies of materials protected by copyright without the permission of the owner.</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Colours</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                We have made every effort to display the colours of our products that appear on the Website as accurately as possible. However, as the actual colours you see will depend on your monitor, we cannot guarantee that your monitor’s display of any colour will be accurate.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Modification of Terms & Conditions of Service</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                SweetTree may at any time modify the Terms & Conditions of Use of the Website without any prior notification to you. You can access the latest version of these Terms & Conditions at any given time on the Site. You should regularly review the Terms & Conditions on the Site. In the event the modified Terms & Conditions is not acceptable to you, you should discontinue using the Service. However, if you continue to use the Service you shall be deemed to have agreed to accept and abide by the modified Terms & Conditions of Use of this Site.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Governing Law and Jurisdiction</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                This User Agreement shall be construed in accordance with the applicable laws of India. The Courts at Kolkata, India shall have exclusive jurisdiction in any proceedings arising out of this agreement. Any dispute or difference either in interpretation or otherwise, of any terms of this User Agreement between the parties hereto, the same shall be referred to an independent arbitrator who will be appointed by SweetTree and his decision shall be final and binding on the parties hereto. The above arbitration shall be in accordance with the Arbitration and Conciliation Act, 1996 as amended from time to time. The arbitration shall be held in Kolkata, India. The High Court of judicature at Kolkata, India alone shall have the jurisdiction and the Laws of India shall apply.
              </p>
            </section>

            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Reviews, Feedback, Submissions</h2>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                All reviews, comments, feedback, postcards, suggestions, ideas, and other submissions disclosed, submitted or offered to the Site on or by this Site or otherwise disclosed, submitted or offered in connection with your use of this Site (collectively, the “Comments”) shall be and remain the property of SweetTree. Such disclosure, submission or offer of any Comments shall constitute an assignment to SweetTree of all worldwide rights, titles and interests in all copyrights and other intellectual properties in the Comments. Thus, SweetTree owns exclusively all such rights, titles and interests and shall not be limited in any way in its use, commercial or otherwise, of any Comments. SweetTree will be entitled to use, reproduce, disclose, modify, adapt, create derivative works from, publish, display and distribute any Comments you submit for any purpose whatsoever, without restriction and without compensating you in any way. SweetTree is and shall be under no obligation (1) to maintain any Comments in confidence; (2) to pay you any compensation for any Comments; or (3) to respond to any Comments. You agree that any Comments submitted by you to the Site will not violate this policy or any right of any third party, including copyright, trademark, privacy or other personal or proprietary right(s), and will not cause injury to any person or entity. You further agree that no Comments submitted by you to the Website will be or contain libelous or otherwise unlawful, threatening, abusive or obscene material, or contain software viruses, political campaigning, commercial solicitation, chain letters, mass mailings or any form of “spam”. SweetTree does not regularly review posted Comments but does reserve the right (but not the obligation) to monitor and edit or remove any Comments submitted to the Site. You grant SweetTree the right to use the name that you submit in connection with any Comments. You agree not to use a false email address, impersonate any person or entity, or otherwise mislead as to the origin of any Comments you submit. You are and shall remain solely responsible for the content of any Comments you make and you agree to indemnify SweetTree and its affiliates for all claims resulting from any Comments you submit. SweetTree and its affiliates take no responsibility and assume no liability for any Comments submitted by you or any third party.
              </p>
            </section>

            <section>
              <h2 className="h4 fw-bold mb-3" style={{ color: '#333' }}>Contact Information</h2>
              <div className="bg-light p-4 rounded-3 mt-3">
                <p className="mb-1"><strong>Email:</strong> info@webmail.com</p>
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
