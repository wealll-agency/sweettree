import React from 'react';

const TopBar = () => {
  return (
    <div className="top-bar d-none d-lg-block">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-12 text-end social-icons py-2">
            <span className="me-3 fw-bold text-white">Follow Us</span>
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-whatsapp"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
            <a href="#"><i className="fas fa-envelope"></i></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
