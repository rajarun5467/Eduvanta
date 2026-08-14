import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout.jsx';
import '../../course-detail.css';

const courseData = {
  btech: {
    title: 'B.Tech - Bachelor of Technology',
    short: 'B.Tech',
    video: '/video/b-tech.mp4',
    duration: '4 Years',
    seats: '120 per specialization',
    fee: '₹ 2,50,000/year',
    desc: 'A comprehensive 4-year engineering program designed to build strong technical foundations and practical skills. Students can choose from 10+ specializations including Computer Science, Electronics, Mechanical, Civil, Electrical, and more.',
    specializations: ['Computer Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Artificial Intelligence', 'Data Science', 'IoT & Automation', 'Information Technology', 'Cybersecurity'],
    highlights: ['Industry-aligned curriculum', 'State-of-the-art labs', 'Internship opportunities', '100% placement assistance', 'Research & innovation projects'],
    eligibility: '10+2 with Physics, Chemistry, and Mathematics with minimum 50% marks',
    career: ['Software Engineer', 'Data Scientist', 'AI/ML Engineer', 'Cybersecurity Analyst', 'Cloud Architect', 'Research & Development'],
  },
  bca: {
    title: 'BCA - Bachelor of Computer Applications',
    short: 'BCA',
    video: '/video/bca.mp4',
    duration: '3 Years',
    seats: '60 per specialization',
    fee: '₹ 1,20,000/year',
    desc: 'A 3-year undergraduate program focused on computer applications, software development, and IT skills. Ideal for students aspiring to build a career in the IT industry.',
    specializations: ['Software Development', 'Web Technology', 'Data Analytics', 'Cloud Computing'],
    highlights: ['Hands-on programming training', 'Web & mobile app development', 'Industry certifications', 'Internship with IT companies', 'Placement support'],
    eligibility: '10+2 with Mathematics with minimum 45% marks',
    career: ['Software Developer', 'Web Developer', 'Data Analyst', 'Cloud Associate', 'IT Support Engineer', 'App Developer'],
  },
  mba: {
    title: 'MBA - Master of Business Administration',
    short: 'MBA',
    video: '/video/mba.mp4',
    duration: '2 Years',
    seats: '60 per specialization',
    fee: '₹ 3,50,000/year',
    desc: 'A premier 2-year postgraduate program that develops future business leaders. Offers specializations in key management domains with case-based learning and industry exposure.',
    specializations: ['Finance', 'Marketing', 'Human Resources', 'Operations', 'International Business', 'Business Analytics'],
    highlights: ['Case study methodology', 'Industry internships', 'Leadership development', 'Corporate networking', 'Global exchange programs'],
    eligibility: 'Bachelor’s degree in any discipline with minimum 50% marks',
    career: ['Business Analyst', 'Marketing Manager', 'Financial Analyst', 'HR Manager', 'Operations Manager', 'Consultant'],
  },
  mca: {
    title: 'MCA - Master of Computer Applications',
    short: 'MCA',
    video: '/video/mca.mp4',
    duration: '2 Years',
    seats: '60',
    fee: '₹ 1,80,000/year',
    desc: 'A 2-year postgraduate program for advanced software engineering, system design, and application development. Prepares students for senior roles in the IT industry.',
    specializations: ['Software Engineering', 'AI & Machine Learning', 'Cloud & DevOps', 'Cybersecurity'],
    highlights: ['Advanced programming concepts', 'Real-world project development', 'Industry mentorship', 'Placement in top IT firms', 'Research opportunities'],
    eligibility: 'Bachelor’s degree with Mathematics at 10+2 or graduation level',
    career: ['Senior Software Engineer', 'System Architect', 'DevOps Engineer', 'AI/ML Specialist', 'Project Manager', 'Security Engineer'],
  },
  diploma: {
    title: 'Diploma in Engineering',
    short: 'Diploma',
    video: '/video/deploma.mp4',
    duration: '3 Years',
    seats: '60 per specialization',
    fee: '₹ 80,000/year',
    desc: 'A practical 3-year diploma program focused on hands-on technical training. Perfect for students who want to enter the engineering field early and build strong practical skills.',
    specializations: ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Computer Engineering'],
    highlights: ['Practical hands-on training', 'Industry workshops', 'Apprenticeship opportunities', 'Lateral entry to B.Tech', 'Job-ready skills'],
    eligibility: '10th pass with Mathematics and Science with minimum 35% marks',
    career: ['Junior Engineer', 'Technical Assistant', 'Site Supervisor', 'Maintenance Technician', 'CAD Operator', 'Lateral Entry to B.Tech'],
  },
  bsc: {
    title: 'B.Sc - Bachelor of Science',
    short: 'B.Sc',
    video: '/video/bsc.mp4',
    duration: '3 Years',
    seats: '60 per specialization',
    fee: '₹ 90,000/year',
    desc: 'A 3-year undergraduate science program offering in-depth study in fundamental and applied sciences. Builds strong analytical and research capabilities.',
    specializations: ['Physics', 'Chemistry', 'Mathematics', 'Biotechnology', 'Environmental Science'],
    highlights: ['Research-oriented curriculum', 'Modern laboratory facilities', 'Field studies & projects', 'Higher studies guidance', 'Science exhibitions'],
    eligibility: '10+2 with Science stream with minimum 45% marks',
    career: ['Research Assistant', 'Lab Technician', 'Data Analyst', 'Quality Control Officer', 'Teaching Professional', 'Higher Studies (M.Sc)'],
  },
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courseData[id];

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  });

  if (!course) {
    return (
      <PublicLayout>
        <section className="page-hero">
          <div className="container">
            <h1>Course Not Found</h1>
            <p>The course you are looking for does not exist.</p>
            <div className="breadcrumb">
              <Link to="/">Home</Link> <span>/</span> <Link to="/courses">Courses</Link>
            </div>
          </div>
        </section>
        <section style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="container">
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>This course is not available.</p>
            <Link to="/courses" className="btn btn-primary">Back to Courses <i className="fa-solid fa-arrow-right"></i></Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="page-hero">
        <div className="container">
          <h1>{course.short}</h1>
          <p>{course.title}</p>
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <Link to="/courses">Courses</Link> <span>/</span> <span>{course.short}</span>
          </div>
        </div>
      </section>

      <section className="course-detail-section">
        <div className="container">
          <div className="course-detail-grid">
            <div className="course-info-left">
              <div className="course-video-wrapper">
                <video autoPlay muted loop playsinline>
                  <source src={course.video} type="video/mp4" />
                </video>
              </div>
              <h2>Course Overview</h2>
              <p className="desc">{course.desc}</p>

              <div className="course-stats">
                <div className="course-stat-card">
                  <i className="fa-regular fa-clock"></i>
                  <p>Duration</p>
                  <h4>{course.duration}</h4>
                </div>
                <div className="course-stat-card">
                  <i className="fa-solid fa-users"></i>
                  <p>Seats</p>
                  <h4>{course.seats}</h4>
                </div>
                <div className="course-stat-card">
                  <i className="fa-solid fa-indian-rupee-sign"></i>
                  <p>Annual Fee</p>
                  <h4>{course.fee}</h4>
                </div>
              </div>

              <div className="detail-block">
                <h3>Specializations</h3>
                <div className="spec-tags">
                  {course.specializations.map((spec) => <span key={spec}>{spec}</span>)}
                </div>
              </div>

              <div className="detail-block">
                <h3>Course Highlights</h3>
                <ul className="highlight-list">
                  {course.highlights.map((h) => (
                    <li key={h}><i className="fa-solid fa-circle-check"></i> {h}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="course-sidebar">
              <div className="sidebar-card">
                <h3>Quick Information</h3>
                <div className="sidebar-info-row"><span>Course Name</span><span>{course.short}</span></div>
                <div className="sidebar-info-row"><span>Duration</span><span>{course.duration}</span></div>
                <div className="sidebar-info-row"><span>Seats</span><span>{course.seats}</span></div>
                <div className="sidebar-info-row"><span>Annual Fee</span><span>{course.fee}</span></div>
                <div className="sidebar-info-row"><span>Specializations</span><span>{course.specializations.length}</span></div>
              </div>

              <div className="sidebar-card">
                <h3>Eligibility</h3>
                <div className="eligibility-box">
                  <p><i className="fa-solid fa-circle-info"></i> {course.eligibility}</p>
                </div>
              </div>

              <div className="sidebar-card">
                <h3>Career Opportunities</h3>
                <ul className="career-list">
                  {course.career.map((c) => (
                    <li key={c}><i className="fa-solid fa-circle"></i> {c}</li>
                  ))}
                </ul>
              </div>

              <Link to="/contact" className="btn btn-primary sidebar-cta shadow">Apply Now <i className="fa-solid fa-arrow-right"></i></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="other-courses-section">
        <div className="container">
          <div className="section-header reveal fade-up" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--secondary)' }}>Other Courses</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Explore more programs offered by EduNex</p>
            <div className="divider" style={{ width: '60px', height: '4px', background: 'var(--primary)', margin: '15px auto 0', borderRadius: '2px' }}></div>
          </div>
          <div className="other-courses-grid">
            {Object.entries(courseData).map(([key, c]) => (
              key === id ? null : (
                <Link to={`/course/${key}`} className="other-course-card" key={key}>
                  <h4>{c.short}</h4>
                  <p>{c.duration}</p>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
