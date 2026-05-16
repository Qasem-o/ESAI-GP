import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Clock, ChevronRight, Settings, Zap, Shield, CreditCard } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { helpCategories, helpArticles } from "../data/helpData";
import "./HelpPage.css";

export function HelpCategoryPage(props: any) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, isRTL, language } = useLanguage();
  
  const currentLanguage = (language === "ar" || language === "en") ? language : "en";
  const category = id ? helpCategories[id] : null;
  const articles = category?.articles.map(articleId => helpArticles[articleId]) || [];

  if (!category) {
    return (
      <div className="help-page-container">
        <Header {...props} />
        <main className="help-section text-center py-20">
          <h2 className="text-2xl font-bold">Category not found</h2>
          <button onClick={() => navigate("/help")} className="mt-4 text-primary">Back to Help Center</button>
        </main>
        <Footer />
      </div>
    );
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const getIcon = (name: string) => {
    switch (name) {
      case "BookOpen": return <BookOpen size={40} />;
      case "Zap": return <Zap size={40} />;
      case "Settings": return <Settings size={40} />;
      case "Shield": return <Shield size={40} />;
      case "CreditCard": return <CreditCard size={40} />;
      default: return <BookOpen size={40} />;
    }
  };

  return (
    <div className="help-page-container">
      <Header {...props} />
      
      {/* Main body follows global dir (RTL for Arabic) */}
      <main className="help-section">
        <button 
          onClick={() => navigate("/help")}
          className="back-pill-button"
        >
          <BackIcon size={18} className="back-icon" />
          <span className="font-bold text-sm">{isRTL ? "العودة لمركز المساعدة" : "Back to Help Center"}</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="category-header"
        >
          <div className="category-header-icon">
            {getIcon(category.icon)}
          </div>
          <div>
            <h1 className="text-4xl font-black mb-2">{category.title[currentLanguage]}</h1>
            <p className="text-xl text-muted-foreground">{category.desc[currentLanguage]}</p>
          </div>
        </motion.div>

        <div className="article-list-section">
          <div className="flex items-center justify-between article-list-header">
            <h2 className="text-2xl font-bold">{isRTL ? "المقالات التعليمية" : "Educational Articles"}</h2>
            <span className="bg-muted px-3 py-1 rounded-full text-sm font-bold">
              {articles.length} {t.help.articlesCount}
            </span>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl">
              <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {isRTL ? "لا توجد مقالات في هذه الفئة بعد." : "No articles in this category yet."}
              </p>
            </div>
          ) : (
            <div className="article-list-grid">
              {articles.map((article, i) => (
                <motion.div 
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="article-card-premium"
                  onClick={() => navigate(`/help/article/${article.id}`)}
                >
                  <div>
                    <h3>{article.title[currentLanguage]}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.content[currentLanguage]}
                    </p>
                  </div>
                  <div className="article-card-meta">
                    <span className="flex items-center gap-1"><Clock size={14} /> 5 {isRTL ? "دقائق" : "min"}</span>
                    <span className="text-primary font-bold">{isRTL ? "اقرأ المزيد" : "Read More"}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
