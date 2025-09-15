/**
 * Social Share Buttons Component
 * 
 * Collection of social media sharing buttons.
 */

'use client';

import React from 'react';
import { Facebook, Twitter, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function SocialShareButtons({ url, title, description }: SocialShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-sky-500 hover:bg-sky-600 text-white'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-green-600 hover:bg-green-700 text-white'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  ];

  const handleShare = (shareUrl: string, platform: string) => {
    if (platform === 'Email') {
      // For email, use the mailto link directly
      window.location.href = shareUrl;
    } else {
      // For social media, open in popup
      const popup = window.open(
        shareUrl,
        `share-${platform.toLowerCase()}`,
        'width=600,height=400,scrollbars=no,resizable=no'
      );
      
      // Close popup after 10 seconds if still open
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close();
        }
      }, 10000);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {shareLinks.map((platform) => {
        const Icon = platform.icon;
        return (
          <Button
            key={platform.name}
            variant="outline"
            className={`${platform.color} border-0`}
            onClick={() => handleShare(platform.url, platform.name)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {platform.name}
          </Button>
        );
      })}
    </div>
  );
}
