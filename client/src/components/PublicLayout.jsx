import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../public.css';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/departments', label: 'Departments' },
  { to: '/placements', label: 'Placements' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const toggle = () => setMobileOpen((v) => !v);
  const close = () => setMobileOpen(false);

  return (
    <>
      <header className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="logo-text">
              <h2>EduNex</h2>
              <p>College Management System</p>
            </div>
          </Link>
          <nav className="nav-links">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={location.pathname === item.to ? 'active' : ''}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link to="/student-login" className="btn btn-login shadow">
              <i className="fa-solid fa-user-graduate"></i> Student Login
            </Link>
            <Link to="/contact" className="btn btn-primary shadow">
              Apply Now <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <button className={`hamburger ${mobileOpen ? 'open' : ''}`} aria-label="Menu" onClick={toggle}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
      <div className={`mobile-overlay ${mobileOpen ? 'open' : ''}`} onClick={close}></div>
      <nav className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className={location.pathname === item.to ? 'active' : ''} onClick={close}>
            {item.label}
          </Link>
        ))}
        <div className="mobile-actions">
          <Link to="/student-login" className="btn btn-login" onClick={close}>
            <i className="fa-solid fa-user-graduate"></i> Student Login
          </Link>
          <Link to="/contact" className="btn btn-primary" onClick={close}>
            Apply Now <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </nav>
    </>
  );
};

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer" id="mainFooter" ref={footerRef}>
      <div className="container">
        <div className="footer-top">
          <div className="footer-col about-col">
            <a href="#" className="logo footer-logo">
              <div className="logo-icon"><i className="fa-solid fa-graduation-cap"></i></div>
              <div className="logo-text">
                <h2>EduNex</h2>
                <p>College Management System</p>
              </div>
            </a>
            <p className="footer-desc">Empowering students with quality education, innovative learning, and holistic development for a better tomorrow.</p>
            <div className="social-links">
              <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#"><i className="fa-brands fa-twitter"></i></a>
              <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-youtube"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/admissions">Admissions</Link></li>
              <li><Link to="/departments">Departments</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Courses</h4>
            <ul>
              <li><Link to="/course/btech">B.Tech</Link></li>
              <li><Link to="/course/bca">BCA</Link></li>
              <li><Link to="/course/mba">MBA</Link></li>
              <li><Link to="/course/mca">MCA</Link></li>
              <li><Link to="/course/bsc">B.Sc</Link></li>
            </ul>
          </div>
          <div className="footer-col contact-col">
            <h4>Contact Us</h4>
            <ul>
              <li><i className="fa-solid fa-location-dot"></i> <span>123, EduNex Campus,<br />Knowledge City, India - 500001</span></li>
              <li><i className="fa-solid fa-phone"></i> <span>+91 98765 43210</span></li>
              <li><i className="fa-solid fa-envelope"></i> <span>info@edunex.edu.in</span></li>
              <li><i className="fa-solid fa-globe"></i> <span>www.edunex.edu.in</span></li>
            </ul>
          </div>
          <div className="footer-col newsletter-col">
            <h4>Newsletter</h4>
            <p>Subscribe to our newsletter for latest updates.</p>
            <form action="#" className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" />
              <button type="submit"><i className="fa-solid fa-paper-plane"></i></button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 EduNex College. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const PublicLayout = ({ children }) => (
  <div>
    <Navbar />
    {children}
    <Footer />
  </div>
);

export default PublicLayout;
