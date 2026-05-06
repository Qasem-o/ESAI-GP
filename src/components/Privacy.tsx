import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";

export function Privacy(props: any) {
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
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: May 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you create an account, such as your name, email address, and profile preferences. We also collect data about your interactions with our AI models and community features.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personalize your experience and AI predictions.</li>
                <li>Improve our models and platform functionality.</li>
                <li>Communicate with you about updates or security alerts.</li>
                <li>Ensure a safe and respectful community environment.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. Data Security</h2>
              <p>We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Cookies and Tracking</h2>
              <p>We use cookies to maintain your session and remember your preferences (like Dark Mode). You can disable cookies in your browser, but some features of ESAI may not function correctly.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Sharing of Data</h2>
              <p>We do not sell your personal data to third parties. We may share anonymized, aggregated data for research or analytic purposes to improve our financial models.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">6. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please reach out via the Help section.</p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
