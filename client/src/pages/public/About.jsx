import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout.jsx';
import '../../about.css';

const team = [
  { img: 'https://images.unsplash.com/photo-1560250097-0b93528c312a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', name: 'Dr. Rajesh Kumar', role: 'Principal' },
  { img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', name: 'Dr. Sunita Sharma', role: 'Dean of Academics' },
  { img: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', name: 'Dr. Amit Verma', role: 'Director of Research' },
  { img: 'https://images.unsplash.com/photo-1580489944761-15a32d82e5f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', name: 'Dr. Meera Nair', role: 'Head of Placements' },
];

const values = [
  { icon: 'fa-solid fa-lightbulb', title: 'Innovation', desc: 'Encouraging creative thinking and embracing modern technology in education.' },
  { icon: 'fa-solid fa-heart', title: 'Integrity', desc: 'Upholding honesty, ethics, and transparency in all our academic practices.' },
  { icon: 'fa-solid fa-users', title: 'Diversity', desc: 'Creating an inclusive environment that celebrates diverse perspectives.' },
  { icon: 'fa-solid fa-trophy', title: 'Excellence', desc: 'Striving for the highest standards in teaching, research, and student support.' },
];

export default function About() {
  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    const aboutCounterObserver = new IntersectionObserver((entries) => {
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
            if (target >= 1000) el.textContent = (value / 1000).toFixed(0) + suffix;
            else el.textContent = value + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else { if (target >= 1000) el.textContent = (target / 1000).toFixed(0) + suffix; else el.textContent = target + suffix; }
          };
          requestAnimationFrame(update);
          aboutCounterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach((el) => aboutCounterObserver.observe(el));

    return () => { revealObserver.disconnect(); aboutCounterObserver.disconnect(); };
  }, []);

  return (
    <PublicLayout>
      <section className="page-hero">
        <div className="container">
          <h1>About EduNex College</h1>
          <p>Empowering students with quality education, innovation, and holistic development since 1999.</p>
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>About</span>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-img-wrapper reveal fade-left">
              <video autoPlay muted loop playsinline poster="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80">
                <source src="/video/intro.mp4" type="video/mp4" />
              </video>
              <div className="experience-card">
                <h3>25+ <span>Years</span></h3>
                <p>of Excellence</p>
              </div>
            </div>
            <div className="about-content reveal fade-right">
              <span className="subtitle">About Our College</span>
              <h2>Shaping Minds, Building Futures</h2>
              <p className="desc">EduNex College has been a pioneer in providing quality education since 1999. We are committed to fostering innovation, developing leaders, and creating an environment where students can thrive academically and personally. Our state-of-the-art campus, experienced faculty, and industry-aligned curriculum make us one of the most preferred institutions in the country.</p>
              <div className="mv-container">
                <div className="mv-box">
                  <div className="icon-circle"><i className="fa-solid fa-bullseye"></i></div>
                  <div>
                    <h4>Our Mission</h4>
                    <p>To provide transformative education that empowers students to excel in their careers and contribute meaningfully to society.</p>
                  </div>
                </div>
                <div className="mv-box">
                  <div className="icon-circle"><i className="fa-solid fa-eye"></i></div>
                  <div>
                    <h4>Our Vision</h4>
                    <p>To be a globally recognized institution for academic excellence, innovation, and holistic student development.</p>
                  </div>
                </div>
              </div>
              <div className="about-stats-row">
                <div className="a-stat">
                  <h4 className="counter" data-target="25" data-suffix="+">0</h4>
                  <p>Years of Excellence</p>
                </div>
                <div className="a-stat">
                  <h4 className="counter" data-target="100" data-suffix="+">0</h4>
                  <p>Awards &amp; Achievements</p>
                </div>
                <div className="a-stat">
                  <h4 className="counter" data-target="10000" data-suffix="K+">0</h4>
                  <p>Successful Alumni</p>
                </div>
                <div className="a-stat">
                  <h4 className="counter" data-target="98" data-suffix="%">0</h4>
                  <p>Student Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Our Core Values</h2>
            <div className="divider"></div>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div className="value-card reveal scale-in" data-delay={i + 1} key={v.title}>
                <div className="v-icon"><i className={v.icon}></i></div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <div className="section-header reveal fade-up">
            <h2>Our Leadership Team</h2>
            <div className="divider"></div>
          </div>
          <div className="team-grid">
            {team.map((m, i) => (
              <div className="team-card reveal fade-up" data-delay={i + 1} key={m.name}>
                <img src={m.img} alt={m.name} />
                <div className="team-info">
                  <h4>{m.name}</h4>
                  <p>{m.role}</p>
                  <div className="team-social">
                    <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
                    <a href="#"><i className="fa-brands fa-twitter"></i></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
