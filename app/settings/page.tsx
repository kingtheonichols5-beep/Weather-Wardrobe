"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { 
  Thermometer, 
  Shirt,
  Trash2,
  BarChart3,
  Cloud,
  CloudOff,
  Loader2
} from "lucide-react"
import { useSettingsSync } from "@/hooks/use-settings-sync"
import { useClosetSync } from "@/hooks/use-closet-sync"
import { useAuth } from "@/components/auth-provider"

const styleOptions = ["Casual", "Streetwear", "Athletic", "Minimal", "Formal", "Rainy", "Beach/Pool", "Comfy"]

export default function SettingsPage() {
  const { user } = useAuth()
  const { 
    settings, 
    isLoading: settingsLoading, 
    isSyncing: settingsSyncing,
    toggleStyle,
    setUnits
  } = useSettingsSync()
  const { 
    clothes, 
    savedOutfits, 
    isLoading: closetLoading,
    isSyncing: closetSyncing 
  } = useClosetSync()

  const isLoading = settingsLoading || closetLoading
  const isSyncing = settingsSyncing || closetSyncing

  const handleClearCloset = () => {
    if (confirm("Are you sure you want to delete all clothes from your closet? This will also clear your local storage.")) {
      localStorage.removeItem("stylist-closet")
      window.location.reload()
    }
  }

  const handleClearSavedOutfits = () => {
    if (confirm("Are you sure you want to delete all saved outfits?")) {
      localStorage.removeItem("stylist-saved-outfits")
      window.location.reload()
    }
  }

  // Calculate closet stats
  const stats = {
    total: clothes.length,
    layers: clothes.filter(c => c.category === "layer").length,
    tops: clothes.filter(c => c.category === "top").length,
    bottoms: clothes.filter(c => c.category === "bottom").length,
    shoes: clothes.filter(c => c.category === "shoes").length,
    accessories: clothes.filter(c => c.category === "accessories").length,
    savedOutfits: savedOutfits.length,
  }

  // Find most common color
  const colorCounts = clothes.reduce((acc, item) => {
    if (item.color && Array.isArray(item.color)) {
      item.color.forEach(c => {
        acc[c] = (acc[c] || 0) + 1
      })
    }
    return acc
  }, {} as Record<string, number>)
  const mostCommonColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          
          {/* Sync Status Indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isLoading || isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Syncing...</span>
              </>
            ) : user ? (
              <>
                <Cloud className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Synced</span>
              </>
            ) : (
              <>
                <CloudOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Local only</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Sync Status Banner */}
          {!user && (
            <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <CloudOff className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Sign in to sync your data</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your closet and settings are currently saved locally. Sign in with Google to sync across devices and never lose your wardrobe.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Closet Stats */}
          <section className="rounded-2xl bg-secondary p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Closet Stats</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-background p-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div className="rounded-xl bg-background p-4 text-center">
                <p className="text-2xl font-bold">{stats.layers}</p>
                <p className="text-sm text-muted-foreground">Layers</p>
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
              <div className="rounded-xl bg-background p-4 text-center">
                <p className="text-2xl font-bold">{stats.accessories}</p>
                <p className="text-sm text-muted-foreground">Accessories</p>
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
                onClick={() => setUnits("fahrenheit")}
              >
                Fahrenheit (°F)
              </Button>
              <Button
                variant={settings.units === "celsius" ? "default" : "outline"}
                className="flex-1 rounded-full"
                onClick={() => setUnits("celsius")}
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
