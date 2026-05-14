import React from "react";
import { motion } from "framer-motion";
import { 
  Scale, 
  Clock,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useLanguage } from "../contexts/LanguageContext";

export function TermsPage(props: any) {
  const { t, isRTL } = useLanguage();

  return (
    <div className="legal-page-theme" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <Header {...props} />
      
      <main style={{ flex: 1, position: 'relative' }}>
        <style>{`
          .legal-page-theme { font-family: 'Inter', system-ui, sans-serif; scroll-behavior: smooth; }
          .lang-ar .legal-page-theme { font-family: 'ThmanyahSans', sans-serif !important; }
          .legal-header { text-align: center; padding: 6rem 1.5rem; }
          .manual-layout { 
            display: grid; 
            grid-template-columns: 1fr; 
            gap: 3rem; 
            max-width: 1300px; 
            margin: 0 auto; 
            padding: 0 1.5rem 8rem 1.5rem; 
          }
          @media (min-width: 1024px) {
            .manual-layout { grid-template-columns: 320px 1fr; }
          }
          .sidebar-nav { 
            position: sticky; 
            top: 120px; 
            height: fit-content; 
            display: flex; 
            flex-direction: column; 
            gap: 0.5rem; 
          }
          .nav-item { 
            display: flex; 
            align-items: center; 
            gap: 0.75rem; 
            padding: 1rem 1.25rem; 
            border-radius: 1rem; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            border: 1px solid transparent; 
            text-decoration: none;
            color: inherit;
          }
          .nav-item:hover { background: var(--muted); border-color: var(--border); }
          .nav-item:active { transform: scale(0.98); }
          .legal-content { 
            display: flex; 
            flex-direction: column; 
            gap: 2rem; 
          }
          .section-card { 
            background: var(--card); 
            border: 1px solid var(--border); 
            border-radius: 2rem; 
            padding: 2.5rem; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.02); 
            transition: all 0.5s ease;
            text-align: ${isRTL ? 'right' : 'left'};
            direction: ${isRTL ? 'rtl' : 'ltr'};
          }

          @keyframes section-pulse {
            0% { background-color: var(--card); border-color: var(--border); }
            50% { background-color: var(--muted); border-color: var(--foreground); transform: scale(1.01); }
            100% { background-color: var(--card); border-color: var(--border); }
          }

          .section-card:target {
            animation: section-pulse 1s ease-in-out;
            scroll-margin-top: 120px;
          }

          .section-number { 
            width: 2.5rem; 
            height: 2.5rem; 
            border-radius: 0.75rem; 
            background: var(--foreground); 
            color: var(--background); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 900; 
            font-size: 0.875rem; 
            flex-shrink: 0;
          }
          .decorative-blur { 
            position: absolute; 
            width: 400px; 
            height: 400px; 
            border-radius: 50%; 
            filter: blur(100px); 
            opacity: 0.05; 
            z-index: -1; 
            pointer-events: none; 
          }
        `}</style>

        <div className="decorative-blur" style={{ top: '100px', left: '-100px', background: 'var(--foreground)' }}></div>

        <section className="legal-header" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'var(--muted)', padding: '0.6rem 1.25rem', borderRadius: '9999px', border: '1px solid var(--border)', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Scale size={18} />
              <span style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '10px' }}>{t.terms.badge}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900', letterSpacing: '-0.04em' }}>{t.terms.title}</h1>
            <p 
              style={{ maxWidth: '600px', color: 'var(--muted-foreground)', fontSize: '1.125rem', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: t.terms.desc }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '12px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Clock size={14} />
              <span>{t.terms.lastUpdated}</span>
            </div>
          </motion.div>
        </section>

        <div className="manual-layout" style={{ direction: 'ltr' }}>
          <aside className="sidebar-nav" style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <p style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', color: 'var(--muted-foreground)', padding: isRTL ? '0 1.25rem 0 0' : '0 0 0 1.25rem' }}>{t.terms.onThisPage}</p>
            {t.terms.sections.map((s, idx) => (
              <a key={s.id} href={`#${s.id}`} className="nav-item" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <span style={{ fontSize: '0.875rem' }}>{s.title.split('. ')[1] || s.title}</span>
              </a>
            ))}
          </aside>

          <div className="legal-content">
            {t.terms.sections.map((s, idx) => (
              <motion.section 
                id={s.id}
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="section-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexDirection: 'row' }}>
                  <div className="section-number">{idx + 1}</div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{s.title.includes('. ') ? s.title.split('. ')[1] : s.title}</h2>
                </div>
                <p 
                  style={{ color: 'var(--muted-foreground)', lineHeight: '1.8', fontSize: '1.1rem' }}
                  dangerouslySetInnerHTML={{ __html: s.content }}
                />
              </motion.section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TermsPage;
