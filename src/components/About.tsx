import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Shield, Users, GraduationCap, Target, Award } from "lucide-react";

export function About(props: any) {
  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header {...props} />
      
      <main className="flex-1 container mx-auto px-6 py-16 max-w-4xl space-y-20">
        
        {/* Welcome Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pb-12 border-b border-border text-right"
        >
          <div className="flex items-center gap-3 text-primary mb-4 justify-start">
            <Target className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Welcome to EyeStocks AI
            </h1>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We believe that successful investing shouldn't be limited to Wall Street experts. EyeStocks AI is your intelligent gateway to the financial markets. We combine the power of advanced Artificial Intelligence and FinTech to empower retail investors to make data-driven, emotion-free trading decisions.
          </p>
        </motion.section>

        {/* Our Story Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 pb-12 border-b border-border text-right"
        >
          <div className="flex items-center gap-3 text-primary mb-4 justify-start">
            <GraduationCap className="w-8 h-8" />
            <h2 className="text-2xl font-bold text-foreground">Our Story</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            EyeStocks AI began as an ambitious graduation project at the College of Computer Sciences & Information Technology at King Faisal University (KFU). We noticed a significant gap between complex AI forecasting models and the practical decision-making needs of everyday investors. Our solution was to build an intelligent engine that learns from the past, analyzes the present, and forecasts the future.
          </p>
        </motion.section>

        {/* What We Offer Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12 pb-12 border-b border-border text-right"
        >
          <div className="flex items-center gap-3 text-primary mb-4 justify-start">
            <Award className="w-8 h-8" />
            <h2 className="text-2xl font-bold text-foreground">What We Offer</h2>
          </div>
          
          <div className="space-y-12">
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
              <div key={idx} className="flex gap-6 items-start justify-start flex-row-reverse">
                <div className="p-3 bg-primary/5 rounded-full text-primary shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-10 pb-12 border-b border-border text-right"
        >
          <div className="flex items-center gap-3 text-primary mb-4 justify-start">
            <Users className="w-8 h-8" />
            <h2 className="text-2xl font-bold text-foreground">Meet the Team</h2>
          </div>
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              We are a team of dedicated Computer Science students passionate about AI and Financial Technology:
            </p>
            <ul className="space-y-4 text-lg text-foreground font-medium pr-6">
              <li>• Sharidah AlGhannam (Team Leader)</li>
              <li>• Ali Alibrahim</li>
              <li>• Qasem Alolaywi</li>
              <li>• Abdullah AlKhodir</li>
            </ul>
            <div className="pt-6">
              <p className="text-lg font-bold text-primary">Supervised by: Prof. Alaa Sagheer</p>
              <p className="text-muted-foreground">College of Computer Sciences & Information Technology, KFU</p>
            </div>
          </div>
        </motion.section>

        {/* Vision Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-12 space-y-6"
        >
          <h2 className="text-xl font-bold text-primary">Our Vision</h2>
          <p className="text-2xl md:text-3xl font-light italic text-foreground leading-relaxed">
            "To democratize advanced financial analytics, turning complex market data into clear, actionable insights for the modern investor."
          </p>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
}
