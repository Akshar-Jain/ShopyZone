import React, { useState, useContext } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, ShieldCheck } from 'lucide-react';
import { ToastContext } from '../context/ToastContext.jsx';

const Contact = () => {
  const { toast } = useContext(ToastContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      toast.success('Your message has been sent successfully! Our team will contact you shortly.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 animate-fade-in">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-theme-primary tracking-tight font-orbitron uppercase bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="mt-3 text-sm text-theme-secondary max-w-xl mx-auto">
          Have questions about orders, shipping, or returns? Drop us a message and we will get back to you within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
        {/* Contact info card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-theme-card border border-theme rounded-3xl p-8 shadow-theme space-y-6 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h2 className="text-lg font-bold font-orbitron uppercase text-theme-primary tracking-wider my-0">
                Support Details
              </h2>
              <p className="text-xs text-theme-secondary leading-relaxed">
                Connect with our premium customer experience center. We are dedicated to providing support round the clock.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/25 rounded-2xl text-cyan-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Email Address</h4>
                    <p className="text-xs font-semibold text-theme-primary mt-0.5">support@shopyzone.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-indigo-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Phone Support</h4>
                    <p className="text-xs font-semibold text-theme-primary mt-0.5">+1 (555) 019-2834</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded-2xl text-violet-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Futuristic HQ</h4>
                    <p className="text-xs font-semibold text-theme-primary mt-0.5">
                      100 Cyber Avenue, Tech City, TC 10101
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality badge */}
            <div className="pt-6 border-t border-theme/20 flex items-center gap-3.5 text-xs text-theme-secondary font-medium">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Certified SSL Encryption. Secure server connectivity.</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <div className="bg-theme-card border border-theme rounded-3xl p-8 shadow-theme">
            <h2 className="text-lg font-bold font-orbitron uppercase text-theme-primary tracking-wider mb-6 mt-0">
              Send Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider block">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all text-theme-primary font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all text-theme-primary font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider block">Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What is this regarding?"
                  className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all text-theme-primary font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider block">Message</label>
                <textarea
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all text-theme-primary font-medium resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold font-orbitron uppercase tracking-widest bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all duration-200 shadow-md shadow-cyan-500/15 disabled:bg-slate-500 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
