import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Shield, Users, GraduationCap, Target, FileText } from "lucide-react";

export function About(props: any) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-serif">
      <Header {...props} />
      
      <main className="flex-1 container mx-auto px-8 py-20 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-24 text-left"
        >
          {/* Report Title Section */}
          <header className="border-b-2 border-primary/20 pb-12 space-y-4">
            <div className="flex items-center gap-2 text-primary uppercase tracking-widest text-sm font-sans font-bold">
              <FileText className="w-4 h-4" />
              <span>Project Documentation</span>
            </div>
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              EyeStocks AI: Executive Overview
            </h1>
            <p className="text-xl text-muted-foreground font-sans italic">
              Empowering retail investors through advanced artificial intelligence and data-driven insights.
            </p>
          </header>

          {/* Section: Welcome */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-6">
              I. Welcome to EyeStocks AI
            </h2>
            <div className="pl-10 space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe that successful investing shouldn't be limited to Wall Street experts. EyeStocks AI is your intelligent gateway to the financial markets. 
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We combine the power of advanced Artificial Intelligence and FinTech to empower retail investors to make data-driven, emotion-free trading decisions. Our platform serves as a bridge between complex quantitative analysis and the modern individual investor.
              </p>
            </div>
          </section>

          {/* Section: Our Story */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-6">
              II. Our Story
            </h2>
            <div className="pl-10 space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                EyeStocks AI began as an ambitious graduation project at the College of Computer Sciences & Information Technology at King Faisal University (KFU). The initiative was born from a recognized gap between complex academic AI forecasting models and the practical decision-making needs of everyday investors.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our solution was to build an intelligent engine that learns from the past, analyzes the present, and forecasts the future. What started as a scholarly pursuit has evolved into a comprehensive suite of tools designed for real-world financial navigation.
              </p>
            </div>
          </section>

          {/* Section: Capabilities */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-6">
              III. Core Capabilities
            </h2>
            <div className="pl-10 grid gap-12 pt-4 font-sans">
              <div className="space-y-3">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Brain className="w-5 h-5 text-primary" />
                  3.1 Intelligent Forecasting
                </h3>
                <p className="text-muted-foreground leading-relaxed pl-8">
                  Powered by a Hybrid AI architecture (LSTM & XGBoost), our system delivers highly accurate stock trend predictions (over 83% directional accuracy) while filtering out market noise.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  3.2 Risk-Free Simulator
                </h3>
                <p className="text-muted-foreground leading-relaxed pl-8">
                  A fully integrated virtual trading environment that allows you to test your strategies with a virtual portfolio under real market conditions.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  3.3 Confidence & Risk Metrics
                </h3>
                <p className="text-muted-foreground leading-relaxed pl-8">
                  We don't just give you a price target; we provide a clear "Confidence Score" to help you manage your trading risk like a pro.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  3.4 Interactive Community
                </h3>
                <p className="text-muted-foreground leading-relaxed pl-8">
                  A dedicated social hub to share insights, discuss stock movements, and learn from fellow investors.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Personnel */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-6">
              IV. Project Personnel
            </h2>
            <div className="pl-10 space-y-12">
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground font-sans">
                  The project is spearheaded by a team of dedicated Computer Science students at KFU:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-lg font-medium font-sans">
                  <li className="flex items-center gap-3 border-b pb-2">
                    <span className="text-primary font-bold">01.</span> Sharidah AlGhannam (Team Leader)
                  </li>
                  <li className="flex items-center gap-3 border-b pb-2">
                    <span className="text-primary font-bold">02.</span> Ali Alibrahim
                  </li>
                  <li className="flex items-center gap-3 border-b pb-2">
                    <span className="text-primary font-bold">03.</span> Qasem Alolaywi
                  </li>
                  <li className="flex items-center gap-3 border-b pb-2">
                    <span className="text-primary font-bold">04.</span> Abdullah AlKhodir
                  </li>
                </ul>
              </div>

              <div className="pt-8 border-t border-dashed border-primary/30">
                <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2 font-sans font-bold">Principal Supervisor</p>
                <h3 className="text-2xl font-bold text-foreground">Prof. Alaa Sagheer</h3>
                <p className="text-muted-foreground font-sans">College of Computer Sciences & Information Technology, KFU</p>
              </div>
            </div>
          </section>

          {/* Section: Strategic Vision */}
          <section className="space-y-8 pt-12">
            <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-6 uppercase tracking-tight">
              V. Strategic Vision
            </h2>
            <div className="pl-10 italic text-2xl text-foreground/80 leading-relaxed max-w-3xl">
              "To democratize advanced financial analytics, turning complex market data into clear, actionable insights for the modern investor."
            </div>
          </section>

          <footer className="pt-20 text-sm text-muted-foreground font-sans border-t">
            <p>© 2026 EyeStocks AI Research & Development. All rights reserved.</p>
          </footer>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
