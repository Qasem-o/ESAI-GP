import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BookOpen, Target, BarChart2, User, Sparkles } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function EducationalSidebar() {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();

  const articles = [
    {
      id: "platform-guide",
      title: language === "ar" ? "دليل المنصة الشامل" : "Platform Guide",
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      color: "bg-primary/10"
    },
    {
      id: "model-rmse",
      title: language === "ar" ? "مقاييس تقييم الذكاء الاصطناعي" : "AI Model Metrics",
      icon: <Target className="w-4 h-4 text-blue-500" />,
      color: "bg-blue-500/10"
    },
    {
      id: "portfolio-page",
      title: language === "ar" ? "كيفية إدارة محفظتك" : "Managing Portfolio",
      icon: <BarChart2 className="w-4 h-4 text-green-500" />,
      color: "bg-green-500/10"
    },
    {
      id: "profile-page",
      title: language === "ar" ? "أسرار الملف الشخصي" : "Profile Secrets",
      icon: <User className="w-4 h-4 text-purple-500" />,
      color: "bg-purple-500/10"
    }
  ];

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 bg-primary/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          {language === "ar" ? "مركز التعلم" : "Learning Center"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {articles.map((article) => (
          <Button
            key={article.id}
            variant="ghost"
            className={`w-full justify-start gap-3 h-auto py-3 hover:bg-primary/5 transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
            onClick={() => navigate(`/help?article=${article.id}`)}
          >
            <div className={`p-2 rounded-lg ${article.color}`}>
              {article.icon}
            </div>
            <span className="font-medium text-sm line-clamp-1">{article.title}</span>
          </Button>
        ))}
        <Button 
          variant="outline" 
          className="w-full mt-2 border-primary/20 hover:bg-primary/5 text-primary"
          onClick={() => navigate('/help')}
        >
          {language === "ar" ? "عرض جميع المقالات" : "View All Articles"}
        </Button>
      </CardContent>
    </Card>
  );
}
