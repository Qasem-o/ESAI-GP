import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { HelpCircle, Mail, MessageSquare, BookOpen } from "lucide-react";

export function Help(props: any) {
  const faqs = [
    { q: "How accurate are the AI predictions?", a: "Our models achieve high directional accuracy, but market volatility means they are not 100% certain. Use them as one of many tools in your analysis." },
    { q: "Can I trade real money on ESAI?", a: "No, ESAI is a simulator and analysis platform. We do not facilitate real-money transactions." },
    { q: "How often is the data updated?", a: "Stock prices and technical indicators are updated daily. AI models are typically retrained every 24 hours." },
    { q: "How do I become a 'Top Trader'?", a: "Your ranking is based on your virtual portfolio performance and engagement in the community." },
  ];

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
            <h1 className="text-4xl font-bold tracking-tight">How can we help?</h1>
            <p className="text-xl text-muted-foreground">Find answers to common questions or reach out to our team.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border bg-card hover:border-primary transition-colors cursor-pointer group">
              <BookOpen className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
              <p className="text-sm text-muted-foreground">Detailed guides on how to use our AI metrics and simulator.</p>
            </div>
            <div className="p-6 rounded-xl border bg-card hover:border-primary transition-colors cursor-pointer group">
              <MessageSquare className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Community Forum</h3>
              <p className="text-sm text-muted-foreground">Ask questions and share tips with fellow ESAI users.</p>
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" /> Frequently Asked Questions
            </h2>
            <div className="grid gap-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-5 rounded-xl border bg-card/50">
                  <h4 className="font-semibold mb-2">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center space-y-4">
            <h2 className="text-2xl font-bold">Still have questions?</h2>
            <p className="text-muted-foreground">Our support team is happy to help you with any issues.</p>
            <div className="flex justify-center gap-4">
              <a href="mailto:support@eyestocksai.com" className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Mail className="w-4 h-4" /> Contact Support
              </a>
            </div>
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
