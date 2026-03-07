"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Thermometer, 
  Shirt,
  Palette,
  Trash2,
  Check,
  BarChart3
} from "lucide-react"

interface ClothingItem {
  id: string
  name: string
  category: "top" | "bottom" | "shoes"
  type: string
  color: string
  fit: string
  temperature: string[]
  imageUrl: string
}

interface Settings {
  units: "fahrenheit" | "celsius"
  stylePreference: string[]
  colorPreference: string
}

interface Outfit {
  top: ClothingItem | null
  bottom: ClothingItem | null
  shoes: ClothingItem | null
  score: number
  explanation: string
}

const STORAGE_KEY = "stylist-closet"
const SETTINGS_KEY = "stylist-settings"
const SAVED_OUTFITS_KEY = "stylist-saved-outfits"

function getStoredClothes(): ClothingItem[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function getSettings(): Settings {
  if (typeof window === "undefined") return { units: "fahrenheit", stylePreference: [], colorPreference: "" }
  const stored = localStorage.getItem(SETTINGS_KEY)
  return stored ? JSON.parse(stored) : { units: "fahrenheit", stylePreference: [], colorPreference: "" }
}

function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function getSavedOutfits(): Outfit[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(SAVED_OUTFITS_KEY)
  return stored ? JSON.parse(stored) : []
}

const styleOptions = ["Casual", "Streetwear", "Athletic", "Minimal", "Formal", "Bohemian"]
const colorPreferences = [
  { value: "neutral", label: "Neutral tones" },
  { value: "bold", label: "Bold colors" },
  { value: "pastel", label: "Pastel colors" },
  { value: "dark", label: "Dark colors" },
  { value: "any", label: "No preference" },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => getSettings())
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setClothes(getStoredClothes())
    setSavedOutfits(getSavedOutfits())
  }, [])

  const handleSaveSettings = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleStyle = (style: string) => {
    setSettings(prev => ({
      ...prev,
      stylePreference: prev.stylePreference.includes(style)
        ? prev.stylePreference.filter(s => s !== style)
        : [...prev.stylePreference, style]
    }))
  }

  const handleClearCloset = () => {
    if (confirm("Are you sure you want to delete all clothes from your closet?")) {
      localStorage.removeItem(STORAGE_KEY)
      setClothes([])
    }
  }

  const handleClearSavedOutfits = () => {
    if (confirm("Are you sure you want to delete all saved outfits?")) {
      localStorage.removeItem(SAVED_OUTFITS_KEY)
      setSavedOutfits([])
    }
  }

  // Calculate closet stats
  const stats = {
    total: clothes.length,
    tops: clothes.filter(c => c.category === "top").length,
    bottoms: clothes.filter(c => c.category === "bottom").length,
    shoes: clothes.filter(c => c.category === "shoes").length,
    savedOutfits: savedOutfits.length,
  }

  // Find most common color
  const colorCounts = clothes.reduce((acc, item) => {
    acc[item.color] = (acc[item.color] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const mostCommonColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Settings</h1>

        <div className="space-y-8">
          {/* Closet Stats */}
          <section className="rounded-2xl bg-secondary p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Closet Stats</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-background p-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div className="rounded-xl bg-background p-4 text-center">
                <p className="text-2xl font-bold">{stats.tops}</p>
                <p className="text-sm text-muted-foreground">Tops</p>
              </div>
              <div className="rounded-xl bg-background p-4 text-center">
                <p className="text-2xl font-bold">{stats.bottoms}</p>
                <p className="text-sm text-muted-foreground">Bottoms</p>
              </div>
              <div className="rounded-xl bg-background p-4 text-center">
                <p className="text-2xl font-bold">{stats.shoes}</p>
                <p className="text-sm text-muted-foreground">Shoes</p>
              </div>
            </div>

            {clothes.length > 0 && (
              <div className="mt-4 rounded-xl bg-background p-4">
                <p className="text-sm text-muted-foreground">
                  AI Insight: You wear <span className="font-medium capitalize text-foreground">{mostCommonColor}</span> often. 
                  Consider adding more variety!
                </p>
              </div>
            )}
          </section>

          {/* Units */}
          <section className="rounded-2xl border border-border p-6">
            <div className="mb-4 flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Temperature Units</h2>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant={settings.units === "fahrenheit" ? "default" : "outline"}
                className="flex-1 rounded-full"
                onClick={() => {
                  const updated = { ...settings, units: "fahrenheit" as const }
                  setSettings(updated)
                  saveSettings(updated)
                }}
              >
                Fahrenheit (°F)
              </Button>
              <Button
                variant={settings.units === "celsius" ? "default" : "outline"}
                className="flex-1 rounded-full"
                onClick={() => {
                  const updated = { ...settings, units: "celsius" as const }
                  setSettings(updated)
                  saveSettings(updated)
                }}
              >
                Celsius (°C)
              </Button>
            </div>
          </section>

          {/* Style Preferences */}
          <section className="rounded-2xl border border-border p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shirt className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Style Preferences</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Select styles you prefer for outfit recommendations
            </p>
            
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((style) => (
                <button
                  key={style}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    settings.stylePreference.includes(style)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  onClick={() => toggleStyle(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </section>

          {/* Color Preferences */}
          <section className="rounded-2xl border border-border p-6">
            <div className="mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Color Preferences</h2>
            </div>
            
            <div className="space-y-2">
              {colorPreferences.map((pref) => (
                <button
                  key={pref.value}
                  className={`flex w-full items-center justify-between rounded-xl p-4 text-left transition-colors ${
                    settings.colorPreference === pref.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                  onClick={() => setSettings(prev => ({ ...prev, colorPreference: pref.value }))}
                >
                  <span className="font-medium">{pref.label}</span>
                  {settings.colorPreference === pref.value && <Check className="h-5 w-5" />}
                </button>
              ))}
            </div>
          </section>

          {/* Save Button */}
          <Button 
            className="w-full rounded-full" 
            size="lg"
            onClick={handleSaveSettings}
          >
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save Settings"
            )}
          </Button>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-destructive">Danger Zone</h2>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleClearSavedOutfits}
                disabled={savedOutfits.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Saved Outfits ({savedOutfits.length})
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleClearCloset}
                disabled={clothes.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Clothes ({clothes.length})
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
