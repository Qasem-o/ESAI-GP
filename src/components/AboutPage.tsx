import React from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Monitor, 
  ShieldCheck, 
  Users, 
  Linkedin,
  GraduationCap
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useLanguage } from "../contexts/LanguageContext";
import logo3d from "../assets/ESAI-Logo-3d.png";
import sharidahImg from "../assets/sharidah.jpg";
import aliImg from "../assets/ali.jpg";
import qasemImg from "../assets/qasem.jpg";
import abdullahImg from "../assets/abdullah.jpg";

export function AboutPage(props: any) {
  const { t, isRTL } = useLanguage();

  const team = [
    { 
      name: t.about.team.members.sharidah, 
      role: t.about.team.roleLeader, 
      avatar: sharidahImg,
      linkedin: "https://www.linkedin.com/in/sharidah-alghannam/"
    },
    { 
      name: t.about.team.members.ali, 
      role: t.about.team.roleMember, 
      avatar: aliImg,
      linkedin: "https://www.linkedin.com/in/ali-alibrahim-3b67242a7/"
    },
    { 
      name: t.about.team.members.qasem, 
      role: t.about.team.roleMember, 
      avatar: qasemImg,
      linkedin: "https://www.linkedin.com/in/qasem-alolaywi-411b36294/"
    },
    { 
      name: t.about.team.members.abdullah, 
      role: t.about.team.roleMember, 
      avatar: abdullahImg,
      linkedin: "https://www.linkedin.com/in/abdullah-al-khodeer-8310323b7/"
    }
  ];

  const featuresData = [
    { icon: Brain },
    { icon: Monitor },
    { icon: ShieldCheck },
    { icon: Users }
  ];

  return (
    <div className="about-monochrome-theme" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <Header {...props} />
      
      <main style={{ flex: 1 }}>
        <style>{`
          .about-monochrome-theme { font-family: 'Inter', system-ui, sans-serif; }
          .lang-ar .about-monochrome-theme { font-family: 'ThmanyahSans', sans-serif !important; }
          .monochrome-shadow { box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1); }
          .dark .monochrome-shadow { box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4); }
          .linkedin-btn:hover { color: #0077b5 !important; background-color: rgba(0, 119, 181, 0.1) !important; }
          .isolate-term { unicode-bidi: isolate; }
        `}</style>

        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '6rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '8rem' }}>
          
          {/* Section 1: Hero / Story */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ position: 'relative' }}
            >
              <div style={{ borderRadius: '3.5rem', overflow: 'hidden', boxShadow: '0 32px 64px -16px rgba(0,0,0,0.08)', border: '1px solid var(--border)', backgroundColor: 'transparent' }}>
                <img 
                   src={logo3d} 
                   alt="EyeStocks AI Brand Logo" 
                   style={{ width: '100%', height: '600px', objectFit: 'contain', padding: '1rem' }} 
                />
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{ 
                  position: 'absolute', 
                  bottom: '-2rem', 
                  right: '-1.5rem', 
                  backgroundColor: 'var(--card)', 
                  padding: '2rem', 
                  borderRadius: '2.5rem', 
                  border: '1px solid var(--border)', 
                  maxWidth: '280px', 
                  textAlign: isRTL ? 'right' : 'left',
                  direction: isRTL ? 'rtl' : 'ltr'
                }}
                className="monochrome-shadow"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--muted)', borderRadius: '1rem' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{t.about.story.label}</span>
                </div>
                <p 
                  style={{ fontSize: '0.95rem', color: 'var(--muted-foreground)', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: t.about.story.missionDesc }}
                />
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', textAlign: isRTL ? 'right' : 'left', alignItems: isRTL ? 'flex-end' : 'flex-start' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', direction: isRTL ? 'rtl' : 'ltr' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: '900', lineHeight: '1.1', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                  <span dangerouslySetInnerHTML={{ __html: t.about.hero.title }} /> <br/>
                  <span style={{ color: 'var(--muted-foreground)' }}>{t.about.hero.subtitle}</span>
                </h1>
                <p 
                  style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', lineHeight: '1.7', maxWidth: '600px' }}
                  dangerouslySetInnerHTML={{ __html: t.about.hero.desc }}
                />
              </div>

              <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border)', margin: '1rem 0' }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', direction: isRTL ? 'rtl' : 'ltr' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--foreground)', fontWeight: '800', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  <ShieldCheck size={18} />
                  {t.about.story.storyLabel}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--muted-foreground)', lineHeight: '1.8' }}>
                   <p dangerouslySetInnerHTML={{ __html: t.about.story.paragraph1 }} />
                   <p dangerouslySetInnerHTML={{ __html: t.about.story.paragraph2 }} />
                   
                   <div style={{ padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: '1.5rem', border: '1px solid var(--border)', position: 'relative' }}>
                      <p style={{ fontWeight: '700', color: 'var(--foreground)', marginBottom: '0.5rem' }}>{t.about.story.goalTitle}</p>
                      <p style={{ fontStyle: 'italic' }} dangerouslySetInnerHTML={{ __html: t.about.story.goalText }} />
                   </div>
                   
                   <p style={{ fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: t.about.story.footer }} />
                </div>
              </div>
            </motion.div>
          </section>

          {/* Section 2: Features Grid */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto', direction: isRTL ? 'rtl' : 'ltr' }}>
              <span style={{ color: 'var(--muted-foreground)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '10px', marginBottom: '1rem', display: 'block' }}>
                {t.about.features.badge}
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: t.about.features.title }} />
              <div style={{ height: '4px', width: '60px', backgroundColor: 'var(--foreground)', margin: '0 auto', borderRadius: '2px' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
              {t.about.features.items.map((f, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  style={{ backgroundColor: 'var(--card)', padding: '2.5rem', borderRadius: '2.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}
                  className="monochrome-shadow"
                >
                  <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
                    {React.createElement(featuresData[i].icon, { size: 28 })}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.8rem' }} dangerouslySetInnerHTML={{ __html: f.title }} />
                    <p 
                      style={{ color: 'var(--muted-foreground)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem' }}
                      dangerouslySetInnerHTML={{ __html: f.desc }}
                    />
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
                      {f.bullets.map((b, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: '600' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--foreground)' }}></div>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 3: Team */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
             <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto', direction: isRTL ? 'rtl' : 'ltr' }}>
              <span style={{ color: 'var(--muted-foreground)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '10px', marginBottom: '1rem', display: 'block' }}>
                {t.about.team.badge}
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: t.about.team.title }} />
              <div style={{ height: '4px', width: '60px', backgroundColor: 'var(--foreground)', margin: '0 auto', borderRadius: '2px' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem' }}>
              {team.map((m, i) => (
                <motion.div key={i} whileHover={{ y: -10 }} style={{ backgroundColor: 'var(--card)', padding: '2.75rem', borderRadius: '3.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', direction: isRTL ? 'rtl' : 'ltr' }} className="monochrome-shadow">
                  <div style={{ position: 'relative', marginBottom: '2.25rem' }}>
                    <div style={{ position: 'absolute', inset: '0', backgroundColor: 'var(--muted)', borderRadius: '50%', filter: 'blur(30px)', transform: 'scale(1.6)', opacity: 0.5 }}></div>
                    <img src={m.avatar} alt={m.name} style={{ width: '8.5rem', height: '8.5rem', borderRadius: '50%', border: '5px solid var(--card)', boxShadow: '0 12px 30px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 }} />
                  </div>
                  <h4 style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--foreground)' }}>{m.name}</h4>
                  <div style={{ marginTop: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0.5rem 1rem', backgroundColor: 'var(--muted)', borderRadius: '999px', color: 'var(--muted-foreground)' }}>
                      {m.role}
                    </span>
                  </div>
                  <div style={{ marginTop: '2.5rem' }}>
                    <a 
                      href={m.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ width: '3.25rem', height: '3.25rem', borderRadius: '1.25rem', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', transition: 'all 0.3s ease' }}
                      className="linkedin-btn"
                    >
                      <Linkedin size={26} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 4: Academic Supervision (MONOCHROME & AT THE BOTTOM) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ 
              marginTop: '-4rem', 
              backgroundColor: 'var(--card)', 
              borderRadius: '2.5rem', 
              padding: '1.5rem', 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '2rem', 
              maxWidth: '800px', 
              margin: '0 auto',
              flexWrap: 'wrap',
              border: '1px solid var(--border)',
              direction: isRTL ? 'rtl' : 'ltr' 
            }}
            className="monochrome-shadow"
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              backgroundColor: 'var(--muted)', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '1.5rem', 
              border: '1px solid var(--border)' 
            }}>
              <div style={{ 
                width: '2.5rem', 
                height: '2.5rem', 
                borderRadius: '50%', 
                backgroundColor: 'var(--foreground)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--background)' 
              }}>
                <GraduationCap size={24} />
              </div>
              <span style={{ fontWeight: '800', color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{t.about.team.supervisorLabel}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <span style={{ color: 'var(--muted-foreground)', fontWeight: '600' }}>{t.about.team.supervisorBy}</span>
              <span style={{ fontWeight: '900', color: 'var(--foreground)', fontSize: '1.25rem' }}>{t.about.team.supervisorName}</span>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
