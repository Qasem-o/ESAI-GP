import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";

export function Terms(props: any) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header {...props} />
      
      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: May 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p>By accessing or using EyeStocks AI (ESAI), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. Financial Disclaimer</h2>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-900 dark:text-amber-200">
                <p className="font-bold mb-2">IMPORTANT: ESAI is NOT a financial advisor.</p>
                <p>All AI predictions, community insights, and data provided on this platform are for educational and informational purposes only. Trading stocks involves significant risk. You should consult with a qualified financial professional before making any investment decisions.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. User Conduct</h2>
              <p>You are responsible for all activity that occurs under your account. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide false or misleading information.</li>
                <li>Harass, abuse, or harm other community members.</li>
                <li>Use automated systems (bots) to scrape data without authorization.</li>
                <li>Attempt to interfere with the security or performance of the platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Intellectual Property</h2>
              <p>The content, features, and functionality of ESAI, including but not limited to the AI models and dashboard designs, are owned by EyeStocks AI and are protected by international copyright and trademark laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
              <p>In no event shall EyeStocks AI be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use the platform, including financial losses from trading activities.</p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
