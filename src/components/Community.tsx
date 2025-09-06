import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Reply,
  Search,
  Flame,
  Clock,
  Users,
  Plus,
  Filter,
  User
} from "lucide-react";

// Mock community data
const trendingPosts = [
  {
    id: 1,
    title: "NVDA earnings prediction - thoughts?",
    author: "TechTrader_23",
    content: "With NVDA earnings coming up, what are your predictions? I'm seeing strong momentum in AI sector but concerned about valuation.",
    likes: 24,
    dislikes: 3,
    replies: 12,
    timeAgo: "2 hours ago",
    tags: ["NVDA", "Earnings", "AI"],
    category: "Stock Discussion"
  },
  {
    id: 2,
    title: "Market correction incoming?",
    author: "BearishBull",
    content: "Anyone else seeing signs of an upcoming correction? VIX is starting to spike and we're seeing some unusual options activity.",
    likes: 18,
    dislikes: 8,
    replies: 23,
    timeAgo: "4 hours ago",
    tags: ["Market", "Correction", "VIX"],
    category: "Market Analysis"
  },
  {
    id: 3,
    title: "Best AI stocks for long-term hold?",
    author: "AIInvestor2025",
    content: "Looking to build a long-term AI portfolio. Currently considering NVDA, GOOGL, MSFT. What other AI plays should I consider?",
    likes: 31,
    dislikes: 2,
    replies: 18,
    timeAgo: "6 hours ago",
    tags: ["AI", "Long-term", "Portfolio"],
    category: "Investment Strategy"
  },
  {
    id: 4,
    title: "Tesla Q4 results discussion",
    author: "EVEnthusiast",
    content: "Tesla just reported Q4 numbers. Delivery numbers were strong but margins are concerning. What's everyone's take?",
    likes: 15,
    dislikes: 6,
    replies: 34,
    timeAgo: "8 hours ago",
    tags: ["TSLA", "Earnings", "EV"],
    category: "Stock Discussion"
  },
  {
    id: 5,
    title: "Crypto correlation with tech stocks",
    author: "CryptoTechAnalyst",
    content: "Has anyone noticed the increasing correlation between crypto and tech stocks? BTC seems to follow NASDAQ more closely now.",
    likes: 22,
    dislikes: 4,
    replies: 16,
    timeAgo: "12 hours ago",
    tags: ["Crypto", "Tech", "Correlation"],
    category: "Market Analysis"
  }
];

const categories = [
  { name: "All", count: 245 },
  { name: "Stock Discussion", count: 89 },
  { name: "Market Analysis", count: 67 },
  { name: "Investment Strategy", count: 54 },
  { name: "Options Trading", count: 23 },
  { name: "Crypto", count: 12 }
];

const popularTags = ["AAPL", "TSLA", "NVDA", "AI", "Earnings", "Options", "Crypto", "Fed", "Inflation"];

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

interface CommunityProps extends NavigationProps {}

export function Community({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToNews, onGoToLearn, onGoToSimulator, onGoToProfile }: CommunityProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const filteredPosts = trendingPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleNewPost = () => {
    if (newPostTitle.trim() && newPostContent.trim()) {
      // In a real app, this would submit to an API
      console.log("New post:", { title: newPostTitle, content: newPostContent });
      setNewPostTitle("");
      setNewPostContent("");
      setShowNewPost(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">


      <main className="container mx-auto">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold">Community</h1>
              <p className="text-muted-foreground">Share insights and discuss market trends with fellow traders</p>
            </div>
            <Button onClick={() => setShowNewPost(!showNewPost)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          </div>

          {/* New Post Form */}
          {showNewPost && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <Textarea
                  placeholder="What's on your mind? Share your thoughts, analysis, or questions..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleNewPost} disabled={!newPostTitle.trim() || !newPostContent.trim()}>
                    Post
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewPost(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search */}
              <Card>
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search discussions..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.name 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="text-sm">{category.name}</span>
                      <span className="text-xs">{category.count}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    Popular Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => setSearchQuery(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Members</span>
                    <span className="font-medium">12,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Online Now</span>
                    <span className="font-medium text-green-500">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Posts Today</span>
                    <span className="font-medium">89</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="trending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="trending" className="flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    Popular
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="trending" className="space-y-4">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium mb-2">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {post.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                  <span>by {post.author}</span>
                                  <span>{post.timeAgo}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {post.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <ThumbsDown className="w-4 h-4" />
                                {post.dislikes}
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post.replies} replies
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <Reply className="w-4 h-4" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                  {[...filteredPosts].reverse().map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium mb-2">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {post.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                  <span>by {post.author}</span>
                                  <span>{post.timeAgo}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {post.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <ThumbsDown className="w-4 h-4" />
                                {post.dislikes}
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post.replies} replies
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <Reply className="w-4 h-4" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="popular" className="space-y-4">
                  {[...filteredPosts].sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes)).map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium mb-2">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {post.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                  <span>by {post.author}</span>
                                  <span>{post.timeAgo}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {post.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <ThumbsDown className="w-4 h-4" />
                                {post.dislikes}
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post.replies} replies
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <Reply className="w-4 h-4" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}