import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout.jsx';
import '../../courses.css';

const courseData = [
  { slug: 'btech', name: 'B.Tech', video: '/video/b-tech.mp4', years: '4 Years', specs: '10 Specializations', desc: 'Comprehensive engineering program with specializations in CSE, ECE, ME, CE, EE and more.', price: '₹ 2.5L/yr', cat: 'ug' },
  { slug: 'bca', name: 'BCA', video: '/video/bca.mp4', years: '3 Years', specs: '4 Specializations', desc: "Bachelor's in Computer Applications focusing on programming, software development, and IT.", price: '₹ 1.2L/yr', cat: 'ug' },
  { slug: 'mba', name: 'MBA', video: '/video/mba.mp4', years: '2 Years', specs: '6 Specializations', desc: 'Master of Business Administration with Finance, Marketing, HR, Operations, and more.', price: '₹ 3.5L/yr', cat: 'pg' },
  { slug: 'mca', name: 'MCA', video: '/video/mca.mp4', years: '2 Years', specs: '4 Specializations', desc: "Master's in Computer Applications for advanced software engineering and system design.", price: '₹ 1.8L/yr', cat: 'pg' },
  { slug: 'diploma', name: 'Diploma Engineering', video: '/video/deploma.mp4', years: '3 Years', specs: '4 Specializations', desc: 'Practical engineering diploma with hands-on training in various technical fields.', price: '₹ 80K/yr', cat: 'diploma' },
  { slug: 'bsc', name: 'B.Sc', video: '/video/bsc.mp4', years: '3 Years', specs: '5 Specializations', desc: 'Bachelor of Science with Physics, Chemistry, Mathematics, Biotech, and more.', price: '₹ 90K/yr', cat: 'ug' },
];

const filters = [
  { key: 'all', label: 'All Courses' },
  { key: 'ug', label: 'Undergraduate' },
  { key: 'pg', label: 'Postgraduate' },
  { key: 'diploma', label: 'Diploma' },
];

export default function Courses() {
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  });

  const filtered = activeFilter === 'all' ? courseData : courseData.filter((c) => c.cat === activeFilter);

  return (
    <PublicLayout>
      <section className="page-hero">
        <div className="container">
          <h1>Our Courses</h1>
          <p>Explore our wide range of industry-aligned courses designed to shape your future.</p>
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>Courses</span>
          </div>
        </div>
      </section>

      <section className="courses-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Popular Courses</h2>
            <p>Choose from our diverse range of academic programs</p>
            <div className="divider"></div>
          </div>
          <div className="courses-filter reveal fade-up">
            {filters.map((f) => (
              <div
                key={f.key}
                className={`filter-btn ${activeFilter === f.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label}
              </div>
            ))}
          </div>
          <div className="courses-grid">
            {filtered.map((c, i) => (
              <div className="course-card reveal fade-up" data-delay={(i % 3) + 1} key={c.slug}>
                <video autoPlay muted loop playsinline>
                  <source src={c.video} type="video/mp4" />
                </video>
                <div className="c-body">
                  <h3>{c.name}</h3>
                  <div className="c-meta">
                    <span><i className="fa-regular fa-clock"></i> {c.years}</span>
                    <span><i className="fa-solid fa-gear"></i> {c.specs}</span>
                  </div>
                  <p className="c-desc">{c.desc}</p>
                  <div className="c-footer">
                    <span className="c-price">{c.price}</span>
                    <Link to={`/course/${c.slug}`} className="c-link">Learn More <i className="fa-solid fa-arrow-right"></i></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-inner reveal fade-up">
            <div className="cta-content">
              <h2>Ready to Start Your Journey?</h2>
              <p>Apply now and secure your seat in your dream course.</p>
            </div>
            <Link to="/contact" className="btn btn-white btn-lg shadow">Apply Now <i className="fa-solid fa-arrow-right"></i></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
