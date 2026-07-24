'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, EffectCoverflow } from 'swiper/modules';
import Link from 'next/link';
import Image from 'next/image';

export const NuttyDelightOffers = () => {
  return (
    <section className="section-wrapper bg-white pb-5 relative-nav">
      <div className="container text-center offers-container-override">
        <h2 className="main-title" style={{ marginBottom: '60px' }}>Nutty Delight Offers</h2>
        <Swiper
          modules={[Autoplay, Navigation]}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          navigation={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          slidesPerView={3}
          spaceBetween={0}
          className="offers-slider mx-auto pb-5 px-4"
          style={{ width: '100%', padding: '40px 0' }}
        >
          {[
            { img: '/offer1.jpg', alt: 'Payday Sale' },
            { img: '/offer3.jpg', alt: 'Tiny Seeds' },
            { img: '/offer2.jpg', alt: 'Rare Crop' },
            { img: '/offer1.jpg', alt: 'Payday Sale' },
            { img: '/offer3.jpg', alt: 'Tiny Seeds' },
          ].map((slide, idx) => (
            <SwiperSlide key={idx}>
              <div className="offer-card mx-auto" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <Image src={slide.img} alt={slide.alt} width={400} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .offers-container-override .swiper-button-next,
        .offers-container-override .swiper-button-prev {
          color: #000 !important;
          background: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          z-index: 10;
        }
        .offers-container-override .swiper-button-next:after,
        .offers-container-override .swiper-button-prev:after {
          font-size: 18px !important;
          font-weight: bold;
        }
        .offers-container-override .swiper-slide {
          transition: transform 0.4s ease, opacity 0.4s ease, box-shadow 0.4s ease;
          transform: scale(1);
          opacity: 0.95;
          z-index: 1;
        }
        .offers-container-override .swiper-slide-active {
          transform: scale(1.15);
          opacity: 1;
          z-index: 2;
        }
        .offers-container-override .swiper-slide-active .offer-card {
           box-shadow: 0 15px 35px rgba(0,0,0,0.25);
        }
      `}</style>
    </section>
  );
};

export const ShopByCategory = () => {
  return (
    <section className="section-wrapper our_brands">
      <div className="container text-center">
        <h2 className="main-title mb-5">Shop by Category</h2>
        <div className="d-flex flex-nowrap justify-content-center gap-2 gap-md-4 mb-4">
          {[
            { name: 'Nuts', icon: 'fa-leaf', borderColor: '#d37d6e' },
            { name: 'Berries', icon: 'fa-lemon', borderColor: '#e46682' },
            { name: 'Dried Fruits', icon: 'fa-apple-whole', borderColor: '#e8b948' },
            { name: 'Seeds', icon: 'fa-seedling', borderColor: '#7eb672' },
            { name: 'Mixes', icon: 'fa-bowl-food', borderColor: '#6691c2' },
          ].map((cat, idx) => (
            <Link href={`/shop?category=${cat.name}`} key={idx} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flex: '1 1 0', justifyContent: 'center' }}>
              <div className="category-squircle" style={{ borderColor: cat.borderColor, '--cat-color': cat.borderColor }}>
                <div className="category-icon-circle">
                  <i className={`fa-solid ${cat.icon}`}></i>
                </div>
                <h5 className="category-name-text">{cat.name}</h5>
              </div>
            </Link>
          ))}
        </div>

        <style jsx>{`
          .category-squircle {
            width: 170px;
            height: 170px;
            background-color: #fff;
            border-radius: 40px;
            border: 1px solid;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .category-squircle:hover {
            transform: translateY(-5px);
            background-color: var(--cat-color);
          }
          .category-squircle:hover .category-icon-circle {
            border-color: #fff;
          }
          .category-squircle:hover .category-icon-circle i {
            color: #fff;
          }
          .category-squircle:hover .category-name-text {
            color: #fff;
          }
          .category-icon-circle {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            border: 1px solid #333;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            transition: all 0.3s ease;
          }
          .category-icon-circle i {
            font-size: 28px;
            color: #111;
            transition: all 0.3s ease;
          }
          .category-name-text {
            font-size: 16px;
            font-weight: 800;
            color: #111;
            margin: 0;
            transition: all 0.3s ease;
          }
          @media (max-width: 768px) {
            .category-squircle {
              width: 100%;
              max-width: 70px;
              height: 70px;
              border-radius: 20px;
            }
            .category-icon-circle {
              width: 32px;
              height: 32px;
              margin-bottom: 4px;
            }
            .category-icon-circle i {
              font-size: 14px;
            }
            .category-name-text {
              font-size: 9px;
            }
          }
        `}</style>

        <div className="trust-bar-outer py-4 px-3 mt-5">
          <div className="row m-0 text-center text-white">
            <div className="col-lg-3 col-6 trust-item">
              <Image src="/shipping_icon1.gif" alt="Shipping" width={45} height={45} className="mb-3" style={{ maxHeight: '45px', width: 'auto' }} unoptimized />
              <div className="trust-text">Free Shipping On<br />Orders Above ₹1499</div>
            </div>
            <div className="col-lg-3 col-6 trust-item">
              <Image src="/shipping_icon2.gif" alt="Payment" width={45} height={45} className="mb-3" style={{ maxHeight: '45px', width: 'auto' }} unoptimized />
              <div className="trust-text">Pay<br />On Delivery</div>
            </div>
            <div className="col-lg-3 col-6 trust-item">
              <Image src="/shipping_icon3.gif" alt="Quality" width={45} height={45} className="mb-3" style={{ maxHeight: '45px', width: 'auto' }} unoptimized />
              <div className="trust-text">100% Quality<br />Guaranteed</div>
            </div>
            <div className="col-lg-3 col-6 trust-item border-lg-0">
              <Image src="/shipping_icon4.gif" alt="Rewards" width={45} height={45} className="mb-3" style={{ maxHeight: '45px', width: 'auto' }} unoptimized />
              <div className="trust-text">Reward Points<br />On Every Purchase</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const RecentBlogs = () => {
  return (
    <section className="recent-blogs-section pb-5 pt-3 bg-white relative-nav">
      <div className="container text-center">
        <h2 className="main-title mb-5">Our Recent Blogs</h2>
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          navigation={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
          }}
          className="blog-slider mx-auto"
        >
          {/* Blog 1 */}
          <SwiperSlide>
            <div className="blog-card text-start">
              <Image src="/blog_image1.png" className="blog-img" alt="Blog 1" width={400} height={250} style={{ width: '100%', height: 'auto' }} />
              <div className="blog-content-box">
                <div className="d-flex justify-content-between align-items-center mb-0">
                  <div className="d-flex align-items-center">
                    <div className="logo-circle-mini">
                      <Image src="/logo.png" alt="Sweettree Logo" width={30} height={30} style={{ width: '100%', height: 'auto' }} />
                    </div>
                    <div className="text-start ms-2">
                      <h6 className="mb-0 fw-bold" style={{ fontSize: '11px' }}>Admin</h6>
                      <span style={{ fontSize: '10px', color: '#888' }}>Apr 03, 2026</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="text-end me-2">
                      <h6 className="mb-0 fw-bold" style={{ fontSize: '11px' }}>Sweettree</h6>
                      <span style={{ fontSize: '10px', color: '#888' }}><i className="fas fa-file-alt" style={{ fontSize: '8px' }}></i> Sweettree Blog</span>
                    </div>
                    <i className="fas fa-share" style={{ color: '#666', fontSize: '13px', cursor: 'pointer' }}></i>
                  </div>
                </div>
                <hr className="blog-hr" />
                <h4 className="blog-heading">What Makes Sweettree Dry Fruits a Preferred Choice for Quality-Conscious Buyers?</h4>
                <p className="blog-excerpt">In today's food industry, quality is no longer optional, it is expected. Consumers and businesses are becoming more aware of what they eat and use in their..</p>
                <Link href="/blog" className="blog-read-more">Read More...</Link>
              </div>
            </div>
          </SwiperSlide>

          {/* Blog 2 */}
          <SwiperSlide>
            <div className="blog-card text-start">
              <Image src="/blog_image2.png" className="blog-img" alt="Blog 2" width={400} height={250} style={{ width: '100%', height: 'auto' }} />
              <div className="blog-content-box">
                <div className="d-flex justify-content-between align-items-center mb-0">
                  <div className="d-flex align-items-center">
                    <div className="logo-circle-mini">
                      <Image src="/logo.png" alt="Sweettree Logo" width={30} height={30} style={{ width: '100%', height: 'auto' }} />
                    </div>
                    <div className="text-start ms-2">
                      <h6 className="mb-0 fw-bold" style={{ fontSize: '11px' }}>Admin</h6>
                      <span style={{ fontSize: '10px', color: '#888' }}>Apr 03, 2026</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="text-end me-2">
                      <h6 className="mb-0" style={{ fontSize: '10px', color: '#888' }}>Healthy Living <i className="fas fa-file-alt" style={{ fontSize: '8px' }}></i></h6>
                    </div>
                    <i className="fas fa-share" style={{ color: '#666', fontSize: '13px', cursor: 'pointer' }}></i>
                  </div>
                </div>
                <hr className="blog-hr" />
                <h4 className="blog-heading">Which Snacks Provide Energy Without Causing Heaviness or Sluggishness?</h4>
                <p className="blog-excerpt">Choosing the right snack can make a big difference in how you feel throughout the day. While many snacks give quick satisfaction, they often leave you feeling..</p>
                <Link href="/blog" className="blog-read-more">Read More...</Link>
              </div>
            </div>
          </SwiperSlide>

          {/* Blog 3 */}
          <SwiperSlide>
            <div className="blog-card text-start">
              <Image src="/blog_image3.png" className="blog-img" alt="Blog 3" width={400} height={250} style={{ width: '100%', height: 'auto' }} />
              <div className="blog-content-box">
                <div className="d-flex justify-content-between align-items-center mb-0">
                  <div className="d-flex align-items-center">
                    <div className="logo-circle-mini">
                      <Image src="/logo.png" alt="Sweettree Logo" width={30} height={30} style={{ width: '100%', height: 'auto' }} />
                    </div>
                    <div className="text-start ms-2">
                      <h6 className="mb-0 fw-bold" style={{ fontSize: '11px' }}>Admin</h6>
                      <span style={{ fontSize: '10px', color: '#888' }}>Apr 01, 2026</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="text-end me-2">
                      <h6 className="mb-0 fw-bold" style={{ fontSize: '11px' }}>Institutional <i className="fas fa-file-alt" style={{ fontSize: '8px' }}></i></h6>
                      <span style={{ fontSize: '10px', color: '#888' }}>Sweettree Blog <i className="fas fa-file-alt" style={{ fontSize: '8px' }}></i></span>
                    </div>
                    <i className="fas fa-share" style={{ color: '#666', fontSize: '13px', cursor: 'pointer' }}></i>
                  </div>
                </div>
                <hr className="blog-hr" />
                <h4 className="blog-heading">How Sweettree Is Helping QSR Chains and Food Manufacturers Streamline Bulk Dry...</h4>
                <p className="blog-excerpt">For quick service restaurants (QSRs) and food manufacturers, ingredient sourcing plays a critical role in maintaining consistency, quality and operations...</p>
                <Link href="/blog" className="blog-read-more">Read More...</Link>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
};

export const Faqs = () => {
  return (
    <section className="faq-section bg-white pt-3 pb-5">
      <div className="container" style={{ maxWidth: '900px' }}>
        <h2 className="main-title mb-5" style={{ fontWeight: 800, fontSize: '38px' }}>FAQs</h2>
        <div className="accordion custom-accordion" id="faqAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                1. How many dry fruits to eat in a day?
              </button>
            </h2>
            <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                A handful of dry fruits, roughly 30 grams (or about 10-15 mixed nuts and dried fruits), is a healthy daily amount for most individuals.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTwo">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                2. Which dry fruit is best for weight loss?
              </button>
            </h2>
            <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Almonds, walnuts, and pistachios are excellent for weight loss due to their high fiber and protein content which keeps you full longer.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingThree">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                3. Which dry fruit is good for skin?
              </button>
            </h2>
            <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Almonds and walnuts are rich in Vitamin E and omega-3 fatty acids, making them highly beneficial for maintaining glowing, healthy skin.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingFour">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                4. Which dry fruit is good for hair?
              </button>
            </h2>
            <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Dates, raisins, and walnuts are packed with iron, biotin, and proteins which significantly promote hair growth and strength.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingFive">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                5. Which all dry fruits are good for weight gain?
              </button>
            </h2>
            <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Dates, prunes, dried figs, and raisins are calorie-dense and excellent choices for healthy and sustained weight gain.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingSix">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
                6. Can we eat dry fruits at night?
              </button>
            </h2>
            <div id="collapseSix" className="accordion-collapse collapse" aria-labelledby="headingSix" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Yes, having a small portion of almonds or walnuts before bed can actually improve sleep quality due to their melatonin content.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingSeven">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSeven" aria-expanded="false" aria-controls="collapseSeven">
                7. Which dry fruit is best for brain?
              </button>
            </h2>
            <div id="collapseSeven" className="accordion-collapse collapse" aria-labelledby="headingSeven" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Walnuts are widely considered the best dry fruit for brain health as they are exceptionally rich in DHA, a type of Omega-3 fatty acid.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const TagsSection = () => {
  return (
    <section className="tags-section bg-white py-5">
      <div className="container py-3">
        <h3 className="mb-4 text-start" style={{ fontSize: '24px', color: '#333' }}>People Are Also Looking For</h3>
        <div className="d-flex flex-wrap gap-2">
          <Link href="/shop?keyword=Cashew Royale" className="search-tag-pill">Cashew Royale</Link>
          <Link href="/shop?keyword=Cashew Premium" className="search-tag-pill">Cashew Premium</Link>
          <Link href="/shop?keyword=Almond American" className="search-tag-pill">Almond American</Link>
          <Link href="/shop?keyword=Mamra" className="search-tag-pill">Mamra</Link>
          <Link href="/shop?keyword=Kishmish Royale" className="search-tag-pill">Kishmish Royale</Link>
          <Link href="/shop?keyword=Kishmish Premium" className="search-tag-pill">Kishmish Premium</Link>
          <Link href="/shop?keyword=Walnut Royale" className="search-tag-pill">Walnut Royale</Link>
          <Link href="/shop?keyword=Anjeer" className="search-tag-pill">Anjeer</Link>
          <Link href="/shop?keyword=Pista" className="search-tag-pill">Pista</Link>
          <Link href="/shop?keyword=Dates Royale" className="search-tag-pill">Dates Royale</Link>

          <Link href="/shop?keyword=Kishmish Black" className="search-tag-pill">Kishmish Black</Link>
          <Link href="/shop?keyword=Mate Coffee Creamer" className="search-tag-pill">Mate Coffee Creamer</Link>
          <Link href="/shop?keyword=Shahi Rose Trail Mix" className="search-tag-pill">Shahi Rose Trail Mix</Link>
          <Link href="/shop?keyword=Crazy Crunchy Corn" className="search-tag-pill">Crazy Crunchy Corn</Link>
          <Link href="/shop?keyword=Museli Dry Fruits Medley" className="search-tag-pill">Museli Dry Fruits Medley</Link>
          <Link href="/shop?keyword=Fruity Orchard Mix" className="search-tag-pill">Fruity Orchard Mix</Link>
          <Link href="/shop?keyword=BBQ Millets Trail Mix" className="search-tag-pill">BBQ Millets Trail Mix</Link>

          <Link href="/shop?keyword=Museli Fruit & Nut" className="search-tag-pill">Museli Fruit & Nut</Link>
          <Link href="/shop?keyword=Cashew Green Chilli" className="search-tag-pill">Cashew Green Chilli</Link>
          <Link href="/shop?keyword=Cashew Salted" className="search-tag-pill">Cashew Salted</Link>
          <Link href="/shop?keyword=Almond Salted" className="search-tag-pill">Almond Salted</Link>
          <Link href="/shop?keyword=Almond Peri Peri" className="search-tag-pill">Almond Peri Peri</Link>
          <Link href="/shop?keyword=Cashew Cheese" className="search-tag-pill">Cashew Cheese</Link>
        </div>
      </div>
    </section>
  );
};

export const StoreLocator = () => {
  return (
    <section className="store-section bg-white">
      <div className="container position-relative">
        <div className="row">
          <div className="col-lg-5 mt-lg-4">
            <Image src="/banner_slider_image3.jpeg" alt="Sweettree Store Locations" width={600} height={600} className="img-fluid store-img mb-4 mb-lg-0" style={{ width: '100%', height: 'auto' }} />
          </div>
          <div className="col-lg-6 d-flex flex-column py-lg-5">
            <div className="store-text-box ps-lg-5 mt-lg-4">
              <h2 className="store-title mb-4">Hey, We Aren't That Far!</h2>
              <p className="store-desc mb-4">Our journey has led us to broaden our network. Now, you can easily spot us at your nearest location and get your healthy eating plans sorted!</p>
              <h4 className="fw-bold mb-3 text-dark">Find us Here</h4>
              <div className="mb-5 mb-lg-0 pb-lg-5">
                <button className="Sweettree-btn-maroon">All Location <i className="fas fa-chevron-down ms-2"></i></button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Box Overlapping */}
        <div className="stats-box">
          <div className="row text-center align-items-center h-100 w-100 m-0">
            <div className="col-4 border-end py-1">
              <h3 className="stats-number"><span className="counter" data-target="11">11</span>+</h3>
              <p className="stats-label">Stores</p>
            </div>
            <div className="col-4 border-end py-1">
              <h3 className="stats-number"><span className="counter" data-target="51750">51750</span>+</h3>
              <p className="stats-label">Happy Customers</p>
            </div>
            <div className="col-4 py-1">
              <h3 className="stats-number"><span className="counter" data-target="57500">57500</span>+</h3>
              <p className="stats-label">Order Delivered</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const HealthyCombo = () => {
  const [playVideo, setPlayVideo] = React.useState({});

  return (
    <section className="combo-section position-relative py-4 mt-4">
      <div className="combo-bg-shape"></div>
      <div className="container position-relative z-1">
        <div className="row align-items-center mb-5">
          <div className="col-lg-8 pe-lg-4">
            <div style={{ maxWidth: '750px' }}>
              <h2 className="combo-title mb-3">Healthy Family Dry Fruits Combo</h2>
              <p className="combo-desc mb-0">Get more nutrition at great value with our Healthy Family Dry Fruits Combo. A cost-effective way to stock up on daily essentials while ensuring quality, taste, and health benefits for the entire family.</p>
            </div>
          </div>
        </div>

        <div className="combo-slider-wrapper">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={20}
            navigation={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
            }}
            className="combo-slider"
          >
            <SwiperSlide>
              <div className="social-card">
                <div className="social-media-box">
                  <span className="social-badge-top">VALUE OFFER</span>
                  {!playVideo[0] ? (
                    <>
                      <img 
                        src="https://img.youtube.com/vi/VLysJeyNBIk/hqdefault.jpg" 
                        alt="YouTube reel thumbnail" 
                        onClick={() => setPlayVideo(prev => ({ ...prev, 0: true }))}
                        style={{ cursor: 'pointer' }}
                      />
                      <div 
                        className="youtube-play-btn-overlay" 
                        onClick={() => setPlayVideo(prev => ({ ...prev, 0: true }))}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '60px',
                          height: '60px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '24px',
                          cursor: 'pointer',
                          zIndex: 10,
                          pointerEvents: 'auto'
                        }}
                      >
                        <i className="fas fa-play" style={{ marginLeft: '4px' }}></i>
                      </div>
                    </>
                  ) : (
                    <iframe 
                      src="https://www.youtube-nocookie.com/embed/VLysJeyNBIk?controls=0&rel=0&autoplay=1&mute=1&loop=1&playlist=VLysJeyNBIk" 
                      title="YouTube reel" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                    ></iframe>
                  )}
                  <div className="social-rating-float"><i className="fas fa-star"></i> 5.0</div>
                  <div className="social-actions-float">
                    <div className="social-action-btn"><i className="far fa-heart"></i></div>
                    <div className="social-action-btn"><i className="fas fa-share-alt"></i></div>
                  </div>
                </div>
                <div className="social-content">
                  <div className="social-header-info">
                    <Image src="/logo.png" className="social-shop-logo" alt="Logo" width={40} height={40} />
                    <div className="social-product-info">
                      <h3 className="social-title">Sweettree Seeds 800g Combo - Pack of 4 (Pumpkin Seeds 200g, Chia Seed..</h3>
                      <div className="social-price-box">
                        <span className="social-actual-price">₹325</span>
                        <span className="social-mrp-strike">₹926</span>
                      </div>
                    </div>
                    <div className="social-arrow"><i className="fas fa-arrow-right"></i></div>
                  </div>
                  <button className="Sweettree-btn-cart">BUY NOW</button>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="social-card">
                <div className="social-media-box">
                  <span className="social-badge-top">BESTSELLER</span>
                  {!playVideo[1] ? (
                    <>
                      <img 
                        src="https://img.youtube.com/vi/VLysJeyNBIk/hqdefault.jpg" 
                        alt="YouTube reel thumbnail" 
                        onClick={() => setPlayVideo(prev => ({ ...prev, 1: true }))}
                        style={{ cursor: 'pointer' }}
                      />
                      <div 
                        className="youtube-play-btn-overlay" 
                        onClick={() => setPlayVideo(prev => ({ ...prev, 1: true }))}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '60px',
                          height: '60px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '24px',
                          cursor: 'pointer',
                          zIndex: 10,
                          pointerEvents: 'auto'
                        }}
                      >
                        <i className="fas fa-play" style={{ marginLeft: '4px' }}></i>
                      </div>
                    </>
                  ) : (
                    <iframe 
                      src="https://www.youtube-nocookie.com/embed/VLysJeyNBIk?controls=0&rel=0&autoplay=1&mute=1&loop=1&playlist=VLysJeyNBIk" 
                      title="YouTube reel" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                    ></iframe>
                  )}
                  <div className="social-rating-float"><i className="fas fa-star"></i> 4.9</div>
                  <div className="social-actions-float">
                    <div className="social-action-btn"><i className="far fa-heart"></i></div>
                    <div className="social-action-btn"><i className="fas fa-share-alt"></i></div>
                  </div>
                </div>
                <div className="social-content">
                  <div className="social-header-info">
                    <Image src="/logo.png" className="social-shop-logo" alt="Logo" width={40} height={40} />
                    <div className="social-product-info">
                      <h3 className="social-title">Sweettree Sunflower Seeds & Pumpkin Seeds Combo 400g - (200g Each)</h3>
                      <div className="social-price-box">
                        <span className="social-actual-price">₹394</span>
                        <span className="social-mrp-strike">₹428</span>
                      </div>
                    </div>
                    <div className="social-arrow"><i className="fas fa-arrow-right"></i></div>
                  </div>
                  <button className="Sweettree-btn-cart">BUY NOW</button>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="social-card">
                <div className="social-media-box">
                  <span className="social-badge-top">PREMIUM PACK</span>
                  {!playVideo[2] ? (
                    <>
                      <img 
                        src="https://img.youtube.com/vi/VLysJeyNBIk/hqdefault.jpg" 
                        alt="YouTube reel thumbnail" 
                        onClick={() => setPlayVideo(prev => ({ ...prev, 2: true }))}
                        style={{ cursor: 'pointer' }}
                      />
                      <div 
                        className="youtube-play-btn-overlay" 
                        onClick={() => setPlayVideo(prev => ({ ...prev, 2: true }))}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '60px',
                          height: '60px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '24px',
                          cursor: 'pointer',
                          zIndex: 10,
                          pointerEvents: 'auto'
                        }}
                      >
                        <i className="fas fa-play" style={{ marginLeft: '4px' }}></i>
                      </div>
                    </>
                  ) : (
                    <iframe 
                      src="https://www.youtube-nocookie.com/embed/VLysJeyNBIk?controls=0&rel=0&autoplay=1&mute=1&loop=1&playlist=VLysJeyNBIk" 
                      title="YouTube reel" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                    ></iframe>
                  )}
                  <div className="social-rating-float"><i className="fas fa-star"></i> 4.7</div>
                  <div className="social-actions-float">
                    <div className="social-action-btn"><i className="far fa-heart"></i></div>
                    <div className="social-action-btn"><i className="fas fa-share-alt"></i></div>
                  </div>
                </div>
                <div className="social-content">
                  <div className="social-header-info">
                    <Image src="/logo.png" className="social-shop-logo" alt="Logo" width={40} height={40} />
                    <div className="social-product-info">
                      <h3 className="social-title">Sweettree Daily Needs Dry Fruits Pack 1kg (Almonds, Cashews..</h3>
                      <div className="social-price-box">
                        <span className="social-actual-price">₹1,656</span>
                        <span className="social-mrp-strike">₹1,999</span>
                      </div>
                    </div>
                    <div className="social-arrow"><i className="fas fa-arrow-right"></i></div>
                  </div>
                  <button className="Sweettree-btn-cart">BUY NOW</button>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="social-card">
                <div className="social-media-box">
                  <span className="social-badge-top">VALUE OFFER</span>
                  {!playVideo[3] ? (
                    <>
                      <img 
                        src="https://img.youtube.com/vi/VLysJeyNBIk/hqdefault.jpg" 
                        alt="YouTube reel thumbnail" 
                        onClick={() => setPlayVideo(prev => ({ ...prev, 3: true }))}
                        style={{ cursor: 'pointer' }}
                      />
                      <div 
                        className="youtube-play-btn-overlay" 
                        onClick={() => setPlayVideo(prev => ({ ...prev, 3: true }))}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '60px',
                          height: '60px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '24px',
                          cursor: 'pointer',
                          zIndex: 10,
                          pointerEvents: 'auto'
                        }}
                      >
                        <i className="fas fa-play" style={{ marginLeft: '4px' }}></i>
                      </div>
                    </>
                  ) : (
                    <iframe 
                      src="https://www.youtube-nocookie.com/embed/VLysJeyNBIk?controls=0&rel=0&autoplay=1&mute=1&loop=1&playlist=VLysJeyNBIk" 
                      title="YouTube reel" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                    ></iframe>
                  )}
                  <div className="social-rating-float"><i className="fas fa-star"></i> 5.0</div>
                  <div className="social-actions-float">
                    <div className="social-action-btn"><i className="far fa-heart"></i></div>
                    <div className="social-action-btn"><i className="fas fa-share-alt"></i></div>
                  </div>
                </div>
                <div className="social-content">
                  <div className="social-header-info">
                    <Image src="/logo.png" className="social-shop-logo" alt="Logo" width={40} height={40} />
                    <div className="social-product-info">
                      <h3 className="social-title">Sweettree Seeds 1kg Combo Pack - Chia Seeds, Sunflower Seeds..</h3>
                      <div className="social-price-box">
                        <span className="social-actual-price">₹364</span>
                        <span className="social-mrp-strike">₹1,125</span>
                      </div>
                    </div>
                    <div className="social-arrow"><i className="fas fa-arrow-right"></i></div>
                  </div>
                  <button className="Sweettree-btn-cart">BUY NOW</button>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </section>
  );
};
