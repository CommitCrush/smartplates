/**
 * SmartPlates Homepage
 * 
 * Features:
 * - Hero section with call-to-action
 * - Feature highlights
 * - Recipe showcase
 * - Getting started guide
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChefHat, Search, Calendar, ShoppingCart, Users, Star, Clock, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-coral-50 dark:from-primary-950 dark:to-coral-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <ChefHat className="h-16 w-16 text-primary-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Smart<span className="text-primary-600">Plates</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground-muted mb-8 max-w-3xl mx-auto">
              Revolutioniere deine Küchenplanung mit intelligenter Rezeptorganisation, 
              KI-gestützter Analyse und nahtloser Essensplanung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Jetzt starten
                </Button>
              </Link>
              <Link href="/recipe">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Rezepte entdecken
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Alles was du für perfekte Mahlzeiten brauchst
            </h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              SmartPlates vereint moderne Technologie mit traditionellem Kochen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Recipe Discovery */}
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Rezept-Entdeckung</h3>
              <p className="text-foreground-muted">
                Durchsuche tausende von Rezepten mit intelligenten Filtern für Allergien, 
                Kochzeit und verfügbare Zutaten.
              </p>
            </Card>

            {/* Meal Planning */}
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-coral-100 dark:bg-coral-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-coral-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Wochenplanung</h3>
              <p className="text-foreground-muted">
                Plane deine Mahlzeiten für die ganze Woche mit unserem intuitiven 
                Drag-and-Drop Kalender.
              </p>
            </Card>

            {/* Shopping Lists */}
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Einkaufslisten</h3>
              <p className="text-foreground-muted">
                Automatische Einkaufslisten basierend auf deinen geplanten Mahlzeiten 
                mit intelligenter Mengenberechnung.
              </p>
            </Card>

            {/* AI Features */}
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">KI-Unterstützung</h3>
              <p className="text-foreground-muted">
                Lade Fotos deines Kühlschranks hoch und erhalte personalisierte 
                Rezeptvorschläge basierend auf verfügbaren Zutaten.
              </p>
            </Card>

            {/* Community */}
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p className="text-foreground-muted">
                Teile deine eigenen Rezepte, bewerte andere und entdecke 
                kulinarische Inspirationen aus der Community.
              </p>
            </Card>

            {/* Quick & Easy */}
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Schnell & Einfach</h3>
              <p className="text-foreground-muted">
                Finde Rezepte für jede Gelegenheit - von 15-Minuten-Gerichten 
                bis zu aufwendigen Wochenend-Projekten.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Recipes Preview */}
      <section className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Beliebte Rezepte
            </h2>
            <p className="text-lg text-foreground-muted">
              Entdecke was andere Köche gerade zubereiten
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sample Recipe Cards */}
            {[
              {
                title: "Spaghetti Carbonara",
                time: "20 Min",
                difficulty: "Einfach",
                image: "🍝",
                rating: 4.8,
                likes: 234
              },
              {
                title: "Vegetarische Buddha Bowl",
                time: "25 Min",
                difficulty: "Mittel",
                image: "🥗",
                rating: 4.9,
                likes: 189
              },
              {
                title: "Schokoladen-Brownies",
                time: "45 Min",
                difficulty: "Einfach",
                image: "🍫",
                rating: 4.7,
                likes: 312
              }
            ].map((recipe, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary-100 to-coral-100 dark:from-primary-900 dark:to-coral-900 flex items-center justify-center">
                  <span className="text-6xl">{recipe.image}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
                  <div className="flex items-center justify-between text-sm text-foreground-muted mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.time}
                    </div>
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                      {recipe.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="font-medium">{recipe.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-coral-600">
                      <Heart className="h-4 w-4" />
                      <span>{recipe.likes}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/recipe">
              <Button variant="outline" size="lg">
                Alle Rezepte anzeigen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-coral-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bereit für smarteres Kochen?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Schließe dich tausenden von Köchen an, die bereits ihre Küchenplanung 
            revolutioniert haben.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100"
              >
                Kostenlos registrieren
              </Button>
            </Link>
            <Link href="/about">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600"
              >
                Mehr erfahren
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
