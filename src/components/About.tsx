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
          className="space-y-6 pb-12 border-b border-border"
        >
          <div className="flex items-center gap-3 text-primary mb-4">
            <Target className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              مرحباً بكم في EyeStocks AI
            </h1>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">
            نحن نؤمن بأن الاستثمار الناجح لا ينبغي أن يقتصر على خبراء وول ستريت. EyeStocks AI هي بوابتكم الذكية للأسواق المالية. نحن نجمع بين قوة الذكاء الاصطناعي المتقدم والتكنولوجيا المالية (FinTech) لتمكين المستثمرين الأفراد من اتخاذ قرارات تداول قائمة على البيانات وخالية من العواطف.
          </p>
        </motion.section>

        {/* Our Story Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 pb-12 border-b border-border text-right"
        >
          <div className="flex items-center gap-3 text-primary mb-4">
            <GraduationCap className="w-8 h-8" />
            <h2 className="text-2xl font-bold text-foreground font-sans">قصتنا</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            بدأت EyeStocks AI كمشروع تخرج طموح في كلية علوم الحاسب وتقنية المعلومات بجامعة الملك فيصل (KFU). لاحظنا فجوة كبيرة بين نماذج التنبؤ المعقدة بالذكاء الاصطناعي واحتياجات اتخاذ القرار العملية للمستثمرين العاديين. كان حلنا هو بناء محرك ذكي يتعلم من الماضي، ويحلل الحاضر، ويتنبأ بالمستقبل.
          </p>
        </motion.section>

        {/* What We Offer Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12 pb-12 border-b border-border"
        >
          <div className="flex items-center gap-3 text-primary mb-4">
            <Award className="w-8 h-8" />
            <h2 className="text-2xl font-bold text-foreground">ماذا نقدم</h2>
          </div>
          
          <div className="space-y-12">
            {[
              {
                title: "التنبؤ الذكي",
                desc: "بدعم من بنية ذكاء اصطناعي هجينة (LSTM & XGBoost)، يقدم نظامنا تنبؤات دقيقة للغاية لاتجاهات الأسهم (دقة اتجاهية تزيد عن 83%) مع تصفية ضجيج السوق.",
                icon: Brain
              },
              {
                title: "محاكي خالي من المخاطر",
                desc: "بيئة تداول افتراضية متكاملة تماماً تسمح لك باختبار استراتيجياتك بمحفظة افتراضية في ظل ظروف السوق الحقيقية.",
                icon: TrendingUp
              },
              {
                title: "مقاييس الثقة والمخاطر",
                desc: "نحن لا نعطيك فقط سعراً مستهدفاً؛ بل نقدم \"درجة ثقة\" واضحة لمساعدتك في إدارة مخاطر التداول الخاصة بك مثل المحترفين.",
                icon: Shield
              },
              {
                title: "مجتمع تفاعلي",
                desc: "مركز اجتماعي مخصص لمشاركة الرؤى، ومناقشة تحركات الأسهم، والتعلم من زملائك المستثمرين.",
                icon: Users
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="p-3 bg-primary/5 rounded-full text-primary shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
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
          className="space-y-10 pb-12 border-b border-border"
        >
          <div className="flex items-center gap-3 text-primary mb-4">
            <Users className="w-8 h-8" />
            <h2 className="text-2xl font-bold text-foreground">فريق العمل</h2>
          </div>
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              نحن فريق من طلاب علوم الحاسب الشغوفين بالذكاء الاصطناعي والتكنولوجيا المالية:
            </p>
            <ul className="space-y-4 text-lg text-foreground font-medium pr-6">
              <li>• شريدة الغنام (قائد الفريق)</li>
              <li>• علي الإبراهيم</li>
              <li>• قاسم العليوي</li>
              <li>• عبد الله الخضير</li>
            </ul>
            <div className="pt-6">
              <p className="text-lg font-bold text-primary">تحت إشراف: أ.د. آلاء صغير</p>
              <p className="text-muted-foreground">كلية علوم الحاسب وتقنية المعلومات، جامعة الملك فيصل</p>
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
          <h2 className="text-xl font-bold text-primary">رؤيتنا</h2>
          <p className="text-2xl md:text-3xl font-light italic text-foreground leading-relaxed">
            "إضفاء الطابع الديمقراطي على التحليلات المالية المتقدمة، وتحويل بيانات السوق المعقدة إلى رؤى واضحة وقابلة للتنفيذ للمستثمر المعاصر."
          </p>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
}
