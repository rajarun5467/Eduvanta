import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout.jsx';
import API from '../../services/api.js';
import '../../admissions.css';

const processSteps = [
  { num: '1', title: 'Fill Application', desc: 'Complete the online application form with your personal and academic details.' },
  { num: '2', title: 'Submit Documents', desc: 'Upload required documents including marksheets, ID proof, and photographs.' },
  { num: '3', title: 'Entrance Test', desc: 'Appear for the EduNex entrance examination or submit valid scores.' },
  { num: '4', title: 'Confirmation', desc: 'Receive your admission confirmation and welcome kit from the college.' },
];

const courseOptions = [
  { value: 'btech', label: 'B.Tech' },
  { value: 'bca', label: 'BCA' },
  { value: 'mba', label: 'MBA' },
  { value: 'mca', label: 'MCA' },
  { value: 'diploma', label: 'Diploma Engineering' },
  { value: 'bsc', label: 'B.Sc' },
];

const infoCards = [
  { icon: 'fa-solid fa-calendar-days', title: 'Important Dates', desc: 'Application Start: 15 Jan 2024\nLast Date to Apply: 30 June 2024\nEntrance Exam: 15 July 2024\nResults: 30 July 2024' },
  { icon: 'fa-solid fa-file-lines', title: 'Required Documents', desc: '10th & 12th Marksheets\nTransfer Certificate\nPassport-size Photos\nAadhaar Card / ID Proof' },
  { icon: 'fa-solid fa-circle-info', title: 'Eligibility Criteria', desc: "Minimum 50% in 10+2 for UG courses\nRelevant Bachelor's degree for PG\n45% for reserved categories\nValid entrance exam score" },
];

export default function Admissions() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', course: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.course) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      await API.post('/applications', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        course: form.course,
        message: form.message,
      });
      setSubmitted(true);
      setForm({ firstName: '', lastName: '', email: '', phone: '', course: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <PublicLayout>
      <section className="page-hero">
        <div className="container">
          <h1>Admissions 2024-25</h1>
          <p>Begin your journey with EduNex College. Applications are now open for all programs.</p>
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>Admissions</span>
          </div>
        </div>
      </section>

      <section className="admissions-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Admission Process</h2>
            <p>Follow these simple steps to secure your admission</p>
            <div className="divider"></div>
          </div>
          <div className="process-grid">
            {processSteps.map((s, i) => (
              <div className="process-card reveal scale-in" data-delay={i + 1} key={s.num}>
                <div className="process-num">{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Apply Online</h2>
            <p>Fill in the form below and our team will contact you</p>
            <div className="divider"></div>
          </div>
          <div className="form-wrapper reveal fade-up">
            {submitted && (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: '1.5rem' }}></i>
                  <div>
                    <strong>Application submitted successfully!</strong><br />
                    <span style={{ fontSize: '0.85rem' }}>We will contact you soon. Check your email for confirmation.</span>
                  </div>
                </div>
                <a
                  href="https://wa.me/916394518942"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
                >
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.1rem' }}></i> Message us on WhatsApp
                </a>
              </div>
            )}
            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '1.5rem' }}></i>
                <div><strong>Error:</strong> {error}</div>
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
                  <label>Email Address</label>
                  <input type="email" name="email" placeholder="Enter email" required value={form.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" placeholder="Enter phone number" required value={form.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Select Course</label>
                <select name="course" required value={form.course} onChange={handleChange}>
                  <option value="">-- Choose a course --</option>
                  {courseOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Message (Optional)</label>
                <textarea name="message" placeholder="Tell us about yourself or any queries..." value={form.message} onChange={handleChange}></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-submit shadow" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
                Submit Application <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            {infoCards.map((c, i) => (
              <div className="info-card reveal fade-up" data-delay={i + 1} key={c.title}>
                <div className="info-icon"><i className={c.icon}></i></div>
                <h4>{c.title}</h4>
                <p style={{ whiteSpace: 'pre-line' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
