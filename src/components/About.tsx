import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Shield, Users, GraduationCap, Target, Award, Sparkles } from "lucide-react";

export function About(props: any) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      <Header {...props} />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50 dark:opacity-30" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] -z-10 pointer-events-none opacity-50 dark:opacity-20" />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-8 flex flex-col items-center"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm backdrop-blur-md shadow-[0_0_15px_rgba(var(--primary),0.2)]"
              >
                <Sparkles className="w-4 h-4" />
                <span>The Future of Financial Technology</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[1.1]">
                Welcome to <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-600">
                  EyeStocks AI
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                We believe that successful investing shouldn't be limited to Wall Street experts. EyeStocks AI is your intelligent gateway to the financial markets.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-6 max-w-6xl pb-32 space-y-40">
          
          {/* Our Story Section */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent rounded-[3rem] -z-10" />
            <div className="grid lg:grid-cols-12 gap-12 items-center p-4 md:p-8 lg:p-12">
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-3 text-primary font-bold tracking-wider uppercase text-sm">
                  <GraduationCap className="w-6 h-6" />
                  <span>Our Origins</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Where it all <br/> <span className="text-muted-foreground">started.</span>
                </h2>
              </div>
              <div className="lg:col-span-7">
                <div className="relative bg-card/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
                  <p className="text-xl md:text-2xl text-foreground leading-relaxed relative z-10 font-light">
                    EyeStocks AI began as an ambitious graduation project at the <span className="font-semibold text-primary">College of Computer Sciences & Information Technology</span> at King Faisal University (KFU). We noticed a significant gap between complex AI forecasting models and the practical decision-making needs of everyday investors. Our solution was to build an intelligent engine that learns from the past, analyzes the present, and forecasts the future.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* What We Offer Section */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-16"
          >
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">What We Offer</h2>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                We combine the power of advanced Artificial Intelligence and FinTech to empower retail investors to make data-driven, emotion-free trading decisions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Intelligent Forecasting",
                  desc: "Powered by a Hybrid AI architecture (LSTM & XGBoost), our system delivers highly accurate stock trend predictions (over 83% directional accuracy) while filtering out market noise.",
                  icon: Brain,
                  color: "from-blue-500/20 to-cyan-500/20",
                  iconColor: "text-blue-500 dark:text-blue-400"
                },
                {
                  title: "Risk-Free Simulator",
                  desc: "A fully integrated virtual trading environment that allows you to test your strategies with a virtual portfolio under real market conditions.",
                  icon: TrendingUp,
                  color: "from-emerald-500/20 to-green-500/20",
                  iconColor: "text-emerald-500 dark:text-emerald-400"
                },
                {
                  title: "Confidence & Risk Metrics",
                  desc: "We don't just give you a price target; we provide a clear \"Confidence Score\" to help you manage your trading risk like a pro.",
                  icon: Shield,
                  color: "from-amber-500/20 to-orange-500/20",
                  iconColor: "text-amber-500 dark:text-amber-400"
                },
                {
                  title: "Interactive Community",
                  desc: "A dedicated social hub to share insights, discuss stock movements, and learn from fellow investors.",
                  icon: Users,
                  color: "from-purple-500/20 to-pink-500/20",
                  iconColor: "text-purple-500 dark:text-purple-400"
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="group relative bg-card/40 backdrop-blur-xl border border-border/50 hover:border-primary/30 rounded-[2.5rem] p-8 md:p-12 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${item.color} rounded-full blur-[60px] -mr-10 -mt-10 opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />
                  
                  <div className={`w-20 h-20 rounded-[1.5rem] bg-background border border-border/50 flex items-center justify-center mb-8 relative z-10 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <item.icon className={`w-10 h-10 ${item.iconColor}`} />
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-4 relative z-10 tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10 font-light text-lg">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Team Section */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="space-y-16"
          >
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 text-primary font-bold tracking-widest uppercase text-sm mb-2">
                <Award className="w-5 h-5" />
                <span>The Minds Behind</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">Meet the Team</h2>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
                Dedicated Computer Science students passionate about AI and Financial Technology.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Sharidah AlGhannam", role: "Team Leader", initial: "S" },
                { name: "Ali Alibrahim", role: "Core Member", initial: "A" },
                { name: "Qasem Alolaywi", role: "Core Member", initial: "Q" },
                { name: "Abdullah AlKhodir", role: "Core Member", initial: "A" }
              ].map((member, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[2rem] p-8 text-center hover:bg-card hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-xl"
                >
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-500">
                    <span className="text-3xl font-black text-primary/80">{member.initial}</span>
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{member.name}</h4>
                  <p className="text-xs text-primary font-bold tracking-widest uppercase">{member.role}</p>
                </motion.div>
              ))}
            </div>

            {/* Supervisor Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 max-w-5xl mx-auto relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-700 text-white shadow-2xl group"
            >
              {/* Abstract Dot Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:24px_24px] opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
              
              <div className="relative p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left z-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-md text-xs font-bold uppercase tracking-[0.2em] shadow-sm">
                    Project Supervisor
                  </div>
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">Prof. Alaa Sagheer</h3>
                  <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                    College of Computer Sciences & Information Technology, KFU.
                  </p>
                </div>
                <div className="hidden md:flex w-32 h-32 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                  <Award className="w-14 h-14 text-white" />
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Vision Section */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-zinc-950 dark:bg-black text-white rounded-[3rem] md:rounded-[4rem] p-12 md:p-24 text-center shadow-[0_20px_60px_rgba(0,0,0,0.4)] group border border-white/10"
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/40 rounded-full blur-[100px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            <div className="relative z-10 space-y-10 max-w-5xl mx-auto flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
                <Target className="w-10 h-10 text-primary" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-primary font-bold uppercase tracking-[0.4em] text-sm md:text-base">Our Vision</h2>
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-light leading-snug">
                  "To democratize advanced financial analytics, turning complex market data into <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-400">clear, actionable insights</span> for the modern investor."
                </h3>
              </div>
            </div>
          </motion.section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
