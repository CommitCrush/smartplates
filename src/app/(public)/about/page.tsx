/**
 * About Page - SmartPlates
 * 
 * Professional about page showcasing the platform's mission, features, and team
 */

'use client';

import React from 'react';
import { 
  Heart, 
  Users, 
  Target, 
  Award, 
  Zap, 
  Shield, 
  Globe, 
  Sparkles,
  Calendar,
  ChefHat,
  BookOpen,
  Lightbulb,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+', color: 'text-primary-600 dark:text-primary-400' },
    { icon: BookOpen, label: 'Recipe Database', value: '10K+', color: 'text-coral-600 dark:text-coral-400' },
    { icon: Calendar, label: 'Meal Plans Created', value: '100K+', color: 'text-primary-600 dark:text-primary-400' },
    { icon: Award, label: 'User Rating', value: '4.9/5', color: 'text-coral-600 dark:text-coral-400' }
  ];

  const features = [
    {
      icon: ChefHat,
      title: 'Smart Recipe Discovery',
      description: 'AI-powered recommendations based on your preferences, dietary restrictions, and available ingredients.',
      benefits: ['Personalized suggestions', 'Dietary filtering', 'Ingredient-based search']
    },
    {
      icon: Calendar,
      title: 'Intelligent Meal Planning',
      description: 'Weekly meal planning with drag-and-drop calendar, portion control, and automatic grocery list generation.',
      benefits: ['Visual planning interface', 'Automated grocery lists', 'Nutritional tracking']
    },
    {
      icon: Zap,
      title: 'AI Kitchen Assistant',
      description: 'Analyze your fridge contents with AI to get recipe suggestions and reduce food waste.',
      benefits: ['Fridge photo analysis', 'Waste reduction tips', 'Smart substitutions']
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your meal preferences and data are protected with enterprise-grade security measures.',
      benefits: ['Data encryption', 'Privacy controls', 'Secure authentication']
    }
  ];

  const team = [
    {
      name: 'Ese Osagie',
      role: 'Backend & Authentication Lead',
      background: 'Built the project setup, authentication system, and meal planning core. Focused on backend logic, user management, and functionality testing.',
      avatar: '👨‍💻'
    },
    {
      name: 'Rozn Rasho',
      role: 'Frontend & Integration Specialist',
      background: 'Developed the UI foundation, integrated systems, and set up MongoDB to store Spoonacular recipes for faster data access. Focus on UI and frontend integration.',
      avatar: '👩‍💻'
    },
    {
      name: 'Hana Abrham Tekle',
      role: 'API & Data Integration Expert',
      background: 'Implemented the admin dashboard, search & filter features, and Spoonacular API. Created the AI Fridge feature that suggests recipes based on fridge photos.',
      avatar: '👩‍🔬'
    },
    {
      name: 'Balta Garcia',
      role: 'Recipe Management Developer',
      background: 'Handled recipe management and implemented the grocery list integration for automatic shopping lists from saved recipes.',
      avatar: '👨‍🔧'
    },
    {
      name: 'Monika Kaur Choudhary',
      role: 'Project Lead & Quality Assurance',
      background: 'Led the team and managed UI updates, design system rollout, and quality assurance. Ensured consistency and a smooth user experience across the app.',
      avatar: '👩‍💼'
    }
  ];

  const milestones = [
    { year: '2023', event: 'SmartPlates founded with a vision to revolutionize meal planning' },
    { year: '2023', event: 'Launched beta version with 1,000 early adopters' },
    { year: '2024', event: 'AI-powered fridge analysis feature released' },
    { year: '2024', event: 'Reached 50,000+ active users worldwide' },
    { year: '2024', event: 'Partnership with major grocery chains for ingredient delivery' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - SmartPlates Style with Better Contrast */}
      <section className="pt-20 sm:pt-32 md:pt-40 lg:pt-52 pb-10 sm:pb-12 md:pb-16 lg:pb-20 min-h-[80vh] bg-background flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <div className="mb-6 sm:mb-8">
            <Badge className={cn(
              "bg-primary-100 text-primary-800 px-4 py-2 text-sm font-semibold mb-6",
              "dark:bg-primary-900 dark:text-primary-200",
              "shadow-md hover:shadow-lg transition-shadow duration-300"
            )}>
              <Sparkles className="h-4 w-4 mr-2" />
              Revolutionizing Meal Planning
            </Badge>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            About{' '}
            <span className="text-primary-600 dark:text-primary-400">
              SmartPlates
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground-muted max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            We&apos;re on a mission to make healthy eating accessible, enjoyable, and effortless for everyone. 
            Through AI-powered meal planning and intelligent recipe recommendations, we help you discover 
            the joy of cooking while saving time and reducing food waste.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button 
                className={cn(
                  "w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white",
                  "px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl",
                  "min-h-[48px] sm:min-h-[56px] h-auto rounded-lg", 
                  "focus:outline-none focus:ring-2 focus:ring-coral-300 focus:ring-offset-2",
                  "transition-all duration-300 transform hover:scale-105"
                )}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className={cn(
                  "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg",
                  "border-2 border-primary-600 text-primary-600 hover:bg-primary-100 hover:text-primary-700",
                  "dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900 dark:hover:text-primary-300",
                  "min-h-[48px] sm:min-h-[56px] h-auto rounded-lg", 
                  "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2",
                  "transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                )}
              >
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

        {/* Stats Section - SmartPlates Style */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg",
                    "transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                    index % 2 === 0 
                      ? "bg-primary-100 dark:bg-primary-900" 
                      : "bg-coral-100 dark:bg-coral-900"
                  )}>
                    <stat.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${stat.color}`} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors duration-300">{stat.value}</div>
                  <div className="text-sm sm:text-base text-foreground-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section - SmartPlates Style with Better Contrast */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">Our Mission</h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Heart className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary-600 transition-colors duration-300">Promote Healthy Living</h3>
                      <p className="text-foreground-muted">
                        Make nutritious meal planning accessible to everyone, regardless of cooking experience or time constraints.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-coral-100 dark:bg-coral-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-4 w-4 text-coral-600 dark:text-coral-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-coral-600 transition-colors duration-300">Reduce Food Waste</h3>
                      <p className="text-foreground-muted">
                        Help families minimize food waste through smart planning and ingredient optimization.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Globe className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary-600 transition-colors duration-300">Build Community</h3>
                      <p className="text-foreground-muted">
                        Create a global community of food enthusiasts sharing recipes, tips, and culinary discoveries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-primary-600 dark:bg-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
                  <div className="relative">
                    <Lightbulb className="h-10 w-10 sm:h-12 sm:w-12 mb-4 sm:mb-6" />
                    <blockquote className="text-base sm:text-lg italic mb-4">
                      &ldquo;We believe that everyone deserves access to healthy, delicious meals without the stress 
                      of planning and preparation. Technology should make cooking more enjoyable, not more complicated.&rdquo;
                    </blockquote>
                    <cite className="font-semibold">Sarah Chen, Founder & CEO</cite>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - SmartPlates Style with Gradient Cards */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                What Makes <span className="bg-gradient-to-r from-primary-600 to-coral-600 bg-clip-text text-transparent">SmartPlates</span> Special
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-foreground-muted max-w-3xl mx-auto leading-relaxed">
                Our platform combines cutting-edge AI technology with nutritional science to deliver 
                a meal planning experience that&apos;s both intelligent and intuitive.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className={cn(
                  "bg-card border border-border hover:shadow-xl transition-all duration-300 group overflow-hidden",
                  "hover:scale-105 hover:-translate-y-1"
                )}>
                  <div className="absolute inset-0 bg-primary-50/20 dark:bg-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="relative">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg",
                        index % 2 === 0 
                          ? "bg-primary-100 dark:bg-primary-900" 
                          : "bg-coral-100 dark:bg-coral-900"
                      )}>
                        <feature.icon className={cn(
                          "h-5 w-5 transition-colors duration-300",
                          index % 2 === 0 ? "text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300" : "text-coral-600 dark:text-coral-400 group-hover:text-coral-700 dark:group-hover:text-coral-300"
                        )} />
                      </div>
                      <CardTitle className="text-lg sm:text-xl text-foreground group-hover:text-primary-600 transition-colors duration-300">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-foreground-muted mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm group/item">
                          <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400 group-hover/item:text-primary-700 dark:group-hover/item:text-primary-300 transition-colors duration-200" />
                          <span className="text-foreground-muted group-hover/item:text-foreground transition-colors duration-200">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section - SmartPlates Style with Better Contrast */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                Meet Our <span className="bg-gradient-to-r from-primary-600 to-coral-600 bg-clip-text text-transparent">Team</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-foreground-muted max-w-3xl mx-auto leading-relaxed">
                We&apos;re a passionate team of food enthusiasts, technologists, and nutrition experts 
                working together to transform how people plan and prepare meals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
              {team.map((member, index) => (
                <Card key={index} className={cn(
                  "bg-card border border-border text-center hover:shadow-xl transition-all duration-300 group overflow-hidden",
                  "hover:scale-105 hover:-translate-y-2"
                )}>
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    index % 2 === 0 
                      ? "bg-primary-50/30 dark:bg-primary-900/20" 
                      : "bg-coral-50/30 dark:bg-coral-900/20"
                  )}></div>
                  <CardContent className="pt-6 relative">
                    <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{member.avatar}</div>
                    <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">{member.name}</h3>
                    <p className={cn(
                      "font-medium mb-3 transition-colors duration-300",
                      index % 2 === 0 ? "text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300" : "text-coral-600 dark:text-coral-400 group-hover:text-coral-700 dark:group-hover:text-coral-300"
                    )}>{member.role}</p>
                    <p className="text-foreground-muted text-sm leading-relaxed">{member.background}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section - SmartPlates Style with Gradient Timeline */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                Our <span className="text-primary-600 dark:text-primary-400">Journey</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-foreground-muted leading-relaxed">
                From a simple idea to a platform serving thousands of users worldwide.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-primary-200 dark:bg-primary-800"></div>
              
              <div className="space-y-6 sm:space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex items-center group">
                    <div className="flex-shrink-0 w-20 sm:w-24 text-right mr-6 sm:mr-8">
                      <span className={cn(
                        "inline-block text-sm font-semibold px-3 py-1 rounded-full transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg",
                        index % 2 === 0 
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200" 
                          : "bg-coral-100 text-coral-800 dark:bg-coral-900 dark:text-coral-200"
                      )}>
                        {milestone.year}
                      </span>
                    </div>
                    
                    <div className={cn(
                      "absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background transition-all duration-300 group-hover:scale-125 shadow-lg group-hover:shadow-xl",
                      index % 2 === 0 ? "bg-primary-500" : "bg-coral-500"
                    )}></div>
                    
                    <div className="flex-1 ml-6 sm:ml-8">
                      <div className="bg-card border border-border p-4 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                        <div className="absolute inset-0 bg-primary-50/10 dark:bg-primary-900/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <p className="text-foreground relative group-hover:text-primary-600 transition-colors duration-300">{milestone.event}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-primary-600 dark:bg-primary-700 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 leading-tight">Our Core Values</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">Innovation</h3>
                  <p className="text-white/90 leading-relaxed">
                    We continuously push the boundaries of what&apos;s possible in food technology 
                    to create solutions that truly make a difference.
                  </p>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">Community</h3>
                  <p className="text-white/90 leading-relaxed">
                    We believe in the power of community and collaboration to solve 
                    complex challenges around nutrition and sustainability.
                  </p>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <Shield className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">Trust</h3>
                  <p className="text-white/90 leading-relaxed">
                    We prioritize transparency, data security, and user privacy in everything 
                    we do to earn and maintain your trust.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - SmartPlates Style */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background-secondary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Join the <span className="text-primary-600 dark:text-primary-400">SmartPlates</span> Community
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-foreground-muted mb-6 sm:mb-8 leading-relaxed">
              Ready to transform your relationship with food? Join thousands of users who have 
              already discovered the joy of stress-free meal planning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
              <Link href="/register" className="w-full sm:w-auto">
                <Button 
                  className={cn(
                    "w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white",
                    "px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl",
                    "min-h-[48px] sm:min-h-[56px] h-auto rounded-lg", 
                    "focus:outline-none focus:ring-2 focus:ring-coral-300 focus:ring-offset-2",
                    "transition-all duration-300 transform hover:scale-105"
                  )}
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/recipe" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg",
                    "border-2 border-primary-600 text-primary-600 hover:bg-primary-100 hover:text-primary-700",
                    "dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900 dark:hover:text-primary-300",
                    "min-h-[48px] sm:min-h-[56px] h-auto rounded-lg", 
                    "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2",
                    "transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  )}
                >
                  Explore Recipes
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
  );
}
