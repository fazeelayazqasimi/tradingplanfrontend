import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import websiteService from '../../services/websiteService';
import api from '../../services/api';
import { useName } from '../../context/NameContext';

const defaultContact = {
  email: 'support@dreamtrader.edu',
  phone: '+92 300 1234567',
  address: 'Clifton Block 5, Karachi, Pakistan',
};

export default function Contact() {
  const { visitorName } = useName();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(defaultContact);

  useEffect(() => {
    websiteService.getContent('contact')
      .then(({ data }) => {
        const content = data.data;
        if (content) {
          setContact(prev => ({
            email: content.email || prev.email,
            phone: content.phone || prev.phone,
            address: content.address || prev.address,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="section">
        <div className="max-w-[1240px] mx-auto px-8 grid lg:grid-cols-[1fr_1fr] gap-14">
          <div>
            <p className="eyebrow mb-3.5">Contact</p>
            <h2 className="text-[32px] font-extrabold mb-6 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{visitorName ? `${visitorName}, let's talk about your trading goals.` : "Let's talk about your trading goals."}</h2>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Full Name</label>
                <input type="text" placeholder="Your name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input type="email" placeholder="you@email.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Message</label>
                <textarea rows="4" placeholder="Tell us what you're looking for" required className="min-h-[120px] resize-none" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" disabled={loading} className="btn-blue btn-lg w-full sm:w-auto">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
          <div>
            <div className="rounded-[20px] h-full min-h-[280px] bg-dark-50 border border-dark-100 relative overflow-hidden mb-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(37,99,235,0.04) 12px, rgba(37,99,235,0.04) 24px)' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-[30px] h-[30px] rounded-[50%_50%_50%_0] bg-primary-500 -rotate-45 shadow-card-md" />
            </div>
            <div className="flex gap-3.5 items-start mb-5">
              <div>
                <b className="block text-sm mb-0.5">Email</b>
                <span className="text-[13.5px] text-dark-500 font-inter">{contact.email}</span>
              </div>
            </div>
            <div className="flex gap-3.5 items-start mb-5">
              <div>
                <b className="block text-sm mb-0.5">Phone</b>
                <span className="text-[13.5px] text-dark-500 font-inter">{contact.phone}</span>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div>
                <b className="block text-sm mb-0.5">Office</b>
                <span className="text-[13.5px] text-dark-500 font-inter">{contact.address}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
