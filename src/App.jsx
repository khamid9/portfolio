import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import aboutData from './content/about.json'
import experienceData from './content/experience.json'
import educationData from './content/education.json'
import certData from './content/certificates.json'
import langData from './content/languages.json'
import contactData from './content/contact.json'
import heroData from './content/hero.json'

function renderMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={i} style={{color:'#000', fontWeight:700}}>{part.slice(2, -2)}</span>
    }
    return part
  })
}

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
      {description && <p className="timeline-description">{renderMarkdown(description)}</p>}
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
              <h1 className="hero-name">{heroData.name}</h1>
              <p className="hero-subtitle">{heroData.subtitle}</p>
              <div className="tags">
                {heroData.tags.map((tag, i) => <Tag key={i}>{tag}</Tag>)}
              </div>
            </div>
          </div>
          <div className="stat-grid">
            {heroData.stats.map((stat, i) => (
              <StatCard key={i} number={stat.number} label={stat.label} delay={i * 0.1} />
            ))}
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="about" className="section" aria-label="About me">
          <SectionLabel>About</SectionLabel>
          <div className="about-text fade-up" ref={aboutRef}>
            {aboutData.paragraphs.map((p, i) => (
              <p key={i}>{renderMarkdown(p)}</p>
            ))}
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="experience" className="section" aria-label="Professional experience">
          <SectionLabel>Experience</SectionLabel>
          <div className="timeline">
            {experienceData.map((item, i) => (
              <TimelineItem
                key={i}
                period={item.period}
                title={item.title}
                subtitle={item.subtitle}
                description={item.description}
                delay={i * 0.1}
              />
            ))}
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="education" className="section" aria-label="Education">
          <SectionLabel>Education</SectionLabel>
          <div className="timeline">
            {educationData.map((item, i) => (
              <TimelineItem
                key={i}
                period={item.period}
                title={item.title}
                subtitle={item.subtitle}
                delay={i * 0.15}
              />
            ))}
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="certificates" className="section" aria-label="Certificates and awards">
          {certData.categories.map((cat, ci) => (
            <div key={ci}>
              <h3 className="cert-section-label">{cat.name}</h3>
              <div className="cert-photo-grid">
                {cat.photos.map((photo, pi) => {
                  const delay = (pi + ci * 10) * 0.03
                  if (photo.gallery) {
                    const images = photo.gallery.split(',').map(s => ({ src: s.trim(), alt: photo.alt || cat.name }))
                    return (
                      <CertPhoto
                        key={pi}
                        src={photo.src}
                        alt={photo.alt || cat.name}
                        delay={delay}
                        onClick={() => openGallery(images, 0)}
                      />
                    )
                  }
                  return (
                    <CertPhoto
                      key={pi}
                      src={photo.src}
                      alt={photo.alt || cat.name}
                      delay={delay}
                      onClick={() => openLightbox(photo.src)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="languages" className="section" aria-label="Languages spoken">
          <SectionLabel>Languages</SectionLabel>
          <div className="languages">
            {langData.items.map((lang, i) => <LangPill key={i} name={lang} />)}
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        <section id="contact" className="section" aria-label="Contact information">
          <SectionLabel>Contact</SectionLabel>
          <div className="contact-card fade-up" ref={contactRef}>
            <ContactRow icon={mailIcon}>
              <a href={`mailto:${contactData.email}`}>{contactData.email}</a>
            </ContactRow>
            <ContactRow icon={phoneIcon}>
              <span>{contactData.phone}</span>
            </ContactRow>
            <ContactRow icon={mapIcon}>
              <span>{contactData.location}</span>
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