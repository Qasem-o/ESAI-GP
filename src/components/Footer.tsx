import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="py-8 border-t bg-card/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EyeStocks AI (ESAI). All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <span className="hidden md:inline">•</span>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <span className="hidden md:inline">•</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <span className="hidden md:inline">•</span>
            <Link to="/help" className="hover:text-primary transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
