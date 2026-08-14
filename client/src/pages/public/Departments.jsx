import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout.jsx';
import '../../departments.css';

const departments = [
  { img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', badge: 'UG + PG', name: 'Computer Science & Engineering', desc: 'Advanced curriculum covering AI, ML, Data Science, Cybersecurity, and Software Engineering with state-of-the-art labs.', students: '1200+ Students', faculty: '80+ Faculty' },
  { img: 'https://images.unsplash.com/photo-1581092160562-40aaebc8c5d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', badge: 'UG + PG', name: 'Electronics & Communication', desc: 'Specialization in VLSI Design, Embedded Systems, IoT, and Communication Networks with modern equipment.', students: '800+ Students', faculty: '50+ Faculty' },
  { img: 'https://images.unsplash.com/photo-1581093588401-fbb62a91f6c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', badge: 'UG + PG', name: 'Mechanical Engineering', desc: 'Comprehensive program in Robotics, Automotive, Manufacturing, and Thermal Engineering with advanced workshops.', students: '600+ Students', faculty: '40+ Faculty' },
  { img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', badge: 'PG', name: 'Department of Management', desc: 'MBA program with specializations in Finance, Marketing, HR, Operations, and International Business.', students: '500+ Students', faculty: '35+ Faculty' },
  { img: 'https://images.unsplash.com/photo-1532187863486-7438389f6fac?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', badge: 'UG', name: 'Department of Sciences', desc: 'B.Sc programs in Physics, Chemistry, Mathematics, Biotechnology, and Environmental Science.', students: '700+ Students', faculty: '45+ Faculty' },
  { img: 'https://images.unsplash.com/photo-1488190211505-6292d4419a5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', badge: 'UG + PG', name: 'Department of Humanities', desc: 'Courses in English, Psychology, Sociology, and Liberal Arts fostering critical thinking and creativity.', students: '400+ Students', faculty: '25+ Faculty' },
];

const facilities = [
  { icon: 'fa-solid fa-flask', title: 'Research Labs', desc: '50+ advanced research laboratories with cutting-edge equipment.' },
  { icon: 'fa-solid fa-book-open-reader', title: 'Digital Library', desc: '100,000+ books, e-journals, and digital resources available 24/7.' },
  { icon: 'fa-solid fa-bed', title: 'Hostel Facility', desc: 'Separate AC/non-AC hostels for boys and girls with mess facilities.' },
  { icon: 'fa-solid fa-dumbbell', title: 'Sports Complex', desc: 'Indoor and outdoor sports facilities including gym, pool, and courts.' },
];

export default function Departments() {
  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  });

  return (
    <PublicLayout>
      <section className="page-hero">
        <div className="container">
          <h1>Our Departments</h1>
          <p>Discover our specialized departments offering cutting-edge education and research opportunities.</p>
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>Departments</span>
          </div>
        </div>
      </section>

      <section className="dept-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Academic Departments</h2>
            <p>Explore our diverse range of academic departments</p>
            <div className="divider"></div>
          </div>
          <div className="dept-grid">
            {departments.map((d, i) => (
              <div className="dept-card reveal fade-up" data-delay={(i % 3) + 1} key={d.name}>
                <div className="dept-img">
                  <img src={d.img} alt={d.name} />
                  <span className="dept-badge">{d.badge}</span>
                </div>
                <div className="dept-body">
                  <h3>{d.name}</h3>
                  <p>{d.desc}</p>
                  <div className="dept-meta">
                    <span><i className="fa-solid fa-user-graduate"></i> {d.students}</span>
                    <span><i className="fa-solid fa-chalkboard-user"></i> {d.faculty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="facilities-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Campus Facilities</h2>
            <p>World-class facilities to support your academic journey</p>
            <div className="divider"></div>
          </div>
          <div className="facilities-grid">
            {facilities.map((f, i) => (
              <div className="facility-card reveal scale-in" data-delay={i + 1} key={f.title}>
                <div className="f-icon"><i className={f.icon}></i></div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
