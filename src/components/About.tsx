import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Shield, Users, GraduationCap, Target } from "lucide-react";

export function About(props: any) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header {...props} />
      
      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">About EyeStocks AI</h1>
            <p className="text-xl text-muted-foreground">Your intelligent gateway to the financial markets.</p>
          </div>

          <section className="prose prose-slate dark:prose-invert max-w-none text-center">
            <h2 className="text-2xl font-semibold">Welcome to EyeStocks AI</h2>
            <p className="text-lg">
              We believe that successful investing shouldn't be limited to Wall Street experts. EyeStocks AI is your intelligent gateway to the financial markets. We combine the power of advanced Artificial Intelligence and FinTech to empower retail investors to make data-driven, emotion-free trading decisions.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Our Story</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              EyeStocks AI began as an ambitious graduation project at the College of Computer Sciences & Information Technology at King Faisal University (KFU). We noticed a significant gap between complex AI forecasting models and the practical decision-making needs of everyday investors. Our solution was to build an intelligent engine that learns from the past, analyzes the present, and forecasts the future.
            </p>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-3 border-b pb-2">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">What We Offer</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Intelligent Forecasting</h3>
                <p className="text-muted-foreground">Powered by a Hybrid AI architecture (LSTM & XGBoost), our system delivers highly accurate stock trend predictions (over 83% directional accuracy) while filtering out market noise.</p>
              </div>

              <div className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Risk-Free Simulator</h3>
                <p className="text-muted-foreground">A fully integrated virtual trading environment that allows you to test your strategies with a virtual portfolio under real market conditions.</p>
              </div>

              <div className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Confidence & Risk Metrics</h3>
                <p className="text-muted-foreground">We don't just give you a price target; we provide a clear "Confidence Score" to help you manage your trading risk like a pro.</p>
              </div>

              <div className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Interactive Community</h3>
                <p className="text-muted-foreground">A dedicated social hub to share insights, discuss stock movements, and learn from fellow investors.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-2">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Meet the Team</h2>
            </div>
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                We are a team of dedicated Computer Science students passionate about AI and Financial Technology:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg font-medium">
                <li className="flex items-center gap-2">• Sharidah AlGhannam (Team Leader)</li>
                <li className="flex items-center gap-2">• Ali Alibrahim</li>
                <li className="flex items-center gap-2">• Qasem Alolaywi</li>
                <li className="flex items-center gap-2">• Abdullah AlKhodir</li>
              </ul>
              <p className="text-lg font-semibold pt-4 text-primary">
                Supervised by: Prof. Alaa Sagheer
              </p>
            </div>
          </section>

          <section className="bg-primary/5 p-8 rounded-2xl space-y-4 text-center">
            <div className="flex justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Our Vision</h2>
            <p className="text-xl text-muted-foreground italic">
              "To democratize advanced financial analytics, turning complex market data into clear, actionable insights for the modern investor."
            </p>
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
