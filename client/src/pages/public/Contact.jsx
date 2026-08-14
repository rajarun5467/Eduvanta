import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout.jsx';
import API from '../../services/api.js';
import '../../contact.css';

const subjectOptions = [
  { value: 'admission', label: 'Admission Query' },
  { value: 'course', label: 'Course Information' },
  { value: 'placement', label: 'Placement Query' },
  { value: 'general', label: 'General Inquiry' },
];

const courseMap = { admission: 'B.Tech CSE', course: 'BCA', placement: 'MBA', general: 'B.Sc' };

export default function Contact() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setMsgType('');
    try {
      const course = courseMap[form.subject] || 'B.Tech CSE';
      await API.post('/applications', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        course,
        message: form.message,
        status: 'New',
      });
      setMsg('Your message has been sent! Our team will get back to you within 24 hours.');
      setMsgType('success');
      setForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error submitting form. Please try again.');
      setMsgType('error');
    }
  };

  return (
    <PublicLayout>
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Have questions? We're here to help. Reach out to us through any of the channels below.</p>
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>Contact</span>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Get In Touch</h2>
            <p>We'd love to hear from you</p>
            <div className="divider"></div>
          </div>
          <div className="contact-grid">
            <div className="contact-info-card reveal fade-left">
              <h3>Contact Information</h3>
              <p>Reach out to us through any of these channels. Our team is always ready to assist you.</p>
              <div className="ci-item">
                <div className="ci-icon"><i className="fa-solid fa-location-dot"></i></div>
                <div>
                  <h4>Address</h4>
                  <p>123, EduNex Campus, Knowledge City, India - 500001</p>
                </div>
              </div>
              <div className="ci-item">
                <div className="ci-icon"><i className="fa-solid fa-phone"></i></div>
                <div>
                  <h4>Phone</h4>
                  <p>+91 98765 43210<br />+91 98765 43211</p>
                </div>
              </div>
              <div className="ci-item">
                <div className="ci-icon"><i className="fa-solid fa-envelope"></i></div>
                <div>
                  <h4>Email</h4>
                  <p>info@edunex.edu.in<br />admissions@edunex.edu.in</p>
                </div>
              </div>
              <div className="ci-item">
                <div className="ci-icon"><i className="fa-solid fa-clock"></i></div>
                <div>
                  <h4>Office Hours</h4>
                  <p>Mon - Fri: 9:00 AM - 5:00 PM<br />Sat: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
              <div className="ci-social">
                <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#"><i className="fa-brands fa-twitter"></i></a>
                <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
                <a href="#"><i className="fa-brands fa-instagram"></i></a>
                <a href="#"><i className="fa-brands fa-youtube"></i></a>
              </div>
            </div>
            <div className="contact-form-wrapper reveal fade-right" id="contact-form">
              <h3>Send Us a Message</h3>
              <p>Fill out the form and we'll get back to you within 24 hours.</p>
              {msg && (
                <div style={{ padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500, background: msgType === 'success' ? '#dcfce7' : '#fee2e2', color: msgType === 'success' ? '#15803d' : '#dc2626' }}>
                  <i className={`fa-solid fa-${msgType === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i> {msg}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="firstName" placeholder="Enter first name" required value={form.firstName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" name="lastName" placeholder="Enter last name" required value={form.lastName} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="Enter email" required value={form.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" placeholder="Enter phone number" required value={form.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select name="subject" required value={form.subject} onChange={handleChange}>
                    <option value="">-- Select subject --</option>
                    {subjectOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea name="message" placeholder="Type your message here..." required value={form.message} onChange={handleChange}></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-submit shadow">Send Message <i className="fa-solid fa-paper-plane"></i></button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="map-section">
        <div className="container">
          <div className="map-wrapper reveal fade-up">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.292364832!2d78.4867!3d17.3850!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIzJzA2LjAiTiA3OcKwMjknMTIuMSJF!5e0!3m2!1sen!2sin!4v1700000000000"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="EduNex College Location"
            ></iframe>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
