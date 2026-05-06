import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Shield, Users, GraduationCap, Target, Award } from "lucide-react";

export function About(props: any) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header {...props} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-6 max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
                Welcome to <span className="text-primary">EyeStocks AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We believe that successful investing shouldn't be limited to Wall Street experts. EyeStocks AI is your intelligent gateway to the financial markets.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-6 max-w-5xl pb-32 space-y-40">
          
          {/* Mission/Description Section */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-foreground">Our Mission</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We combine the power of advanced Artificial Intelligence and FinTech to empower retail investors to make data-driven, emotion-free trading decisions. Our platform is designed to turn complex market data into clear, actionable insights.
              </p>
            </div>
            <div className="bg-primary/10 rounded-[3rem] p-16 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-700 rounded-full" />
              <Brain className="w-40 h-40 text-primary relative z-10" />
            </div>
          </motion.section>

          {/* Our Story Section */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                <GraduationCap className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-bold">Our Story</h2>
            </div>
            <div className="bg-card border border-primary/10 rounded-[2.5rem] p-10 md:p-16 shadow-xl relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-serif text-3xl">"</div>
              <p className="text-2xl text-muted-foreground leading-relaxed italic font-light">
                EyeStocks AI began as an ambitious graduation project at the College of Computer Sciences & Information Technology at King Faisal University (KFU). We noticed a significant gap between complex AI forecasting models and the practical decision-making needs of everyday investors. Our solution was to build an intelligent engine that learns from the past, analyzes the present, and forecasts the future.
              </p>
            </div>
          </motion.section>

          {/* What We Offer Section */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-16"
          >
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold">What We Offer</h2>
              <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
              <p className="text-xl text-muted-foreground">Cutting-edge tools for the modern investor</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10">
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
                <div key={idx} className="group p-10 rounded-[2rem] border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all duration-500 shadow-lg hover:shadow-2xl">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-6">{item.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Team Section */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-16"
          >
            <div className="flex items-center justify-between border-b pb-8">
              <div className="flex items-center gap-6">
                <Award className="w-10 h-10 text-primary" />
                <h2 className="text-4xl font-bold">Meet the Team</h2>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-5 gap-16">
              <div className="lg:col-span-3 space-y-10">
                <p className="text-xl text-muted-foreground leading-relaxed">
                  We are a team of dedicated Computer Science students passionate about AI and Financial Technology:
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    "Sharidah AlGhannam (Team Leader)",
                    "Ali Alibrahim",
                    "Qasem Alolaywi",
                    "Abdullah AlKhodir"
                  ].map((member, idx) => (
                    <div key={idx} className="flex items-center gap-6 p-6 rounded-2xl bg-muted/50 hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20 shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-lg font-semibold">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 flex flex-col justify-center items-center p-12 bg-primary text-primary-foreground rounded-[3rem] text-center space-y-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <p className="text-sm uppercase tracking-[0.2em] font-bold opacity-80">Project Supervisor</p>
                <h3 className="text-4xl font-extrabold tracking-tight">Prof. Alaa Sagheer</h3>
                <div className="h-px w-20 bg-white/30" />
                <p className="text-lg opacity-90 leading-relaxed font-medium">College of Computer Sciences & Information Technology, KFU</p>
              </div>
            </div>
          </motion.section>

          {/* Vision Section */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-foreground text-background rounded-[4rem] p-16 md:p-24 text-center space-y-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
              <Target className="w-full h-full text-background/5 opacity-10 rotate-12" />
            </div>
            <div className="space-y-4">
              <p className="text-primary font-bold uppercase tracking-widest text-sm">Our Vision</p>
              <h2 className="text-4xl md:text-5xl font-bold">Future of Investing</h2>
            </div>
            <p className="text-2xl md:text-4xl font-light leading-tight max-w-4xl mx-auto italic">
              "To democratize advanced financial analytics, turning complex market data into clear, actionable insights for the modern investor."
            </p>
          </motion.section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
