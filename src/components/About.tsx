import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Shield, Users } from "lucide-react";

export function About(props: any) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header {...props} />
      
      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">About EyeStocks AI</h1>
            <p className="text-xl text-muted-foreground">Empowering investors with advanced AI-driven stock insights and community intelligence.</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>
              EyeStocks AI (ESAI) is a cutting-edge platform designed to bridge the gap between complex financial data and actionable investment strategies. 
              Our mission is to democratize high-level stock analysis using state-of-the-art Artificial Intelligence and Machine Learning models.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Predictions</h3>
              <p className="text-muted-foreground">Our hybrid LSTM and XGBoost models analyze years of historical data and technical indicators to forecast future price movements with high confidence.</p>
            </div>

            <div className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Community Wisdom</h3>
              <p className="text-muted-foreground">Connect with thousands of traders, share insights, and learn from the top performers in our social community.</p>
            </div>

            <div className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Virtual Simulator</h3>
              <p className="text-muted-foreground">Test your strategies in a risk-free environment with our virtual trading simulator, using real-time market data.</p>
            </div>

            <div className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Data Integrity</h3>
              <p className="text-muted-foreground">We prioritize accurate, clean data sourced directly from reliable financial providers to ensure your analysis is based on facts.</p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
