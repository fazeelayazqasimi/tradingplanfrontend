import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import websiteService from '../../services/websiteService';

const defaultCourses = [
  { title: 'Market Structure & Price Action', tag: 'Foundations', lessons: 12, fill: 82, color: '#2563EB' },
  { title: 'Position Sizing & Capital Protection', tag: 'Risk Management', lessons: 9, fill: 45, color: '#10B981' },
  { title: 'Technical Analysis Deep Dive', tag: 'Strategy', lessons: 15, fill: 18, color: '#2563EB' },
];

const schedule = [
  { day: 'Risk & Psychology Workshop', time: 'Karachi - Sep 14', badge: 'Open', live: true },
  { day: 'Advanced Price Action Lab', time: 'Dubai - Oct 02', badge: 'Filling up', live: false },
  { day: 'Trading Desk Simulation', time: 'Lahore - Oct 21', badge: 'Filling up', live: false },
  { day: 'Mentor Roundtable', time: 'Karachi - Nov 05', badge: 'Open', live: true },
];

function ScrollReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('reveal-active'); obs.unobserve(el); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal-element ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    websiteService.getCourses({ limit: 20 })
      .then(({ data }) => {
        const items = data.data?.courses || data.data || [];
        if (items?.length) {
          setCourses(items);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayCourses = courses.length > 0 ? courses : null;

  return (
    <div>
      <style>{`
        .reveal-element { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal-active { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>

      {/* Online Education */}
      <section className="section bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="max-w-[640px] mb-16">
            <p className="eyebrow mb-3.5">Online Education</p>
            <h2 className="text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Courses built to be finished, not just started.</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">Video lessons, downloadable notes, assignments and quizzes - with progress tracked all the way to your certificate.</p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="skeleton h-72 rounded-2xl" />)}
            </div>
          ) : displayCourses ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCourses.map((course, i) => (
                <ScrollReveal key={course._id || i} delay={i * 80}>
                  <Link to={`/courses/${course.slug}`} className="block bg-white border border-dark-100 rounded-[18px] overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-md hover:-translate-y-1 h-full">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-[140px] object-cover" />
                    ) : (
                      <div className="h-[140px]" style={{ background: 'linear-gradient(135deg,#EFF4FE,#ECFDF5)' }} />
                    )}
                    <div className="p-[22px]">
                      <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">{course.level || 'Course'}</span>
                      <h4 className="text-base font-bold mt-2 mb-3" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{course.title}</h4>
                      <div className="h-1.5 rounded bg-dark-100 overflow-hidden mb-2">
                        <div className="h-full rounded" style={{ width: `${Math.min(course.progress || 0, 100)}%`, background: 'linear-gradient(90deg,#2563EB,#10B981)' }} />
                      </div>
                      <div className="flex justify-between text-xs text-dark-500 font-inter">
                        <span>{course.totalLessons || 0} lessons</span>
                        <span>{course.progress || 0}% complete</span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultCourses.map((c, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="bg-white border border-dark-100 rounded-[18px] overflow-hidden shadow-card">
                    <div className="h-[140px] relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#EFF4FE,#ECFDF5)' }}>
                      <svg className="absolute bottom-0 left-0 w-full h-[60%] opacity-50" viewBox="0 0 300 80" preserveAspectRatio="none">
                        <polyline fill="none" stroke={c.color} strokeWidth="2" points="0,60 40,40 80,50 120,20 160,35 200,15 240,25 300,5" />
                      </svg>
                    </div>
                    <div className="p-[22px]">
                      <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">{c.tag}</span>
                      <h4 className="text-base font-bold mt-2 mb-3" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{c.title}</h4>
                      <div className="h-1.5 rounded bg-dark-100 overflow-hidden mb-2">
                        <div className="h-full rounded" style={{ width: `${c.fill}%`, background: 'linear-gradient(90deg,#2563EB,#10B981)' }} />
                      </div>
                      <div className="flex justify-between text-xs text-dark-500 font-inter">
                        <span>{c.lessons} lessons</span>
                        <span>{c.fill}% complete</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Onsite Training */}
      <section className="section">
        <div className="max-w-[1240px] mx-auto px-8 grid lg:grid-cols-2 gap-7">
          <div>
            <p className="eyebrow mb-3.5">Onsite Training</p>
            <h2 className="text-[32px] font-extrabold mb-4 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Learn face to face with senior mentors.</h2>
            <p className="text-dark-500 text-[15px] leading-[1.7] mb-6.5 font-inter">
              Quarterly workshops in select cities cover live market reads, trade journaling and Q&A with instructors - with attendance tracked toward your certification.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { title: 'Instructor-led sessions', desc: 'Small cohorts, direct feedback on your own charts.' },
                { title: 'Live workshops', desc: 'Real-time market walkthroughs, not recorded replays.' },
                { title: 'Certification', desc: 'Attendance and assessment combine for your onsite certificate.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3.5 items-start">
                  <div className="w-[22px] h-[22px] rounded-[7px] bg-primary-50 text-primary-500 flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">&#10003;</div>
                  <div>
                    <strong className="block mb-0.5 text-[15.5px] text-ink" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{item.title}</strong>
                    <p className="text-dark-500 text-sm leading-relaxed font-inter">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ScrollReveal>
            <div className="bg-white border border-dark-100 rounded-[18px] p-6 shadow-card">
              <div className="font-bold text-[15px] mb-3.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Upcoming Sessions</div>
              {schedule.map((s, i) => (
                <div key={i} className="flex justify-between items-center py-3.5 border-b border-dark-100 last:border-0">
                  <div>
                    <div className="font-bold text-[14.5px]">{s.day}</div>
                    <div className="text-[13px] text-dark-500 font-mono">{s.time}</div>
                  </div>
                  <span className={`badge ${s.live ? 'badge-live' : 'badge-soon'}`}>{s.badge}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
