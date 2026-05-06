import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Shield, Users, GraduationCap, Target } from "lucide-react";

export function About(props: any) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header {...props} />
      
      <main className="flex-1 container mx-auto px-6 py-20 max-w-4xl space-y-24">
        
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Welcome to EyeStocks AI
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We believe that successful investing shouldn't be limited to Wall Street experts. EyeStocks AI is your intelligent gateway to the financial markets. We combine the power of advanced Artificial Intelligence and FinTech to empower retail investors to make data-driven, emotion-free trading decisions.
          </p>
        </motion.section>

        <div className="w-16 h-px bg-border mx-auto" />

        {/* Our Story */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="flex items-center justify-center gap-3 text-primary mb-8">
            <GraduationCap className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-foreground">Our Story</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
            EyeStocks AI began as an ambitious graduation project at the College of Computer Sciences & Information Technology at King Faisal University (KFU). We noticed a significant gap between complex AI forecasting models and the practical decision-making needs of everyday investors. Our solution was to build an intelligent engine that learns from the past, analyzes the present, and forecasts the future.
          </p>
        </motion.section>

        <div className="w-16 h-px bg-border mx-auto" />

        {/* What We Offer */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <h2 className="text-2xl font-bold text-center text-foreground mb-12">What We Offer</h2>
          
          <div className="space-y-12 max-w-3xl mx-auto">
            {[
              {
                title: "Intelligent Forecasting",
                desc: "Powered by a Hybrid AI architecture (LSTM & XGBoost), our system delivers highly accurate stock trend predictions (over 83% directional accuracy) while filtering out market noise.",
                icon: Brain
              },
              {
                title: "Risk-Free Simulator",
                desc: "A fully integrated virtual trading environment that allows you to test your strategies with a virtual portfolio under real market conditions.",
                icon: TrendingUp
              },
              {
                title: "Confidence & Risk Metrics",
                desc: "We don't just give you a price target; we provide a clear \"Confidence Score\" to help you manage your trading risk like a pro.",
                icon: Shield
              },
              {
                title: "Interactive Community",
                desc: "A dedicated social hub to share insights, discuss stock movements, and learn from fellow investors.",
                icon: Users
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="p-3 bg-primary/5 rounded-full text-primary shrink-0">
                  <item.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="w-16 h-px bg-border mx-auto" />

        {/* Team Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-10 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center text-foreground">Meet the Team</h2>
          <p className="text-center text-muted-foreground text-lg mb-8">
            We are a team of dedicated Computer Science students passionate about AI and Financial Technology.
          </p>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <ul className="space-y-4 text-lg text-foreground font-medium">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Sharidah AlGhannam <span className="text-sm text-muted-foreground font-normal">(Team Leader)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Ali Alibrahim
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Qasem Alolaywi
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Abdullah AlKhodir
              </li>
            </ul>

            <div className="border-l-2 border-primary/20 pl-6">
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Supervised By</p>
              <h3 className="text-2xl font-bold text-foreground mb-1">Prof. Alaa Sagheer</h3>
              <p className="text-muted-foreground text-sm max-w-[200px]">College of Computer Sciences & Information Technology, KFU.</p>
            </div>
          </div>
        </motion.section>

        <div className="w-16 h-px bg-border mx-auto" />

        {/* Vision Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6 pb-20"
        >
          <Target className="w-8 h-8 text-primary mx-auto mb-4 opacity-50" />
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Our Vision</h2>
          <p className="text-2xl md:text-3xl font-light italic text-foreground max-w-3xl mx-auto leading-relaxed">
            "To democratize advanced financial analytics, turning complex market data into clear, actionable insights for the modern investor."
          </p>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
}
