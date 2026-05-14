import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { 
  Brain, 
  Monitor, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Quote, 
  Linkedin, 
  ChevronRight,
  Target,
  GraduationCap
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function About(props: any) {
  const team = [
    { 
      name: "Sharidah AlGhannam", 
      role: "Team Leader", 
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sharidah&topType=hijab&accessoriesType=none",
      linkedin: "#"
    },
    { 
      name: "Ali Alibrahim", 
      role: "Team Member", 
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali&topType=shortHair&accessoriesType=round",
      linkedin: "#"
    },
    { 
      name: "Qasem Alolaywi", 
      role: "Team Member", 
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Qasem&topType=shortHair&accessoriesType=none",
      linkedin: "#"
    },
    { 
      name: "Abdullah AlKhodir", 
      role: "Team Member", 
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abdullah&topType=shortHair&accessoriesType=none",
      linkedin: "#"
    },
  ];

  const features = [
    {
      title: "Intelligent Forecasting",
      desc: "Our Hybrid AI Engine combines LSTM Neural Networks and XGBoost models to generate highly accurate stock movement predictions while minimizing market noise.",
      icon: Brain,
      color: "bg-teal-500/10 text-teal-600",
      bullets: [
        "Advanced AI prediction models",
        "Trend forecasting with high accuracy",
        "Real-time market analysis",
        "Smart buy/sell insights"
      ]
    },
    {
      title: "Risk-Free Trading Simulator",
      desc: "Practice before risking real capital. Our integrated virtual trading environment allows users to test strategies using simulated portfolios under real market conditions.",
      icon: Monitor,
      color: "bg-blue-500/10 text-blue-600",
      bullets: [
        "Virtual portfolio management",
        "Realistic market simulations",
        "Strategy testing environment",
        "Beginner-friendly experience"
      ]
    },
    {
      title: "Confidence & Risk Metrics",
      desc: "We believe transparency matters. Instead of only showing a predicted price, EyeStocks AI provides confidence indicators and risk metrics to support smarter trading decisions.",
      icon: ShieldCheck,
      color: "bg-green-500/10 text-green-600",
      bullets: [
        "AI confidence scoring",
        "Risk awareness indicators",
        "Market volatility analysis",
        "Decision-support insights"
      ]
    },
    {
      title: "Interactive Community",
      desc: "Investing becomes better when knowledge is shared. Our social hub allows investors and traders to discuss market trends, exchange insights, and learn collaboratively.",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600",
      bullets: [
        "Community discussions",
        "Shared market insights",
        "Investor engagement",
        "Collaborative learning"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]" dir="ltr">
      <Header {...props} />
      
      <main className="flex-1">
        {/* Top Section - Hero & Story */}
        <section className="container mx-auto px-6 py-20 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Image & Mission */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="rounded-[40px] overflow-hidden shadow-2xl bg-white p-2 border border-slate-100">
                <img 
                  src="/kfu_building_1778787239475.png" 
                  alt="King Faisal University" 
                  className="w-full h-[600px] object-cover rounded-[32px]"
                />
              </div>
              
              {/* Mission Card - Exact Floating Position */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-6 -left-6 md:left-6 bg-white p-7 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50 max-w-xs"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center text-white shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Our Mission</h4>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                      Make advanced market intelligence accessible to everyone through modern AI technologies and intuitive financial tools.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Welcome & Story */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="text-teal-600 font-bold uppercase tracking-[0.2em] text-[10px] block">
                    Welcome to EyeStocks AI
                  </span>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1]">
                    We believe successful investing should not be limited to <br/>
                    <span className="text-teal-600">Wall Street experts</span>.
                  </h1>
                  <p className="text-slate-600 leading-relaxed text-lg pt-4">
                    Our mission is to make advanced market intelligence accessible to everyone through modern AI technologies and intuitive financial tools. By combining machine learning, predictive analytics, and real-time financial insights, we help investors reduce emotional decision-making and trade with greater confidence.
                  </p>
                </div>

                <div className="pt-10 border-t border-slate-100 space-y-6">
                  <div className="flex items-center gap-2 text-teal-600 font-bold uppercase tracking-widest text-[11px]">
                    <BookOpen className="w-5 h-5" />
                    Our Story
                  </div>
                  
                  <div className="space-y-5 text-slate-600 leading-relaxed">
                    <p>
                      <span className="font-bold text-slate-900">EyeStocks AI</span> started as an ambitious graduation project at <br/>
                      <span className="font-bold text-slate-900 underline decoration-teal-500/30 underline-offset-4">King Faisal University</span> under the <span className="font-bold text-slate-900">College of Computer Sciences & Information Technology</span>.
                    </p>
                    <p>
                      We identified a major challenge in the financial world: while many AI forecasting models are technically powerful, they are often too complex and impractical for everyday investors.
                    </p>
                    <p className="font-semibold text-slate-800">Our goal became clear:</p>
                    
                    {/* Goal Blockquote Box */}
                    <div className="bg-[#F0FDFA] p-6 rounded-2xl border border-teal-100/50 flex gap-4">
                      <Quote className="w-10 h-10 text-teal-200 shrink-0" />
                      <p className="font-medium text-slate-700">
                        Build an intelligent platform that learns from historical market behavior, analyzes current trends, and <span className="text-teal-600 border-b-2 border-teal-200">forecasts future stock</span> movements in a simple and accessible way.
                      </p>
                    </div>
                    
                    <p className="text-sm pt-4">
                      Today, EyeStocks AI continues evolving into a complete intelligent investing ecosystem designed for modern traders and investors.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section: What We Offer - Light Blue Background */}
        <section className="bg-[#F8FAFC] py-24 border-y border-slate-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center space-y-4 mb-20">
              <span className="text-teal-600 font-bold uppercase tracking-[0.2em] text-[10px] block">
                What We Offer
              </span>
              <h2 className="text-4xl font-extrabold text-slate-900">
                Powerful Tools for Smarter Investing
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <Card key={idx} className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-white overflow-hidden rounded-3xl">
                  <CardContent className="p-10 flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full ${feature.color} flex items-center justify-center mb-8`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 mb-4 leading-tight">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-8">
                      {feature.desc}
                    </p>
                    <ul className="w-full space-y-3 pt-6 border-t border-slate-50">
                      {feature.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-center gap-3 text-[12px] text-slate-600 text-left w-full px-2">
                          <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                            <ChevronRight className="w-3 h-3 text-teal-600" />
                          </div>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Meet the Team */}
        <section className="container mx-auto px-6 py-24 max-w-7xl">
          <div className="text-center space-y-4 mb-20">
            <span className="text-teal-600 font-bold uppercase tracking-[0.2em] text-[10px] block">
              Meet the Team
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900">
              The Minds Behind EyeStocks AI
            </h2>
            <div className="w-16 h-1.5 bg-teal-500 mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {team.map((member, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -8 }}
                className="bg-white rounded-[32px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-slate-50 text-center flex flex-col items-center"
              >
                <div className="relative mb-6">
                   <div className="absolute inset-0 bg-teal-500/10 rounded-full scale-110 blur-xl"></div>
                   <Avatar className="w-28 h-28 border-4 border-white shadow-lg relative z-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-2xl">{member.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                
                <h4 className="font-bold text-slate-900 text-lg leading-tight">{member.name}</h4>
                <p className="text-xs font-bold text-teal-600 mt-2 uppercase tracking-wider">{member.role}</p>
                
                <div className="mt-8">
                  <a href={member.linkedin} className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#0077B5] hover:text-white transition-all shadow-sm">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Academic Supervision Bar - Exact Match */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 bg-teal-50 rounded-[28px] p-2 flex flex-col md:flex-row items-center justify-center gap-6 max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-4 bg-white py-3 px-6 rounded-[24px] shadow-sm flex-1 md:flex-none">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-900 whitespace-nowrap">Academic Supervision</span>
            </div>
            
            <div className="flex items-center gap-2 py-2 px-4">
              <span className="text-slate-500 font-medium">Supervised by:</span>
              <span className="font-extrabold text-teal-600 text-lg">Prof. Alaa Sagheer</span>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
