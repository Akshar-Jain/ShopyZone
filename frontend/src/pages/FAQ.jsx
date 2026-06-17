import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, ShoppingBag, Truck, CreditCard, RefreshCw } from 'lucide-react';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqData = [
    {
      category: 'General & Account',
      icon: <HelpCircle className="h-5 w-5 text-cyan-400" />,
      questions: [
        {
          q: 'What is ShopyZone?',
          a: 'ShopyZone is a next-generation e-commerce storefront offering premium electronics, trendy fashion wear, book titles, and daily home essentials with instant shipping and database-backed synchronization.'
        },
        {
          q: 'How do I register an account?',
          a: 'Click on the Login button in the top right corner. You can register using your email and verifying via OTP code, or instantly sign in using Google Auth.'
        },
        {
          q: 'Is my account secure?',
          a: 'Yes, your account security is our priority. We use secure hashing algorithms for passwords, session-validated JWT token payloads, and protect all backend endpoints from unauthorized access.'
        }
      ]
    },
    {
      category: 'Orders & Shopping',
      icon: <ShoppingBag className="h-5 w-5 text-indigo-400" />,
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Simply browse our catalog, add items to your shopping cart, click the Cart icon to review your selection, and click Checkout. Fill in your shipping details and complete the secure payment steps.'
        },
        {
          q: 'Can I track my order status?',
          a: 'Yes! Navigate to the "My Orders" page under your user menu to see a complete history of your purchases, order totals, and real-time processing statuses.'
        },
        {
          q: 'Do you offer discount coupons?',
          a: 'Yes, we periodically distribute promotional coupons. You can apply valid coupon codes at checkout to get discounts on your orders.'
        }
      ]
    },
    {
      category: 'Shipping & Delivery',
      icon: <Truck className="h-5 w-5 text-emerald-400" />,
      questions: [
        {
          q: 'Where do you ship to?',
          a: 'We currently offer nationwide shipping. All shipping times depend on your region and selected courier option.'
        },
        {
          q: 'How long will it take to get my order?',
          a: 'Standard orders are processed within 1-2 business days. Delivery typically takes 3-5 business days depending on your location.'
        },
        {
          q: 'How much does shipping cost?',
          a: 'Shipping is dynamically calculated at checkout based on the package weight, category, and shipping address.'
        }
      ]
    },
    {
      category: 'Payments & Refunds',
      icon: <CreditCard className="h-5 w-5 text-amber-400" />,
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept major credit and debit cards, secure bank transfers, and digital wallets. All transactions are fully encrypted.'
        },
        {
          q: 'How do I request a refund?',
          a: 'Please reach out to our customer care team via the Contact Support page. Refer to your order history and provide the specific order details.'
        }
      ]
    },
    {
      category: 'Returns & Exchanges',
      icon: <RefreshCw className="h-5 w-5 text-rose-400" />,
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return window on all unused items in their original packaging. Please contact support to initiate a prepaid return label.'
        },
        {
          q: 'How long do exchanges take?',
          a: 'Once your return item is received and inspected at our warehouse, we will ship the replacement size or product within 2 business days.'
        }
      ]
    }
  ];

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Flattened search filter
  let globalIndexCounter = 0;
  const filteredCategories = faqData.map(cat => {
    const matchedQuestions = cat.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...cat,
      questions: matchedQuestions.map(qObj => ({
        ...qObj,
        globalIndex: globalIndexCounter++
      }))
    };
  }).filter(cat => cat.questions.length > 0);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-fade-in">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-theme-primary tracking-tight font-orbitron uppercase bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-sm text-theme-secondary max-w-xl mx-auto">
          Need quick answers? Browse our popular categories below or search using keywords.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-lg mx-auto mb-12 relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
          <Search className="h-5 w-5" />
        </span>
        <input
          type="text"
          placeholder="Search for questions (e.g. shipping, checkout, refunds)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-theme-card border border-theme rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all duration-300 text-theme-primary font-medium"
        />
      </div>

      {/* Accordions */}
      {filteredCategories.length > 0 ? (
        <div className="space-y-8">
          {filteredCategories.map((cat, catIdx) => (
            <div key={catIdx} className="bg-theme-card border border-theme rounded-3xl p-6 shadow-theme transition-all duration-300">
              <div className="flex items-center gap-3 border-b border-theme/20 pb-4 mb-4">
                {cat.icon}
                <h2 className="text-lg font-bold font-orbitron uppercase text-theme-primary tracking-wider my-0">
                  {cat.category}
                </h2>
              </div>
              <div className="space-y-3">
                {cat.questions.map((item) => (
                  <div
                    key={item.globalIndex}
                    className="border border-theme/30 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-200"
                  >
                    <button
                      onClick={() => handleToggle(item.globalIndex)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-xs text-theme-primary hover:text-cyan-400 focus:outline-none bg-theme-primary/30 transition-colors cursor-pointer select-none"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-300 ${
                          expandedIndex === item.globalIndex ? 'rotate-180 text-cyan-400' : ''
                        }`}
                      />
                    </button>
                    {expandedIndex === item.globalIndex && (
                      <div className="px-5 py-4 border-t border-theme/10 bg-theme-card text-xs text-theme-secondary leading-relaxed animate-fade-in font-medium">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-theme-card border border-theme rounded-3xl p-8">
          <HelpCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-theme-primary">No results found</h3>
          <p className="text-xs text-theme-secondary mt-1">
            Try adjusting your keywords or browse the other categories.
          </p>
        </div>
      )}

      {/* Support Card */}
      <div className="mt-12 bg-gradient-to-r from-indigo-950/30 via-slate-900/30 to-violet-950/30 border border-theme/50 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <h3 className="text-lg font-bold text-theme-primary font-orbitron uppercase tracking-wider mb-2">Still need help?</h3>
        <p className="text-xs text-theme-secondary max-w-md mx-auto mb-6">
          Our support representatives are active 24/7 to solve your queries.
        </p>
        <button
          onClick={() => window.location.href = '/contact'}
          className="px-6 py-2.5 rounded-xl text-xs font-bold font-orbitron uppercase tracking-widest bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all duration-200 shadow-md shadow-cyan-500/15"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default FAQ;
