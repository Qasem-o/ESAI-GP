import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, User, Share2, ThumbsUp, ThumbsDown, MessageCircle, ChevronRight, ChevronLeft, Bookmark } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { helpArticles, helpCategories } from "../data/helpData";
import "./HelpPage.css";

export function HelpArticlePage(props: any) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, isRTL, language } = useLanguage();
  const [liked, setLiked] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const currentLanguage = (language === "ar" || language === "en") ? language : "en";
  const article = id ? helpArticles[id] : null;
  const category = article ? helpCategories[article.category] : null;

  const relatedArticles = category 
    ? category.articles
        .filter(artId => artId !== id)
        .map(artId => helpArticles[artId])
        .slice(0, 3)
    : [];

  if (!article) {
    return (
      <div className="help-page-container">
        <Header {...props} />
        <main className="help-section text-center py-20">
          <h2 className="text-2xl font-bold">Article not found</h2>
          <button onClick={() => navigate("/help")} className="mt-4 text-primary">Back to Help Center</button>
        </main>
        <Footer />
      </div>
    );
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="help-page-container">
      <Header {...props} />
      
      {/* Main body follows global dir (RTL for Arabic) */}
      <main className="help-section">
        <div className="article-layout-container">
          {/* Main Article Content */}
          <div className="article-main-content">
            <button 
              onClick={() => navigate(category ? `/help/category/${category.id}` : "/help")}
              className="back-pill-button"
            >
              <BackIcon size={18} className="back-icon" />
              <span className="font-bold text-sm">{category ? category.title[currentLanguage] : (isRTL ? "العودة" : "Back")}</span>
            </button>

            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="article-premium-container"
            >
              <header className="mb-20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                  <span className="flex items-center gap-1 font-medium bg-muted/50 px-3 py-1 rounded-full">
                    <Clock size={14} /> {article.readTime} {isRTL ? "دقائق للقراءة" : "min read"}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-14 leading-[1.2]">{article.title[currentLanguage]}</h1>
                
              </header>

              <div className="article-content prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap">
                  {article.content[currentLanguage]}
                </p>
                
                <div className="my-10 h-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                
                <div className="feedback-section mt-16 p-10 bg-muted/30 rounded-[50px] border-2 border-dashed">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h4 className="text-2xl font-black mb-2">{isRTL ? "هل كان هذا المقال مفيداً؟" : "Was this article helpful?"}</h4>
                      <p className="text-muted-foreground">{isRTL ? "ساعدنا في تحسين المحتوى التعليمي" : "Help us improve our educational content"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setLiked(prev => prev === true ? null : true)}
                        className={`interaction-btn ${liked === true ? "active-like" : ""}`}
                        title={isRTL ? "نعم" : "Yes"}
                      >
                        <ThumbsUp size={24} />
                      </button>
                      <button 
                        onClick={() => setLiked(prev => prev === false ? null : false)}
                        className={`interaction-btn ${liked === false ? "active-dislike" : ""}`}
                        title={isRTL ? "لا" : "No"}
                      >
                        <ThumbsDown size={24} />
                      </button>
                      <button 
                        onClick={handleShare}
                        className="interaction-btn"
                        title={isRTL ? "مشاركة" : "Share"}
                      >
                        {copied ? <div className="text-[10px] font-bold text-primary leading-none text-center">{isRTL ? "تم النسخ" : "Copied"}</div> : <Share2 size={24} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>

          {/* Sidebar */}
          <aside className="article-sidebar">
            <div className="sidebar-box">
              <h4>{isRTL ? "مقالات ذات صلة" : "Related Articles"}</h4>
              <div className="flex flex-col gap-2">
                {relatedArticles.length > 0 ? relatedArticles.map(art => (
                  <div 
                    key={art.id} 
                    className="related-article-link group"
                    onClick={() => navigate(`/help/article/${art.id}`)}
                  >
                    <Bookmark size={14} className="group-hover:text-primary transition-colors" />
                    <span>{art.title[currentLanguage]}</span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">{isRTL ? "لا توجد مقالات أخرى" : "No other articles"}</p>
                )}
              </div>
            </div>

            <div className="sidebar-box bg-muted/40 dark:bg-primary text-foreground dark:text-primary-foreground border-none shadow-sm">
              <h4 className="flex items-center gap-2 font-bold mb-4">
                <MessageCircle size={20} className="text-primary dark:text-primary-foreground" /> {t.help.needMoreHelp}
              </h4>
              <p className="text-sm text-muted-foreground dark:text-primary-foreground/90 mb-6 leading-relaxed">
                {isRTL ? "فريق الدعم متاح لمساعدتك في أي وقت" : "Our support team is available to help you anytime."}
              </p>
              <button className="w-full py-3 bg-white border border-slate-200 text-slate-950 dark:bg-background dark:border-none dark:text-foreground rounded-xl font-bold hover:bg-slate-50 dark:hover:opacity-90 transition-all shadow-sm">
                {t.help.contactSupport}
              </button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
