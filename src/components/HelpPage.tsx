import React, { useState, useMemo } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Settings, Zap, Shield, CreditCard, ArrowLeft, ArrowRight, Clock, Lock, GraduationCap, Users, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { helpCategories, helpArticles } from "../data/helpData";
import "./HelpPage.css";

// Using the generated illustrations
import helpHeroImg from "../assets/help_center_illustration.png";
import contactSupportImg from "../assets/contact_support_illustration.png";

export function HelpPage(props: any) {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Object.values(helpCategories);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const currentLanguage = (language === "ar" || language === "en") ? language : "en";

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return Object.values(helpArticles).filter(article => 
      article.title[currentLanguage].toLowerCase().includes(query) || 
      article.content[currentLanguage].toLowerCase().includes(query)
    );
  }, [searchQuery, currentLanguage]);

  return (
    <div className="help-page-container">
      <Header {...props} />

      <main>
        {/* Hero Section */}
        <section className="help-hero">
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="help-hero-content"
          >
            <h1 className="help-hero-title">{t.help.title}</h1>
            <p className="help-hero-subtitle">
              {t.help.subtitle}
            </p>
            <div className="help-search-wrapper">
              <Search className="help-search-icon" size={20} />
              <input 
                type="text" 
                placeholder={t.help.searchPlaceholder} 
                className="help-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="help-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={18} />
                </button>
              )}

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery && filteredArticles.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="search-results-dropdown"
                  >
                    {filteredArticles.map(article => (
                      <div 
                        key={article.id} 
                        className="search-result-item"
                        onClick={() => navigate(`/help/article/${article.id}`)}
                      >
                        <BookOpen size={16} />
                        <span style={{ fontWeight: 500 }}>{article.title[currentLanguage]}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
                {searchQuery && filteredArticles.length === 0 && (
                  <motion.div 
                    className="search-results-dropdown no-results"
                    style={{ padding: '20px', textAlign: 'center', color: 'var(--hp-text-secondary)' }}
                  >
                    {isRTL ? "لا توجد نتائج بحث" : "No results found"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="help-hero-image"
          >
            <img src={helpHeroImg} alt={t.help.title} />
          </motion.div>
        </section>

        {/* Categories Section */}
        <section className="help-section">
          <h2 className="section-title">{t.help.browseByCategory}</h2>
          <div className="category-grid">
            {categories.map((cat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="category-card"
                onClick={() => navigate(`/help/category/${cat.id}`)}
              >
                <div className="category-icon-box">
                  {cat.icon === "BookOpen" && <BookOpen size={24} />}
                  {cat.icon === "Zap" && <Zap size={24} />}
                  {cat.icon === "Settings" && <Settings size={24} />}
                  {cat.icon === "Shield" && <Shield size={24} />}
                  {cat.icon === "CreditCard" && <CreditCard size={24} />}
                </div>
                <h3>{cat.title[currentLanguage]}</h3>
                <p>{cat.desc[currentLanguage]}</p>
                <div className="article-count">
                  <span>{cat.articles.length} {t.help.articlesCount}</span>
                  <ArrowIcon size={14} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="articles-and-contact">
            {/* Popular Articles */}
            <div className="popular-articles">
              <h2 className="section-title">{t.help.popularArticles}</h2>
              <div className="popular-articles-list">
                {Object.values(helpArticles).slice(0, 5).map((article, i) => (
                  <div 
                    key={i} 
                    className="article-item"
                    onClick={() => navigate(`/help/article/${article.id}`)}
                  >
                    <div className="article-info">
                      <BookOpen size={18} className="article-icon" />
                      <span>{article.title[currentLanguage]}</span>
                    </div>
                    <ArrowIcon size={16} />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Card */}
            <div className="contact-card">
              <div className="contact-content">
                <span className="contact-tag">{t.help.stillNeedHelp}</span>
                <h2>{t.help.cantFind}</h2>
                <p>
                   {t.help.stillNeedHelp} {t.help.subtitle}
                </p>
                <button className="contact-btn">
                  {t.help.contactSupport}
                  <ArrowIcon size={18} />
                </button>
              </div>
              <div className="contact-image">
                <img src={contactSupportImg} alt={t.help.contactSupport} />
              </div>
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="footer-highlights">
            {t.help.highlights.map((item, i) => (
              <div key={i} className="highlight-item">
                <div className="highlight-icon">
                  {i === 0 && <Clock size={20} />}
                  {i === 1 && <Lock size={20} />}
                  {i === 2 && <GraduationCap size={20} />}
                  {i === 3 && <Users size={20} />}
                </div>
                <div className="highlight-text">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
