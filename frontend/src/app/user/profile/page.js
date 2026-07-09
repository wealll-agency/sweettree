'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addAddress, deleteAddress, updateUserProfile } from '../../../store/authSlice.js';
import { useRouter } from 'next/navigation';
import { User, MapPin, Trash2, Mail, Phone, Plus } from 'lucide-react';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);

  // Profile states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [addressError, setAddressError] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push('/login');
    } else {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user, router]);

  if (!mounted || !user) return null;

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileSuccess('');
    dispatch(updateUserProfile({ name, phone, password: password || undefined }))
      .unwrap()
      .then(() => {
        setProfileSuccess('Profile details updated successfully!');
        setPassword('');
      });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!street || !city || !stateName || !zipCode || !country) {
      setAddressError('Please fill out all address fields');
      return;
    }
    setAddressError('');
    dispatch(addAddress({ street, city, state: stateName, zipCode, country }))
      .unwrap()
      .then(() => {
        setShowAddressForm(false);
        setStreet(''); setCity(''); setStateName(''); setZipCode('');
      });
  };

  const handleAddressDelete = (id) => {
    if (confirm('Are you sure you want to delete this address?')) {
      dispatch(deleteAddress(id));
    }
  };

  return (
    <div className="container py-5 animate-fade-in">
      <h1 className="fw-bold mb-4 display-font">My Account</h1>

      <div className="row g-4">
        
        {/* Detail Editor */}
        <div className="col-lg-5">
          <div className="bg-white p-4 rounded-4 shadow-sm border">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <User size={20} color="var(--primary-color)" /> Profile Details
            </h5>

            <form onSubmit={handleProfileSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="fw-medium mb-1 fs-7">Email Address</label>
                <div className="position-relative">
                  <input
                    type="email"
                    disabled
                    className="form-control form-control-brand ps-5 bg-light"
                    value={user.email}
                  />
                  <Mail className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
                </div>
                <small className="text-muted d-block mt-1 fs-8">Registered Account Email cannot be edited.</small>
              </div>

              <div>
                <label className="fw-medium mb-1 fs-7">Full Name</label>
                <div className="position-relative">
                  <input
                    type="text"
                    required
                    className="form-control form-control-brand ps-5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
                </div>
              </div>

              <div>
                <label className="fw-medium mb-1 fs-7">Phone Number</label>
                <div className="position-relative">
                  <input
                    type="tel"
                    className="form-control form-control-brand ps-5"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
                </div>
              </div>

              <div>
                <label className="fw-medium mb-1 fs-7">Reset Password</label>
                <input
                  type="password"
                  className="form-control form-control-brand"
                  placeholder="Enter new password (optional)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {profileSuccess && <div className="alert alert-success p-2 fs-8 m-0">{profileSuccess}</div>}

              <button type="submit" className="btn btn-brand py-2 mt-2">Update Details</button>
            </form>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="col-lg-7">
          <div className="bg-white p-4 rounded-4 shadow-sm border h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                <MapPin size={20} color="var(--primary-color)" /> Shipping Addresses
              </h5>
              {!showAddressForm && (
                <button 
                  onClick={() => setShowAddressForm(true)} 
                  className="btn btn-brand-outline btn-sm d-flex align-items-center gap-1"
                >
                  <Plus size={16} /> Add Address
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} className="bg-light p-3 rounded mb-4 border">
                <h6 className="fw-bold mb-2">New Address Details</h6>
                
                <div className="mb-2">
                  <input
                    type="text"
                    required
                    className="form-control form-control-brand py-2 fs-7"
                    placeholder="Street Address, Block"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="State"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="Zip Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>

                {addressError && <div className="text-danger fs-8 mb-2">{addressError}</div>}

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-brand btn-sm">Save</button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddressForm(false)} 
                    className="btn btn-brand-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {user.addresses.length === 0 ? (
              <p className="text-muted m-0 fs-7">No saved shipping addresses found. Add one to speed up checkouts.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {user.addresses.map((addr) => (
                  <div key={addr._id} className="p-3 rounded border d-flex justify-content-between align-items-center">
                    <div>
                      <p className="m-0 fw-semibold text-dark fs-6">{user.name}</p>
                      <p className="m-0 text-muted fs-7">{addr.street}, {addr.city}</p>
                      <p className="m-0 text-muted fs-7">{addr.state} - {addr.zipCode}, {addr.country}</p>
                    </div>
                    <button 
                      onClick={() => handleAddressDelete(addr._id)}
                      className="btn btn-sm btn-link text-danger border-0 p-0 hover-red"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
