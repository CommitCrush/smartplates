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
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+', color: 'text-blue-600' },
    { icon: BookOpen, label: 'Community Recipes', value: '10K+', color: 'text-green-600' },
    { icon: Calendar, label: 'Meal Plans Created', value: '100K+', color: 'text-purple-600' },
    { icon: Award, label: 'User Rating', value: '4.9/5', color: 'text-yellow-600' }
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
      name: 'Sarah Chen',
      role: 'Founder & CEO',
      background: 'Former Google product manager with 10+ years in food tech',
      avatar: '👩‍💼'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Head of Engineering',
      background: 'Ex-Uber senior engineer, AI and machine learning expert',
      avatar: '👨‍💻'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Chief Nutritionist',
      background: 'Registered dietitian, PhD in Nutritional Sciences',
      avatar: '👩‍⚕️'
    },
    {
      name: 'Alex Thompson',
      role: 'Head of Design',
      background: 'Former Airbnb designer, UX specialist for food apps',
      avatar: '👨‍🎨'
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
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-semibold mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                Revolutionizing Meal Planning
              </Badge>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                SmartPlates
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              We&apos;re on a mission to make healthy eating accessible, enjoyable, and effortless for everyone. 
              Through AI-powered meal planning and intelligent recipe recommendations, we help you discover 
              the joy of cooking while saving time and reducing food waste.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3">
                <Link href="/register">Start Your Journey</Link>
              </Button>
              <Button variant="outline" asChild className="px-8 py-3">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Promote Healthy Living</h3>
                      <p className="text-gray-600">
                        Make nutritious meal planning accessible to everyone, regardless of cooking experience or time constraints.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Reduce Food Waste</h3>
                      <p className="text-gray-600">
                        Help families minimize food waste through smart planning and ingredient optimization.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Globe className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Build Community</h3>
                      <p className="text-gray-600">
                        Create a global community of food enthusiasts sharing recipes, tips, and culinary discoveries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-8 text-white">
                  <Lightbulb className="h-12 w-12 mb-6" />
                  <blockquote className="text-lg italic mb-4">
                    &ldquo;We believe that everyone deserves access to healthy, delicious meals without the stress 
                    of planning and preparation. Technology should make cooking more enjoyable, not more complicated.&rdquo;
                  </blockquote>
                  <cite className="font-semibold">Sarah Chen, Founder & CEO</cite>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes SmartPlates Special</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Our platform combines cutting-edge AI technology with nutritional science to deliver 
                a meal planning experience that&apos;s both intelligent and intuitive.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-green-200 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-green-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                We&apos;re a passionate team of food enthusiasts, technologists, and nutrition experts 
                working together to transform how people plan and prepare meals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-5xl mb-4">{member.avatar}</div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-green-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.background}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
              <p className="text-gray-600">
                From a simple idea to a platform serving thousands of users worldwide.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-green-200"></div>
              
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex items-center">
                    <div className="flex-shrink-0 w-24 text-right mr-8">
                      <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                        {milestone.year}
                      </span>
                    </div>
                    
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-white"></div>
                    
                    <div className="flex-1 ml-8">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-800">{milestone.event}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">Our Core Values</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-green-50">
                  We continuously push the boundaries of what&apos;s possible in food technology 
                  to create solutions that truly make a difference.
                </p>
              </div>
              
              <div>
                <Users className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Community</h3>
                <p className="text-green-50">
                  We believe in the power of community and collaboration to solve 
                  complex challenges around nutrition and sustainability.
                </p>
              </div>
              
              <div>
                <Shield className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Trust</h3>
                <p className="text-green-50">
                  We prioritize transparency, data security, and user privacy in everything 
                  we do to earn and maintain your trust.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the SmartPlates Community</h2>
            <p className="text-gray-600 text-lg mb-8">
              Ready to transform your relationship with food? Join thousands of users who have 
              already discovered the joy of stress-free meal planning.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3">
                <Link href="/register">Get Started Today</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="px-8 py-3">
                <Link href="/recipe">Explore Recipes</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
  );
}
