import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-8 border-t bg-card/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EyeStocks AI (ESAI). {t.footer.rights}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link to="/our-story" className="hover:text-primary transition-colors">{t.footer.about}</Link>
            <span className="hidden md:inline">•</span>
            <Link to="/terms" className="hover:text-primary transition-colors">{t.footer.terms}</Link>
            <span className="hidden md:inline">•</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">{t.footer.privacy}</Link>
            <span className="hidden md:inline">•</span>
            <Link to="/help" className="hover:text-primary transition-colors">{t.footer.help}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
