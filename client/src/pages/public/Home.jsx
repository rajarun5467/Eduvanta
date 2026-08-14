import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api.js';
import PublicLayout from '../../components/PublicLayout.jsx';
import '../../home.css';

const courseVideos = [
  { name: 'B.Tech', slug: 'btech', video: '/video/b-tech.mp4', years: '4 Years', specs: '10+ Specializations' },
  { name: 'BCA', slug: 'bca', video: '/video/bca.mp4', years: '3 Years', specs: '4 Specializations' },
  { name: 'MBA', slug: 'mba', video: '/video/mba.mp4', years: '2 Years', specs: '6 Specializations' },
  { name: 'MCA', slug: 'mca', video: '/video/mca.mp4', years: '2 Years', specs: '4 Specializations' },
  { name: 'Diploma', slug: 'diploma', video: '/video/deploma.mp4', years: '3 Years', specs: '4 Specializations' },
  { name: 'B.Sc', slug: 'bsc', video: '/video/bsc.mp4', years: '3 Years', specs: '5 Specializations' },
];

const testimonials = [
  { stars: 5, text: '"The faculty is supportive and the learning experience is excellent. I got placed in my dream company!"', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80', name: 'Rohit Singh', course: 'B.Tech CSE' },
  { stars: 5, text: '"The campus environment, facilities, and opportunities here are simply outstanding."', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80', name: 'Priya Patel', course: 'MBA' },
  { stars: 5, text: '"Great place to learn, explore, and shape your future. Highly recommended!"', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80', name: 'Vikram Mehta', course: 'BCA' },
  { stars: 5, text: '"The AI labs and smart classrooms gave me hands-on experience that helped me crack my interview at Google."', img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80', name: 'Arjun Reddy', course: 'MCA' },
  { stars: 5, text: '"From hostel facilities to placement support, everything is top-notch. I felt well-prepared for my career."', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80', name: 'Sneha Gupta', course: 'B.Tech ECE' },
  { stars: 5, text: '"The internship support and industry partnerships opened doors I never thought possible. Truly grateful!"', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf4531a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80', name: 'Karan Verma', course: 'Diploma' },
];

const newsItems = [
  { img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', day: '25', month: 'May', cat: 'Admissions', title: 'Admissions Open for 2024-25 Batch', desc: 'Apply now and secure your future with EduNex.' },
  { img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', day: '18', month: 'May', cat: 'Placement', title: 'Campus Drive by Tech Solutions', desc: 'Great placement opportunity for final year students.' },
  { img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', day: '10', month: 'May', cat: 'Event', title: 'Annual Technical Fest - TechNova 2K24', desc: 'Join us for exciting competitions and workshops.' },
  { img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', day: '05', month: 'May', cat: 'Workshop', title: 'Workshop on AI & Machine Learning', desc: 'Hands-on session by industry expert.' },
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [placements, setPlacements] = useState([]);
  const coursesRowRef = useRef(null);
  const testiTrackRef = useRef(null);
  const [testiCurrent, setTestiCurrent] = useState(0);

  useEffect(() => {
    Promise.all([API.get('/courses'), API.get('/placements')])
      .then(([c, p]) => { setCourses(c.data.slice(0, 6)); setPlacements(p.data.slice(0, 5)); })
      .catch(() => {});
  }, []);

  // Scroll reveal
  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  });

  // Counter animation for stat cards
  useEffect(() => {
    const animateCounter = (el, target, suffix, duration) => {
      let startTime = null;
      const update = (now) => {
        if (!startTime) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = value.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target.toLocaleString() + suffix;
      };
      requestAnimationFrame(update);
    };
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();
          const num = parseInt(text.replace(/[^0-9]/g, ''));
          const suffix = text.replace(/[0-9,]/g, '');
          if (num > 0) animateCounter(el, num, suffix, 1500);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-card h3').forEach((el) => counterObserver.observe(el));
    return () => counterObserver.disconnect();
  }, []);

  // About section counter animation
  useEffect(() => {
    const aboutCounterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          const duration = 1800;
          let startTime = null;
          const update = (now) => {
            if (!startTime) startTime = now;
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(eased * target);
            if (target >= 1000) el.textContent = (value / 1000).toFixed(0) + suffix;
            else el.textContent = value + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else {
              if (target >= 1000) el.textContent = (target / 1000).toFixed(0) + suffix;
              else el.textContent = target + suffix;
            }
          };
          requestAnimationFrame(update);
          aboutCounterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach((el) => aboutCounterObserver.observe(el));
    return () => aboutCounterObserver.disconnect();
  }, []);

  // Hero entrance animation
  useEffect(() => {
    const hero = document.querySelector('.hero');
    if (hero) hero.classList.add('active');
  }, []);

  // Courses slider
  const scrollCourses = (dir) => {
    const row = coursesRowRef.current;
    if (!row) return;
    const card = row.querySelector('.course-card');
    const gap = 24;
    const amount = card ? card.offsetWidth + gap : 300;
    row.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  // Testimonials slider
  const getPerView = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  };

  const getTotalSlides = () => Math.max(0, testimonials.length - getPerView() + 1);

  const updateTesti = (idx) => {
    const track = testiTrackRef.current;
    if (!track) return;
    let current = idx;
    const perView = getPerView();
    const maxIndex = testimonials.length - perView;
    if (current > maxIndex) current = maxIndex;
    if (current < 0) current = 0;
    setTestiCurrent(current);
    const slideWidth = 100 / perView;
    track.style.transform = `translateX(-${current * slideWidth}%)`;
  };

  const testiNext = () => {
    let c = testiCurrent + 1;
    if (c > getTotalSlides() - 1) c = 0;
    updateTesti(c);
  };

  const testiPrev = () => {
    let c = testiCurrent - 1;
    if (c < 0) c = getTotalSlides() - 1;
    updateTesti(c);
  };

  // Testimonials autoplay
  useEffect(() => {
    const timer = setInterval(testiNext, 4000);
    return () => clearInterval(timer);
  }, [testiCurrent]);

  return (
    <PublicLayout>
      <div className="hero-wrapper">
        <section className="hero reveal fade-up">
          <div className="container">
            <div className="hero-inner">
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="badge-icon"><i className="fa-solid fa-circle-dot"></i></span> Welcome to EduNex College
                </div>
                <h1>Empowering Future<br />Leaders Through<br /><span className="highlight">Smart Education</span></h1>
                <p>Experience world-class education, innovative teaching, and holistic development for a brighter future.</p>
                <div className="hero-btns">
                  <Link to="/contact" className="btn btn-primary shadow">Apply Now <i className="fa-solid fa-arrow-right"></i></Link>
                  <Link to="/courses" className="btn btn-white shadow">Explore Courses <i className="fa-solid fa-play"></i></Link>
                </div>
                <div className="hero-stats">
                  <div className="stat-card">
                    <div className="stat-icon-wrapper text-blue"><i className="fa-solid fa-user-graduate"></i></div>
                    <h3>10,000+</h3>
                    <p>Students</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrapper text-blue"><i className="fa-solid fa-chalkboard-user"></i></div>
                    <h3>250+</h3>
                    <p>Faculty Members</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrapper text-blue"><i className="fa-solid fa-book-open"></i></div>
                    <h3>50+</h3>
                    <p>Courses</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrapper text-blue"><i className="fa-solid fa-award"></i></div>
                    <h3>95%</h3>
                    <p>Placement Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Smart Campus Section */}
      <section className="smart-campus section-padding">
        <div className="container">
          <div className="section-header text-center reveal fade-up">
            <h2>Smart Campus, Smarter You</h2>
            <div className="divider"></div>
          </div>
          <div className="features-grid">
            <div className="feature-box reveal scale-in" data-delay="1"><div className="f-icon"><i className="fa-solid fa-laptop-file"></i></div><p>Online<br />Admission</p></div>
            <div className="feature-box reveal scale-in" data-delay="2"><div className="f-icon"><i className="fa-solid fa-user-tie"></i></div><p>Student<br />Portal</p></div>
            <div className="feature-box reveal scale-in" data-delay="3"><div className="f-icon"><i className="fa-solid fa-clipboard-user"></i></div><p>Attendance<br />Management</p></div>
            <div className="feature-box reveal scale-in" data-delay="4"><div className="f-icon"><i className="fa-solid fa-file-signature"></i></div><p>Examination<br />Portal</p></div>
            <div className="feature-box reveal scale-in" data-delay="5"><div className="f-icon"><i className="fa-solid fa-book"></i></div><p>Library<br />Management</p></div>
            <div className="feature-box reveal scale-in" data-delay="6"><div className="f-icon"><i className="fa-solid fa-building"></i></div><p>Hostel<br />Management</p></div>
            <div className="feature-box reveal scale-in" data-delay="7"><div className="f-icon"><i className="fa-solid fa-indian-rupee-sign"></i></div><p>Fee<br />Management</p></div>
            <div className="feature-box reveal scale-in" data-delay="8"><div className="f-icon"><i className="fa-solid fa-handshake"></i></div><p>Placement<br />Cell</p></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about section-padding bg-light">
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
              <p className="desc">We are committed to providing quality education, fostering innovation, and developing leaders who will make a positive impact in the world.</p>
              <div className="mv-container">
                <div className="mv-box">
                  <div className="icon-circle"><i className="fa-solid fa-bullseye"></i></div>
                  <div>
                    <h4>Mission</h4>
                    <p>To provide transformative education that empowers students to excel in their careers and contribute meaningfully to society.</p>
                  </div>
                </div>
                <div className="mv-box">
                  <div className="icon-circle"><i className="fa-solid fa-eye"></i></div>
                  <div>
                    <h4>Vision</h4>
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

      {/* Popular Courses */}
      <section className="courses section-padding">
        <div className="container">
          <div className="section-header flex-between reveal fade-up">
            <h2>Popular Courses</h2>
            <Link to="/courses" className="btn-link">View All Courses <i className="fa-solid fa-arrow-right"></i></Link>
          </div>
          <div className="courses-slider">
            <div className="courses-row" id="coursesRow" ref={coursesRowRef}>
              {courseVideos.map((c, i) => (
                <div className="course-card reveal fade-up" data-delay={i + 1} key={c.slug}>
                  <video autoPlay muted loop playsinline>
                    <source src={c.video} type="video/mp4" />
                  </video>
                  <div className="c-body">
                    <h3>{c.name}</h3>
                    <div className="c-meta">
                      <span><i className="fa-regular fa-user"></i> {c.years}</span>
                      <span><i className="fa-solid fa-gear"></i> {c.specs}</span>
                    </div>
                    <Link to={`/course/${c.slug}`} className="c-link">Learn More <i className="fa-solid fa-arrow-right"></i></Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="course-nav">
              <div className="course-arrow" onClick={() => scrollCourses(-1)}><i className="fa-solid fa-chevron-left"></i></div>
              <div className="dots"></div>
              <div className="course-arrow" onClick={() => scrollCourses(1)}><i className="fa-solid fa-chevron-right"></i></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose bg-light section-padding">
        <div className="container">
          <div className="section-header text-center reveal fade-up">
            <h2>Why Choose EduNex?</h2>
            <div className="divider"></div>
          </div>
          <div className="why-grid">
            <div className="why-item reveal scale-in" data-delay="1"><div className="w-icon"><i className="fa-solid fa-users"></i></div><p>Experienced<br />Faculty</p></div>
            <div className="why-item reveal scale-in" data-delay="2"><div className="w-icon"><i className="fa-solid fa-desktop"></i></div><p>Smart<br />Classrooms</p></div>
            <div className="why-item reveal scale-in" data-delay="3"><div className="w-icon"><i className="fa-solid fa-robot"></i></div><p>AI<br />Labs</p></div>
            <div className="why-item reveal scale-in" data-delay="4"><div className="w-icon"><i className="fa-solid fa-book-open-reader"></i></div><p>Digital<br />Library</p></div>
            <div className="why-item reveal scale-in" data-delay="5"><div className="w-icon"><i className="fa-solid fa-handshake"></i></div><p>Industry<br />Partnerships</p></div>
            <div className="why-item reveal scale-in" data-delay="6"><div className="w-icon"><i className="fa-solid fa-briefcase"></i></div><p>Internship<br />Support</p></div>
            <div className="why-item reveal scale-in" data-delay="7"><div className="w-icon"><i className="fa-solid fa-user-graduate"></i></div><p>Placement<br />Assistance</p></div>
            <div className="why-item reveal scale-in" data-delay="8"><div className="w-icon"><i className="fa-solid fa-flask"></i></div><p>Research &amp;<br />Innovation</p></div>
          </div>
        </div>
      </section>

      {/* Placements & Success */}
      <section className="placements section-padding">
        <div className="container">
          <div className="placement-grid">
            <div className="p-highlights reveal fade-left">
              <div className="flex-between mb-30">
                <h2>Placement Highlights</h2>
                <Link to="/placements" className="btn-link">View All Placements <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
              <div className="p-stats">
                <div className="p-stat-box"><p>Highest Package</p><h4><i className="fa-solid fa-indian-rupee-sign"></i> 51 <span>LPA</span></h4></div>
                <div className="p-stat-box"><p>Average Package</p><h4><i className="fa-solid fa-indian-rupee-sign"></i> 6.5 <span>LPA</span></h4></div>
                <div className="p-stat-box"><p>Placement Rate</p><h4 className="text-blue">95%</h4></div>
                <div className="p-stat-box"><p>Students Placed</p><h4 className="text-blue">1200+</h4></div>
              </div>
              <div className="top-recruiters mt-40">
                <h3>Top Recruiters</h3>
                <div className="recruiters-logos">
                  <div className="recruiter-card"><div className="recruiter-icon ri-google"><i className="fa-brands fa-google"></i></div><span className="recruiter-name">Google</span></div>
                  <div className="recruiter-card"><div className="recruiter-icon ri-microsoft"><i className="fa-brands fa-microsoft"></i></div><span className="recruiter-name">Microsoft</span></div>
                  <div className="recruiter-card"><div className="recruiter-icon ri-amazon"><i className="fa-brands fa-amazon"></i></div><span className="recruiter-name">Amazon</span></div>
                  <div className="recruiter-card"><div className="recruiter-icon ri-tcs"><i className="fa-solid fa-building"></i></div><span className="recruiter-name">TCS</span></div>
                  <div className="recruiter-card"><div className="recruiter-icon ri-infosys"><i className="fa-solid fa-laptop-code"></i></div><span className="recruiter-name">Infosys</span></div>
                </div>
              </div>
            </div>
            <div className="success-stories reveal fade-right">
              <h2>Student Success Stories</h2>
              <div className="success-card mt-30">
                <div className="quote-icon"><i className="fa-solid fa-quote-left"></i></div>
                <p className="s-text">EduNex provided me the perfect platform to learn, grow, and achieve my dreams. The support from faculty and placement cell was incredible.</p>
                <div className="s-author">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Student" />
                  <div>
                    <h4>Ananya Sharma</h4>
                    <p>Software Engineer at Microsoft</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials section-padding bg-light">
        <div className="container">
          <div className="section-header text-center reveal fade-up">
            <h2>What Our Students Say</h2>
            <div className="divider"></div>
          </div>
          <div className="testi-slider reveal fade-up">
            <div className="testi-track" id="testiTrack" ref={testiTrackRef}>
              {testimonials.map((t, i) => (
                <div className="testi-slide" key={i}>
                  <div className="testi-card">
                    <div className="stars">
                      {Array.from({ length: t.stars }).map((_, j) => <i key={j} className="fa-solid fa-star"></i>)}
                    </div>
                    <p>{t.text}</p>
                    <div className="t-author">
                      <img src={t.img} alt={t.name} />
                      <div><h4>{t.name}</h4><span>{t.course}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="testi-nav">
            <div className="testi-arrow" onClick={testiPrev}><i className="fa-solid fa-chevron-left"></i></div>
            <div className="dots">
              {Array.from({ length: getTotalSlides() }).map((_, i) => (
                <span key={i} className={`dot ${i === testiCurrent ? 'active' : ''}`} onClick={() => updateTesti(i)}></span>
              ))}
            </div>
            <div className="testi-arrow" onClick={testiNext}><i className="fa-solid fa-chevron-right"></i></div>
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="news section-padding">
        <div className="container">
          <div className="section-header flex-between reveal fade-up">
            <h2>Latest News &amp; Events</h2>
            <a href="#" className="btn-link">View All News <i className="fa-solid fa-arrow-right"></i></a>
          </div>
          <div className="news-grid">
            {newsItems.map((n, i) => (
              <div className="news-card reveal fade-up" data-delay={i + 1} key={i}>
                <div className="n-img">
                  <img src={n.img} alt="News" />
                  <div className="date-badge"><span>{n.day}</span><br />{n.month}</div>
                </div>
                <div className="n-body">
                  <span className="n-cat">{n.cat}</span>
                  <h4>{n.title}</h4>
                  <p>{n.desc}</p>
                  <a href="#" className="c-link">Read More <i className="fa-solid fa-arrow-right"></i></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta reveal fade-up">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-content">
              <h2>Start Your Academic Journey Today</h2>
              <p>Take the first step towards a brighter future with EduNex College.</p>
            </div>
            <Link to="/contact" className="btn btn-primary btn-lg shadow btn-cta">Apply Now <i className="fa-solid fa-arrow-right"></i></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
