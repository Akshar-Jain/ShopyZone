import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { LoadingSpinner } from '../components/ProtectedRoute.jsx';
import { User, MapPin, CreditCard, Trash2, Plus } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);

  const [name, setName] = useState(user?.name || '');
  const [updatingDetails, setUpdatingDetails] = useState(false);

  // Address inputs
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    zip: '',
  });

  // Card inputs
  const [showCardForm, setShowCardForm] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
  });

  if (!user) return <LoadingSpinner />;

  // 1. UPDATE NAME
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setUpdatingDetails(true);
    try {
      await updateProfile({ name });
      toast.success('Profile details updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingDetails(false);
    }
  };

  // 2. ADD ADDRESS
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!newAddress.phone || !newAddress.addressLine || !newAddress.city || !newAddress.state || !newAddress.zip) {
      toast.error('All address fields are required.');
      return;
    }
    try {
      const updatedAddresses = [...user.addresses, newAddress];
      await updateProfile({ addresses: updatedAddresses });
      toast.success('Address added successfully!');
      setNewAddress({ phone: '', addressLine: '', city: '', state: '', zip: '' });
      setShowAddressForm(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 3. DELETE ADDRESS
  const handleDeleteAddress = async (idxToDelete) => {
    try {
      const updatedAddresses = user.addresses.filter((_, idx) => idx !== idxToDelete);
      await updateProfile({ addresses: updatedAddresses });
      toast.success('Address removed.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 4. ADD CARD (UI ONLY)
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    if (!newCard.cardNumber || !newCard.cardHolder || !newCard.expiry) {
      toast.error('All card fields are required.');
      return;
    }

    // Mask card number for demo
    const cleanNum = newCard.cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 15) {
      toast.error('Invalid card number.');
      return;
    }
    const masked = `•••• •••• •••• ${cleanNum.slice(-4)}`;

    try {
      const cardToSave = {
        cardNumber: masked,
        cardHolder: newCard.cardHolder,
        expiry: newCard.expiry,
      };
      const updatedCards = [...user.savedCards, cardToSave];
      await updateProfile({ savedCards: updatedCards });
      toast.success('Payment card added successfully!');
      setNewCard({ cardNumber: '', cardHolder: '', expiry: '' });
      setShowCardForm(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 5. DELETE CARD
  const handleDeleteCard = async (idxToDelete) => {
    try {
      const updatedCards = user.savedCards.filter((_, idx) => idx !== idxToDelete);
      await updateProfile({ savedCards: updatedCards });
      toast.success('Card deleted.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight my-0">
        My Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: General Details */}
        <div className="space-y-6">
          <div className="bg-theme-card border border-theme p-6 rounded-3xl shadow-theme space-y-4">
            <h3 className="font-bold text-theme-primary text-sm my-0 flex items-center gap-2 border-b border-theme pb-2">
              <User className="h-4 w-4 text-indigo-600" />
              General Details
            </h3>

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-theme-primary/50 border border-theme rounded-xl px-4 py-2.5 text-sm text-theme-secondary cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Role</label>
                <input
                  type="text"
                  disabled
                  value={user.role.toUpperCase()}
                  className="w-full bg-theme-primary/50 border border-theme rounded-xl px-4 py-2.5 text-sm text-theme-secondary cursor-not-allowed font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-theme-primary"
                />
              </div>

              <button
                type="submit"
                disabled={updatingDetails}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors disabled:bg-slate-800"
              >
                {updatingDetails ? 'Updating...' : 'Save Profile Name'}
              </button>
            </form>
          </div>
        </div>

        {/* Middle: Address Book Manager */}
        <div className="space-y-6">
          <div className="bg-theme-card border border-theme p-6 rounded-3xl shadow-theme space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-2">
              <h3 className="font-bold text-theme-primary text-sm my-0 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-600" />
                Address Book
              </h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                {showAddressForm ? 'Cancel' : (
                  <>
                    <Plus className="h-3 w-3" /> Add
                  </>
                )}
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} className="space-y-3 p-3 bg-theme-primary border border-theme rounded-2xl animate-fade-in">
                <input
                  type="text"
                  placeholder="Contact Phone"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full bg-theme-card border border-theme rounded-lg p-2 text-xs focus:outline-none text-theme-primary"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  required
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                  className="w-full bg-theme-card border border-theme rounded-lg p-2 text-xs focus:outline-none text-theme-primary"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-theme-card border border-theme rounded-lg p-2 text-xs focus:outline-none text-theme-primary"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full bg-theme-card border border-theme rounded-lg p-2 text-xs focus:outline-none text-theme-primary"
                  />
                </div>
                <input
                  type="text"
                  placeholder="ZIP Code"
                  required
                  value={newAddress.zip}
                  onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                  className="w-full bg-theme-card border border-theme rounded-lg p-2 text-xs focus:outline-none text-theme-primary"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] py-2 rounded-lg border border-theme/30"
                >
                  Save Address
                </button>
              </form>
            )}

            {/* Address List */}
            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3 divide-y divide-theme pr-1 max-h-[300px] overflow-y-auto">
                {user.addresses.map((addr, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 pt-3 first:pt-0 border-theme/20">
                    <div className="text-xs font-semibold text-theme-secondary space-y-1 flex-1">
                      <p className="font-bold text-theme-primary m-0">{addr.addressLine}</p>
                      <p className="m-0 font-medium">{addr.city}, {addr.state} - {addr.zip}</p>
                      <p className="m-0 font-mono text-[10px] text-slate-500">Phone: {addr.phone}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-theme-secondary text-xs text-center py-6">No saved addresses.</p>
            )}
          </div>
        </div>

        {/* Right: Saved Cards Manager */}
        <div className="space-y-6">
          <div className="bg-theme-card border border-theme p-6 rounded-3xl shadow-theme space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-2">
              <h3 className="font-bold text-theme-primary text-sm my-0 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                Saved Cards (UI Only)
              </h3>
              <button
                onClick={() => setShowCardForm(!showCardForm)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                {showCardForm ? 'Cancel' : (
                  <>
                    <Plus className="h-3 w-3" /> Add
                  </>
                )}
              </button>
            </div>

            {showCardForm && (
              <form onSubmit={handleCardSubmit} className="space-y-3 p-3 bg-theme-primary border border-theme rounded-2xl animate-fade-in">
                <input
                  type="text"
                  placeholder="Card Number (16 digits)"
                  required
                  maxLength="19"
                  value={newCard.cardNumber}
                  onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                  className="w-full bg-theme-card border border-theme rounded-lg p-2 text-xs focus:outline-none text-theme-primary"
                />
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  required
                  value={newCard.cardHolder}
                  onChange={(e) => setNewCard({ ...newCard, cardHolder: e.target.value })}
                  className="w-full bg-theme-card border border-theme rounded-lg p-2 text-xs focus:outline-none text-theme-primary"
                />
                <input
                  type="text"
                  placeholder="Expiry Date (MM/YY)"
                  required
                  maxLength="5"
                  value={newCard.expiry}
                  onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  className="w-full bg-theme-card border border-theme rounded-lg p-2 text-xs focus:outline-none text-theme-primary"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] py-2 rounded-lg border border-theme/30"
                >
                  Save Card
                </button>
              </form>
            )}

            {/* Saved Cards List */}
            {user.savedCards && user.savedCards.length > 0 ? (
              <div className="space-y-3 divide-y divide-theme pr-1 max-h-[300px] overflow-y-auto">
                {user.savedCards.map((card, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 pt-3 first:pt-0 border-theme/20">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-indigo-500/10 border border-indigo-500/25 rounded text-[9px] font-bold text-indigo-500 tracking-wider">CARD</span>
                        <span className="text-xs font-bold font-mono text-theme-primary">{card.cardNumber}</span>
                      </div>
                      <p className="text-[10px] text-theme-secondary font-semibold uppercase tracking-wider m-0">
                        {card.cardHolder} | EXP: {card.expiry}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(idx)}
                      className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-theme-secondary text-xs text-center py-6">No saved cards.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
