import React from 'react';
import { Facebook, Instagram, MessageCircle, Youtube, Mail } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="top-bar d-none d-lg-block">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-12 text-end social-icons py-2 d-flex align-items-center justify-content-end gap-3">
            <span className="fw-bold text-white mb-0">Follow Us</span>
            <a href="#" className="text-white"><Facebook size={16} /></a>
            <a href="#" className="text-white"><Instagram size={16} /></a>
            <a href="#" className="text-white"><MessageCircle size={16} /></a>
            <a href="#" className="text-white"><Youtube size={16} /></a>
            <a href="#" className="text-white"><Mail size={16} /></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
