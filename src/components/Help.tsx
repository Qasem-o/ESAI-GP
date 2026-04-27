import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

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
            <h1 className="text-4xl font-bold tracking-tight">Help & FAQ</h1>
            <p className="text-xl text-muted-foreground">Frequently asked questions about EyeStocks AI.</p>
          </div>

          <section className="space-y-6">
            <div className="grid gap-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 rounded-xl border bg-card hover:border-primary/30 transition-colors">
                  <h4 className="text-lg font-semibold mb-2 flex items-start gap-3">
                    <span className="text-primary mt-1">Q:</span>
                    {faq.q}
                  </h4>
                  <p className="text-muted-foreground pl-7 border-l-2 border-primary/10">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
