"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Cloud, Palette, Upload } from "lucide-react"

const floatingItems = [
  { id: 1, type: "hoodie", color: "#3B82F6", rotation: -15, x: 10, y: 15 },
  { id: 2, type: "jeans", color: "#1E3A5F", rotation: 10, x: 85, y: 20 },
  { id: 3, type: "sneakers", color: "#F5F5F5", rotation: -5, x: 5, y: 60 },
  { id: 4, type: "tshirt", color: "#EF4444", rotation: 20, x: 90, y: 55 },
  { id: 5, type: "jacket", color: "#111111", rotation: -10, x: 15, y: 80 },
  { id: 6, type: "shorts", color: "#D4A574", rotation: 15, x: 80, y: 85 },
]

function ClothingIcon({ type, color }: { type: string; color: string }) {
  const iconStyle = { fill: color, stroke: "#111", strokeWidth: 1.5 }
  
  switch (type) {
    case "hoodie":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <path d="M16 20 L32 12 L48 20 L48 52 L16 52 Z" {...iconStyle} />
          <path d="M24 20 Q32 28 40 20" fill="none" stroke="#111" strokeWidth="2" />
          <path d="M8 24 L16 20 L16 36 L8 32 Z" {...iconStyle} />
          <path d="M56 24 L48 20 L48 36 L56 32 Z" {...iconStyle} />
        </svg>
      )
    case "jeans":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <path d="M18 8 L46 8 L46 16 L44 56 L34 56 L32 40 L30 56 L20 56 L18 16 Z" {...iconStyle} />
        </svg>
      )
    case "sneakers":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <path d="M8 36 L8 44 L56 44 L56 32 L40 32 L32 24 L16 24 L8 36 Z" {...iconStyle} />
          <ellipse cx="32" cy="44" rx="24" ry="4" fill="#E5E5E5" stroke="#111" strokeWidth="1.5" />
        </svg>
      )
    case "tshirt":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <path d="M20 12 L32 8 L44 12 L56 20 L52 28 L44 24 L44 56 L20 56 L20 24 L12 28 L8 20 Z" {...iconStyle} />
          <path d="M28 12 Q32 16 36 12" fill="none" stroke="#111" strokeWidth="2" />
        </svg>
      )
    case "jacket":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <path d="M16 16 L32 8 L48 16 L48 56 L36 56 L36 48 L28 48 L28 56 L16 56 Z" {...iconStyle} />
          <path d="M8 20 L16 16 L16 40 L8 36 Z" {...iconStyle} />
          <path d="M56 20 L48 16 L48 40 L56 36 Z" {...iconStyle} />
          <line x1="32" y1="20" x2="32" y2="48" stroke="#333" strokeWidth="2" />
        </svg>
      )
    case "shorts":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <path d="M16 16 L48 16 L48 24 L44 44 L34 44 L32 32 L30 44 L20 44 L16 24 Z" {...iconStyle} />
        </svg>
      )
    default:
      return null
  }
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Floating Clothing Animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {mounted && floatingItems.map((item, index) => (
          <div
            key={item.id}
            className="absolute h-16 w-16 opacity-20 md:h-20 md:w-20"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `rotate(${item.rotation}deg)`,
              animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
              animationDelay: `${index * 0.3}s`,
            }}
          >
            <ClothingIcon type={item.type} color={item.color} />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <header className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Stylist</span>
        </div>
        <Link href="/auth">
          <Button variant="outline" size="sm" className="rounded-full">
            Sign In
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          AI-Powered Fashion
        </div>

        <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
          Your AI Weather
          <br />
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Outfit Stylist
          </span>
        </h1>

        <p className="mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          Upload your clothes and let AI design outfits based on weather, color matching, and style. 
          Get personalized recommendations every day.
        </p>

        <Link href="/closet">
          <Button size="lg" className="h-12 rounded-full px-8 text-base">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-2xl bg-background p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 transition-transform group-hover:scale-110">
                <Upload className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Upload Your Clothes</h3>
              <p className="text-muted-foreground">
                Take photos of your clothing items to build your digital closet. We'll organize everything for you.
              </p>
            </div>

            <div className="group rounded-2xl bg-background p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-500 transition-transform group-hover:scale-110">
                <Palette className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">AI Understands Style</h3>
              <p className="text-muted-foreground">
                Our AI identifies colors, types, and styles to create perfectly coordinated outfit combinations.
              </p>
            </div>

            <div className="group rounded-2xl bg-background p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-500 transition-transform group-hover:scale-110">
                <Cloud className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Weather-Based Outfits</h3>
              <p className="text-muted-foreground">
                Get daily outfit suggestions that match the weather and look amazing together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Transform Your Wardrobe?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Start building your digital closet today and never wonder what to wear again.
          </p>
          <Link href="/closet">
            <Button size="lg" className="h-12 rounded-full px-8 text-base">
              Build Your Closet
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          Built with AI for smarter styling
        </div>
      </footer>
    </main>
  )
}
