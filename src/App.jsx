import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); observer.unobserve(el) } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return ref
}

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Certificates', href: '#certificates' },
  { label: 'Languages', href: '#languages' },
  { label: 'Contact', href: '#contact' },
]

function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="nav-inner">
        <span className="nav-logo">G.T</span>
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      className={`scroll-top${visible ? ' scroll-top--visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
    </button>
  )
}

function SectionLabel({ children, className = '' }) {
  return <h2 className={`section-label ${className}`.trim()}>{children}</h2>
}

function Tag({ children }) {
  return <span className="tag">{children}</span>
}

function StatCard({ number, label, delay }) {
  const ref = useReveal()
  return (
    <div className="stat-card fade-up" ref={ref} style={{ animationDelay: `${delay}s` }}>
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function TimelineItem({ period, title, subtitle, description, delay }) {
  const ref = useReveal()
  return (
    <article className="timeline-item fade-up" ref={ref} style={{ animationDelay: `${delay}s` }}>
      <div className="timeline-dot" aria-hidden="true" />
      <time className="timeline-period">{period}</time>
      <h3 className="timeline-title">{title}</h3>
      {subtitle && <p className="timeline-subtitle">{subtitle}</p>}
      {description && <p className="timeline-description">{description}</p>}
    </article>
  )
}

function CertPhoto({ src, alt, delay, onClick, orientation = 'portrait' }) {
  const ref = useReveal()
  return (
    <div className={`cert-photo-card fade-up cert-photo-${orientation}`} ref={ref} style={{ animationDelay: `${delay}s` }} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onClick?.() }}>
      <img src={src} alt={alt} className="cert-photo-img" loading="lazy" />
    </div>
  )
}

function CertCard({ icon, title, subtitle, delay }) {
  const ref = useReveal()
  return (
    <article className="cert-card fade-up" ref={ref} style={{ animationDelay: `${delay}s` }}>
      <span className="cert-icon" aria-hidden="true">{icon}</span>
      <div>
        <h3 className="cert-title">{title}</h3>
        {subtitle && <p className="cert-subtitle">{subtitle}</p>}
      </div>
    </article>
  )
}

function LangPill({ name }) {
  return (
    <span className="lang-pill">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h7M9 3v2c0 4.1-1.8 6-4 6"/><path d="M5 19 15 9"/><path d="M20 19h-4"/><path d="M18 17v2c0 2-1.5 4-4 4"/><path d="M16 6c0 3.5-1.5 5-3 5"/></svg>
      {name}
    </span>
  )
}

function ContactRow({ icon, children }) {
  return (
    <div className="contact-row">
      <span className="contact-icon" aria-hidden="true">{icon}</span>
      {children}
    </div>
  )
}

function Lightbox({ images, currentIndex, onClose, onPrev, onNext }) {
  const single = images.length === 1
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (!single && e.key === 'ArrowLeft') onPrev()
      if (!single && e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose, onPrev, onNext, single])

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-label="Photo preview">
      <button className="lightbox-close" onClick={onClose} aria-label="Close">&times;</button>
      {!single && onPrev && (
        <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); onPrev() }} aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      )}
      <img className="lightbox-image" src={images[currentIndex].src} alt={images[currentIndex].alt} onClick={(e) => e.stopPropagation()} />
      {!single && onNext && (
        <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); onNext() }} aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      )}
      {!single && (
        <div className="lightbox-counter">{currentIndex + 1} / {images.length}</div>
      )}
    </div>
  )
}

const mailIcon = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
const phoneIcon = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
const mapIcon = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>

function App() {
  const [lightboxImages, setLightboxImages] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const aboutRef = useReveal()
  const contactRef = useReveal()

  const openLightbox = useCallback((src, alt = 'Photo') => {
    setLightboxImages([{ src, alt }])
    setLightboxIndex(0)
  }, [])

  const openGallery = useCallback((images, startIndex = 0) => {
    setLightboxImages(images)
    setLightboxIndex(startIndex)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxImages(null)
    setLightboxIndex(0)
  }, [])

  const goNext = useCallback(() => {
    setLightboxIndex(i => (i + 1) % lightboxImages.length)
  }, [lightboxImages])

  const goPrev = useCallback(() => {
    setLightboxIndex(i => (i - 1 + lightboxImages.length) % lightboxImages.length)
  }, [lightboxImages])

  return (
    <>
      <Nav />
      <main className="app">
        <section className="section hero-section" aria-label="Introduction">
          <div className="hero">
            <div className="avatar-wrapper" onClick={() => openLightbox('/photo.jpeg')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') openLightbox('/photo.jpeg') }} aria-label="Open photo">
              <img
                src="/photo.jpeg"
                alt="Gulzat Tashtanbekova — Language Teacher"
                className="avatar-photo"
                width="130"
                height="130"
              />
            </div>
            <div className="hero-text">
              <h1 className="hero-name">Gulzat Tashtanbekova</h1>
              <p className="hero-subtitle">Language Teacher · French, English &amp; Korean</p>
              <div className="tags">
                <Tag>French</Tag>
                <Tag>English</Tag>
                <Tag>Korean</Tag>
                <Tag>Head of Department</Tag>
                <Tag>10+ years</Tag>
              </div>
            </div>
          </div>
          <div className="stat-grid">
            <StatCard number="10+" label="Years teaching" delay={0} />
            <StatCard number="5" label="Languages spoken" delay={0.1} />
            <StatCard number="10+" label="Certificates" delay={0.2} />
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="about" className="section" aria-label="About me">
          <SectionLabel>About</SectionLabel>
          <div className="about-text fade-up" ref={aboutRef}>
            <p>My name is Gulzat. <span style={{color:'#000', fontWeight:700}}>I am an English and French language teacher with more than ten years of teaching experience.</span> In my lessons, I focus on developing all language skills: speaking, listening, reading, and writing, <span style={{color:'#000', fontWeight:700}}>with a particular emphasis on conversational practice.</span></p>
            <p>I have also taught mental arithmetic, which helps improve memory, concentration, and logical thinking. I continuously enhance my professional skills by studying modern teaching methods and taking professional development courses.</p>
            <p>I believe that a good teacher should not only share knowledge but also inspire students. <span style={{color:'#000', fontWeight:700}}>What I love most about my work is seeing my students succeed,</span> as their achievements motivate me to keep growing and enjoying my profession even more.</p>
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="experience" className="section" aria-label="Professional experience">
          <SectionLabel>Experience</SectionLabel>
          <div className="timeline">
            <TimelineItem
              period="Jan 2025 — Present"
              title="Head of Foreign Languages Department · French Teacher"
              subtitle="Summit International School, Bishkek"
              description="Leading the Foreign Languages Department, teaching French through English medium, developing curriculum and assessment tools, mentoring teachers, organizing cultural events."
              delay={0}
            />
            <TimelineItem
              period="Sep 2021 — Jan 2025"
              title="French Teacher"
              subtitle="United World International School Cambridge, Bishkek"
              description="Taught French through English medium, developed curriculum and assessment tools, mentored foreign language teachers, organized cultural events and second language week."
              delay={0.1}
            />
            <TimelineItem
              period="Oct 2020 — Aug 2021"
              title="Teacher of English, French & Korean"
              subtitle="Akademya Rosta Educational Center, Issyk-Kul"
              description="Conducted conversation classes and developed lessons across three languages. Focused on memory training, concentration, and critical thinking skills."
              delay={0.2}
            />
            <TimelineItem
              period="Aug 2018 — Dec 2019"
              title="Mental Arithmetic Instructor & Sport Stacking Trainer"
              subtitle="Cambridge United World International School, Bishkek"
              description="Trained students for international olympiads in mental arithmetic. Developed visual-spatial thinking, concentration, and cognitive speed through soroban-based methods."
              delay={0.3}
            />
            <TimelineItem
              period="Aug 2017 — May 2020"
              title="English Teacher"
              subtitle="Seytek-Jal Sapat School, Bishkek"
              description="Taught English using non-translation communicative methods. Prepared students for IGS exams and participated in professional development seminars."
              delay={0.4}
            />
            <TimelineItem
              period="Mar 2012 — Aug 2015"
              title="English, Kyrgyz & Russian Teacher · Low & High Level Manager"
              subtitle="The London School of Languages and Cultures, Bishkek"
              description={<>Taught local and international students from (<span style={{color:'#000', fontWeight:700}}>JICA/KOIKA</span>). Managed academic programs, evaluated teacher lesson plans, and ran conversation workshops. Developed school curriculum and supervised educational quality.</>}
              delay={0.5}
            />
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="education" className="section" aria-label="Education">
          <SectionLabel>Education</SectionLabel>
          <div className="timeline">
            <TimelineItem
              period="2006 — 2011"
              title="Diploma in Linguistics and Intercultural Communication"
              subtitle="Kyrgyz State University Arabaev · Speciality: Linguist-Translator"
              delay={0}
            />
            <TimelineItem
              period="01.09.2012 — 12.07.2015"
              title="Master's Degree Diploma"
              subtitle="Kyrgyz National University named after J. Balasagyn (KNU) · Faculty: International Law · Specialization: Jurisprudence (Law)"
              delay={0.15}
            />
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="certificates" className="section" aria-label="Certificates and awards">

          <h3 className="cert-section-label">Certificate of Appreciation</h3>
          <div className="cert-photo-grid">
            <CertPhoto src="/certificates/appreciation-1.jpeg" alt="Certificate of Appreciation" delay={0} onClick={() => openLightbox('/certificates/appreciation-1.jpeg')} />
            <CertPhoto src="/certificates/appreciation-2.jpeg" alt="Certificate of Appreciation" delay={0.03} onClick={() => openLightbox('/certificates/appreciation-2.jpeg')} />
            <CertPhoto src="/certificates/appreciation-3.jpeg" alt="Certificate of Appreciation" delay={0.06} onClick={() => openLightbox('/certificates/appreciation-3.jpeg')} />
            <CertPhoto src="/certificates/appreciation-4.jpeg" alt="Certificate of Appreciation" delay={0.09} onClick={() => openLightbox('/certificates/appreciation-4.jpeg')} />
            <CertPhoto src="/certificates/appreciation-5.jpeg" alt="Certificate of Appreciation" delay={0.12} onClick={() => openLightbox('/certificates/appreciation-5.jpeg')} />
            <CertPhoto src="/certificates/appreciation-6.jpeg" alt="Certificate of Appreciation" delay={0.15} onClick={() => openLightbox('/certificates/appreciation-6.jpeg')} />
            <CertPhoto src="/certificates/appreciation-7.jpeg" alt="Certificate of Appreciation" delay={0.18} onClick={() => openLightbox('/certificates/appreciation-7.jpeg')} />
            <CertPhoto src="/certificates/appreciation-8.jpeg" alt="Certificate of Appreciation" delay={0.21} onClick={() => openLightbox('/certificates/appreciation-8.jpeg')} />
            <CertPhoto src="/certificates/appreciation-9.jpeg" alt="Certificate of Appreciation" delay={0.24} onClick={() => openLightbox('/certificates/appreciation-9.jpeg')} />
          </div>

          <h3 className="cert-section-label">Professional Development</h3>
          <div className="cert-photo-grid">
            <CertPhoto src="/certificates/dev-1.jpeg" alt="Professional Development" delay={0} onClick={() => openLightbox('/certificates/dev-1.jpeg')} />
            <CertPhoto src="/certificates/dev-2.jpeg" alt="Professional Development" delay={0.03} onClick={() => openLightbox('/certificates/dev-2.jpeg')} />
            <CertPhoto src="/certificates/dev-3.jpeg" alt="Professional Development" delay={0.06} onClick={() => openLightbox('/certificates/dev-3.jpeg')} />
            <CertPhoto src="/certificates/dev-4.jpeg" alt="Professional Development" delay={0.09} onClick={() => openLightbox('/certificates/dev-4.jpeg')} />
            <CertPhoto src="/certificates/dev-5.jpeg" alt="Professional Development" delay={0.12} onClick={() => openLightbox('/certificates/dev-5.jpeg')} />
            <CertPhoto src="/certificates/dev-6.jpeg" alt="Professional Development" delay={0.15} onClick={() => openLightbox('/certificates/dev-6.jpeg')} />
            <CertPhoto src="/certificates/dev-7.jpeg" alt="Professional Development" delay={0.18} onClick={() => openLightbox('/certificates/dev-7.jpeg')} />
          </div>

          <h3 className="cert-section-label">Recommendation Letters</h3>
          <div className="cert-photo-grid">
            <CertPhoto src="/certificates/rec-1.png" alt="Recommendation Letter" delay={0} onClick={() => openLightbox('/certificates/rec-1.png')} />
            <CertPhoto src="/certificates/rec-2.png" alt="Recommendation Letter" delay={0.03} onClick={() => openLightbox('/certificates/rec-2.png')} />
            <CertPhoto src="/certificates/rec-3.png" alt="Recommendation Letter" delay={0.06} onClick={() => openLightbox('/certificates/rec-3.png')} />
            <CertPhoto src="/certificates/rec-4.png" alt="Recommendation Letter" delay={0.09} onClick={() => openLightbox('/certificates/rec-4.png')} />
            <CertPhoto src="/certificates/rec-two-1.png" alt="Recommendation Letter (2 pages)" delay={0.12} onClick={() => openGallery([{src:'/certificates/rec-two-1.png',alt:'Recommendation Letter p.1'},{src:'/certificates/rec-two-2.png',alt:'Recommendation Letter p.2'}], 0)} />
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="languages" className="section" aria-label="Languages spoken">
          <SectionLabel>Languages</SectionLabel>
          <div className="languages">
            <LangPill name="Kyrgyz" />
            <LangPill name="Russian" />
            <LangPill name="English" />
            <LangPill name="French" />
            <LangPill name="Korean" />
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="contact" className="section" aria-label="Contact information">
          <SectionLabel>Contact</SectionLabel>
          <div className="contact-card fade-up" ref={contactRef}>
            <ContactRow icon={mailIcon}>
              <a href="mailto:tashtanbekovagulzat2@gmail.com">tashtanbekovagulzat2@gmail.com</a>
            </ContactRow>
            <ContactRow icon={phoneIcon}>
              <span>+996 999 003 666</span>
            </ContactRow>
            <ContactRow icon={mapIcon}>
              <span>Bishkek, Kyrgyzstan</span>
            </ContactRow>
          </div>
        </section>
      </main>

      <ScrollToTop />

      {lightboxImages && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </>
  )
}

export default App
