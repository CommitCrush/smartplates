/**
 * Contact Page - SmartPlates
 * 
 * Professional contact form with validation and direct email submission
 */

'use client';

import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  contactReason: 'support' | 'feedback' | 'partnership' | 'other';
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    contactReason: 'support'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(data.message || 'Message sent successfully!');
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          contactReason: 'support'
        });
        setErrors({});
      } else {
        throw new Error(data.details || data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const contactReasons = [
    { value: 'support', label: 'Technical Support', color: 'bg-primary-100 text-primary-800', icon: '🔧' },
    { value: 'feedback', label: 'Feedback & Suggestions', color: 'bg-success-100 text-success-800', icon: '💡' },
    { value: 'partnership', label: 'Business Partnership', color: 'bg-coral-100 text-coral-800', icon: '🤝' },
    { value: 'other', label: 'Other Inquiries', color: 'bg-neutral-100 text-neutral-800', icon: '💬' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-success-50 to-primary-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-primary-700 max-w-3xl mx-auto">
            We&apos;d love to hear from you! Whether you have questions, feedback, or need support, 
            our team is here to help make your meal planning experience amazing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-primary-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-700">
                  <Mail className="h-5 w-5" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-3">
                  For general inquiries and support
                </p>
                <p className="font-semibold text-primary-900">smartplates.group@gmail.com</p>
                <p className="text-sm text-neutral-500 mt-2 flex items-center">
                  <Clock className="h-4 w-4 inline mr-1" />
                  We typically respond within 24 hours
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-success-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success-700">
                  <MessageSquare className="h-5 w-5" />
                  Quick Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-3">
                  Use our contact form for fastest response
                </p>
                <p className="font-semibold text-success-900">Direct to our team</p>
                <p className="text-sm text-neutral-500 mt-2">
                  All messages are sent directly to SmartPlates
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-coral-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-coral-700">
                  <MapPin className="h-5 w-5" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-3">
                  Making meal planning simple and delicious
                </p>
                <p className="font-semibold text-coral-900">
                  Smart cooking for everyone
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm border-primary-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary-900 flex items-center gap-2">
                  <Send className="h-6 w-6" />
                  Send us a Message
                </CardTitle>
                <p className="text-neutral-600">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                {/* Success/Error Messages */}
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
                    <div className="flex items-center gap-2 text-success-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Message Sent Successfully!</span>
                    </div>
                    <p className="text-success-700 mt-1">{submitMessage}</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">Error Sending Message</span>
                    </div>
                    <p className="text-red-700 mt-1">{submitMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Reason Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      What can we help you with?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {contactReasons.map((reason) => (
                        <button
                          key={reason.value}
                          type="button"
                          onClick={() => handleChange('contactReason', reason.value)}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all duration-200 text-left",
                            formData.contactReason === reason.value
                              ? "border-primary-500 bg-primary-50"
                              : "border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-25"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{reason.icon}</span>
                            <span className="font-medium text-neutral-900">{reason.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={cn(
                          "bg-white border-neutral-200 focus:border-primary-500 focus:ring-primary-500",
                          errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={cn(
                          "bg-white border-neutral-200 focus:border-primary-500 focus:ring-primary-500",
                          errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                        placeholder="Enter your email address"
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className={cn(
                        "bg-white border-neutral-200 focus:border-primary-500 focus:ring-primary-500",
                        errors.subject && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Brief description of your inquiry"
                      disabled={isSubmitting}
                    />
                    {errors.subject && (
                      <p className="text-red-600 text-sm mt-1">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={cn(
                        "bg-white border-neutral-200 focus:border-primary-500 focus:ring-primary-500 min-h-[120px]",
                        errors.message && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                      placeholder="Please provide details about your inquiry..."
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <p className="text-red-600 text-sm mt-1">{errors.message}</p>
                    )}
                    <p className="text-sm text-neutral-500 mt-1">
                      {formData.message.length}/2000 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "w-full bg-coral-500 hover:bg-coral-600 text-white",
                        "px-8 py-4 text-lg shadow-lg rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-coral-300 focus:ring-offset-2",
                        "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-r-transparent rounded-full" />
                          <span>Sending Message...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          <span>Send Message</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-primary-200">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">Why Contact SmartPlates?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span>Get personalized meal planning advice</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span>Report bugs and suggest improvements</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span>Explore partnership opportunities</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}