import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout.jsx';
import '../../placements.css';

const recruiters = [
  { icon: 'fa-brands fa-google', cls: 'ri-google', name: 'Google' },
  { icon: 'fa-brands fa-microsoft', cls: 'ri-microsoft', name: 'Microsoft' },
  { icon: 'fa-brands fa-amazon', cls: 'ri-amazon', name: 'Amazon' },
  { icon: 'fa-solid fa-building', cls: 'ri-tcs', name: 'TCS' },
  { icon: 'fa-solid fa-laptop-code', cls: 'ri-infosys', name: 'Infosys' },
];

const stories = [
  { text: 'EduNex provided me the perfect platform to learn, grow, and achieve my dreams. The support from faculty and placement cell was incredible.', img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', name: 'Arjun Reddy', role: 'Software Engineer at Google' },
  { text: 'The mock interviews and soft skills training helped me crack my interview at Microsoft. The placement team goes above and beyond!', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', name: 'Sneha Gupta', role: 'Data Analyst at Microsoft' },
  { text: 'From internship to full-time offer at Amazon - EduNex made it all possible. The industry-aligned curriculum is a game changer.', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf4531a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', name: 'Karan Verma', role: 'Cloud Engineer at Amazon' },
];

const process = [
  { icon: 'fa-solid fa-clipboard-check', title: 'Registration', desc: 'Students register with the placement cell at the beginning of their final year.' },
  { icon: 'fa-solid fa-chalkboard-user', title: 'Training', desc: 'Aptitude, technical, and soft skills training sessions conducted regularly.' },
  { icon: 'fa-solid fa-file-pen', title: 'Mock Interviews', desc: 'Industry experts conduct mock interviews and provide feedback.' },
  { icon: 'fa-solid fa-handshake', title: 'Placement Drive', desc: 'Companies visit campus for recruitment drives and offer letters.' },
];

export default function Placements() {
  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          const duration = 1800;
          const startTime = performance.now();
          const update = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(eased * target);
            el.textContent = value + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target + suffix;
          };
          requestAnimationFrame(update);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach((el) => counterObserver.observe(el));

    return () => { revealObserver.disconnect(); counterObserver.disconnect(); };
  }, []);

  return (
    <PublicLayout>
      <section className="page-hero">
        <div className="container">
          <h1>Placements &amp; Career</h1>
          <p>Our students are placed in top companies with excellent packages. Explore our placement records.</p>
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>Placements</span>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Placement Statistics</h2>
            <p>Our placement record speaks for itself</p>
            <div className="divider"></div>
          </div>
          <div className="p-stats">
            <div className="p-stat-box reveal scale-in" data-delay="1">
              <div className="ps-icon"><i className="fa-solid fa-indian-rupee-sign"></i></div>
              <p>Highest Package</p>
              <h4 className="counter" data-target="51" data-suffix=" LPA">0</h4>
            </div>
            <div className="p-stat-box reveal scale-in" data-delay="2">
              <div className="ps-icon"><i className="fa-solid fa-chart-line"></i></div>
              <p>Average Package</p>
              <h4 className="counter" data-target="6" data-suffix=".5 LPA">0</h4>
            </div>
            <div className="p-stat-box reveal scale-in" data-delay="3">
              <div className="ps-icon"><i className="fa-solid fa-percent"></i></div>
              <p>Placement Rate</p>
              <h4 className="counter" data-target="95" data-suffix="%">0</h4>
            </div>
            <div className="p-stat-box reveal scale-in" data-delay="4">
              <div className="ps-icon"><i className="fa-solid fa-users"></i></div>
              <p>Students Placed</p>
              <h4 className="counter" data-target="1200" data-suffix="+">0</h4>
            </div>
          </div>
        </div>
      </section>

      <section className="recruiters-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Top Recruiters</h2>
            <p>Leading companies hire from EduNex</p>
            <div className="divider"></div>
          </div>
          <div className="recruiters-logos reveal fade-up">
            {recruiters.map((r) => (
              <div className="recruiter-card" key={r.name}>
                <div className={`recruiter-icon ${r.cls}`}><i className={r.icon}></i></div>
                <span className="recruiter-name">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stories-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Success Stories</h2>
            <p>Hear from our placed students</p>
            <div className="divider"></div>
          </div>
          <div className="stories-grid">
            {stories.map((s, i) => (
              <div className="story-card reveal fade-up" data-delay={i + 1} key={s.name}>
                <div className="quote-icon"><i className="fa-solid fa-quote-left"></i></div>
                <p>{s.text}</p>
                <div className="story-author">
                  <img src={s.img} alt={s.name} />
                  <div>
                    <h4>{s.name}</h4>
                    <p>{s.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Placement Process</h2>
            <p>How we prepare our students for placements</p>
            <div className="divider"></div>
          </div>
          <div className="process-grid">
            {process.map((p, i) => (
              <div className="process-card reveal scale-in" data-delay={i + 1} key={p.title}>
                <div className="pr-icon"><i className={p.icon}></i></div>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
