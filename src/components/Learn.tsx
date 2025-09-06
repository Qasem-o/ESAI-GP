import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  TrendingUp, 
  Search, 
  Play, 
  Clock,
  Star,
  BookOpen,
  Trophy,
  Target,
  Users,
  CheckCircle,
  Lock,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Lightbulb
} from "lucide-react";

// Mock learning content data
const courses = [
  {
    id: 1,
    title: "Stock Market Fundamentals",
    description: "Learn the basics of stock market investing, from how markets work to reading financial statements.",
    level: "Beginner",
    duration: "4 hours",
    lessons: 12,
    completed: 8,
    progress: 67,
    rating: 4.8,
    students: 12847,
    instructor: "Sarah Johnson",
    category: "Fundamentals",
    premium: false,
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&h=200"
  },
  {
    id: 2,
    title: "Technical Analysis Mastery",
    description: "Master chart patterns, indicators, and trading strategies used by professional traders.",
    level: "Intermediate",
    duration: "8 hours",
    lessons: 24,
    completed: 0,
    progress: 0,
    rating: 4.9,
    students: 8934,
    instructor: "Michael Chen",
    category: "Technical Analysis",
    premium: true,
    thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&h=200"
  },
  {
    id: 3,
    title: "Options Trading Strategies",
    description: "Comprehensive guide to options trading, from basic calls and puts to advanced strategies.",
    level: "Advanced",
    duration: "6 hours",
    lessons: 18,
    completed: 0,
    progress: 0,
    rating: 4.7,
    students: 5621,
    instructor: "David Kim",
    category: "Options",
    premium: true,
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&h=200"
  },
  {
    id: 4,
    title: "Risk Management Essentials",
    description: "Learn how to protect your capital and manage risk effectively in any market condition.",
    level: "Beginner",
    duration: "3 hours",
    lessons: 10,
    completed: 10,
    progress: 100,
    rating: 4.6,
    students: 9876,
    instructor: "Lisa Wang",
    category: "Risk Management",
    premium: false,
    thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&h=200"
  },
  {
    id: 5,
    title: "Cryptocurrency Fundamentals",
    description: "Understanding blockchain technology, cryptocurrency markets, and digital asset investing.",
    level: "Beginner",
    duration: "5 hours",
    lessons: 15,
    completed: 3,
    progress: 20,
    rating: 4.5,
    students: 7543,
    instructor: "Alex Rodriguez",
    category: "Crypto",
    premium: false,
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&h=200"
  },
  {
    id: 6,
    title: "Portfolio Construction",
    description: "Build diversified portfolios that match your investment goals and risk tolerance.",
    level: "Intermediate",
    duration: "4 hours",
    lessons: 14,
    completed: 0,
    progress: 0,
    rating: 4.8,
    students: 6789,
    instructor: "Emma Thompson",
    category: "Portfolio Management",
    premium: true,
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&h=200"
  }
];

const articles = [
  {
    id: 1,
    title: "Understanding Market Volatility",
    excerpt: "Learn what causes market volatility and how to position your portfolio during turbulent times.",
    readTime: "5 min read",
    category: "Market Analysis",
    author: "John Smith",
    publishedAt: "2 days ago"
  },
  {
    id: 2,
    title: "The Psychology of Trading",
    excerpt: "Explore the mental aspects of trading and common psychological traps that investors fall into.",
    readTime: "8 min read",
    category: "Psychology",
    author: "Dr. Rachel Green",
    publishedAt: "1 week ago"
  },
  {
    id: 3,
    title: "Dividend Investing Strategy",
    excerpt: "Build a sustainable income stream through dividend-paying stocks and REITs.",
    readTime: "6 min read",
    category: "Income Investing",
    author: "Mark Johnson",
    publishedAt: "3 days ago"
  }
];

const glossaryTerms = [
  {
    term: "Bull Market",
    definition: "A market condition where prices are rising or are expected to rise, typically characterized by investor confidence."
  },
  {
    term: "Bear Market",
    definition: "A market condition where prices fall 20% or more from recent highs, often accompanied by widespread pessimism."
  },
  {
    term: "P/E Ratio",
    definition: "Price-to-Earnings ratio - a valuation metric that compares a company's current share price to its earnings per share."
  },
  {
    term: "Market Cap",
    definition: "Market Capitalization - the total value of a company's shares calculated by multiplying share price by number of shares outstanding."
  }
];

const categories = ["All", "Fundamentals", "Technical Analysis", "Options", "Risk Management", "Crypto", "Portfolio Management"];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

interface NavigationProps {
  currentPage: string;
  onGoToHome: () => void;
  onGoToStocks: () => void;
  onGoToPortfolio: () => void;
  onGoToCommunity: () => void;
  onGoToNews: () => void;
  onGoToLearn: () => void;
  onGoToSimulator: () => void;
  onGoToProfile: () => void;
}

interface LearnProps extends NavigationProps {}

export function Learn({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToNews, onGoToLearn, onGoToSimulator, onGoToProfile }: LearnProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "All Levels" || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "Intermediate":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "Advanced":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  const totalCourses = courses.length;
  const completedCourses = courses.filter(course => course.progress === 100).length;
  const inProgressCourses = courses.filter(course => course.progress > 0 && course.progress < 100).length;
  const overallProgress = Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / totalCourses);

  return (
    <div className="min-h-screen bg-background">


      <main className="container mx-auto">
        <div className="py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Learn Trading & Investing</h1>
            <p className="text-muted-foreground">Master the markets with our comprehensive educational resources</p>
          </div>

          {/* Learning Progress Dashboard */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Courses Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{completedCourses}/{totalCourses}</p>
                  <div className="flex items-center gap-1 text-sm text-green-500">
                    <Trophy className="w-4 h-4" />
                    <span>{Math.round((completedCourses / totalCourses) * 100)}% complete</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{inProgressCourses}</p>
                  <p className="text-sm text-muted-foreground">Active courses</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{overallProgress}%</p>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Learning Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">7 days</p>
                  <div className="flex items-center gap-1 text-sm text-orange-500">
                    <Star className="w-4 h-4" />
                    <span>Keep it up!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="glossary" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Glossary
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select 
                  value={selectedLevel} 
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Courses Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="w-full h-48 bg-muted rounded-t-lg overflow-hidden">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {course.premium && (
                        <Badge className="absolute top-2 right-2 bg-primary">
                          Premium
                        </Badge>
                      )}
                      {course.progress > 0 && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <Progress value={course.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getLevelColor(course.level)}>
                              {course.level}
                            </Badge>
                            <Badge variant="secondary">{course.category}</Badge>
                          </div>
                          <h3 className="font-semibold mb-2">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              <span>{course.lessons} lessons</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{course.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{course.students.toLocaleString()} students</span>
                            </div>
                            <span>by {course.instructor}</span>
                          </div>
                          
                          <Button size="sm" className="flex items-center gap-2">
                            {course.progress > 0 ? (
                              course.progress === 100 ? (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Review
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4" />
                                  Continue
                                </>
                              )
                            ) : course.premium ? (
                              <>
                                <Lock className="w-4 h-4" />
                                Upgrade
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Start
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="articles" className="space-y-6">
              <div className="grid gap-6">
                {articles.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{article.category}</Badge>
                              <span className="text-sm text-muted-foreground">{article.readTime}</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                            <p className="text-muted-foreground">{article.excerpt}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <span>by {article.author} • {article.publishedAt}</span>
                          </div>
                          <Button variant="outline" size="sm">
                            Read Article
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="glossary" className="space-y-6">
              <div className="grid gap-4">
                {glossaryTerms.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{item.term}</h3>
                        <p className="text-muted-foreground">{item.definition}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Path Progress</CardTitle>
                    <CardDescription>Track your progress across different learning paths</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categories.slice(1).map((category) => {
                      const categoryCourses = courses.filter(course => course.category === category);
                      const categoryProgress = categoryCourses.length > 0 
                        ? Math.round(categoryCourses.reduce((sum, course) => sum + course.progress, 0) / categoryCourses.length)
                        : 0;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{category}</span>
                            <span className="text-sm text-muted-foreground">{categoryProgress}%</span>
                          </div>
                          <Progress value={categoryProgress} className="h-2" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>Your learning milestones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Trophy className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="font-medium">First Course Completed</p>
                        <p className="text-sm text-muted-foreground">Completed Risk Management Essentials</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <Target className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium">Learning Streak</p>
                        <p className="text-sm text-muted-foreground">7 consecutive days of learning</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg opacity-50">
                      <Star className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Expert Level</p>
                        <p className="text-sm text-muted-foreground">Complete 5 advanced courses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}