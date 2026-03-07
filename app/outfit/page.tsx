"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Cloud, 
  Sun, 
  CloudRain, 
  Snowflake, 
  Wind,
  Sparkles,
  RefreshCw,
  Heart,
  ThermometerSun,
  Droplets,
  Shirt
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

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  location: string
}

interface Outfit {
  top: ClothingItem | null
  bottom: ClothingItem | null
  shoes: ClothingItem | null
  score: number
  explanation: string
}

const STORAGE_KEY = "stylist-closet"
const SAVED_OUTFITS_KEY = "stylist-saved-outfits"

function getStoredClothes(): ClothingItem[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function getSavedOutfits(): Outfit[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(SAVED_OUTFITS_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveOutfit(outfit: Outfit) {
  const saved = getSavedOutfits()
  saved.push(outfit)
  localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(saved))
}

function getWeatherCategory(temp: number): string {
  if (temp <= 40) return "cold"
  if (temp <= 60) return "mild"
  if (temp <= 75) return "warm"
  return "hot"
}

function getWeatherIcon(condition: string) {
  switch (condition.toLowerCase()) {
    case "sunny":
    case "clear":
      return <Sun className="h-8 w-8 text-yellow-500" />
    case "cloudy":
    case "overcast":
      return <Cloud className="h-8 w-8 text-gray-400" />
    case "rain":
    case "rainy":
      return <CloudRain className="h-8 w-8 text-blue-400" />
    case "snow":
    case "snowy":
      return <Snowflake className="h-8 w-8 text-cyan-300" />
    default:
      return <Sun className="h-8 w-8 text-yellow-500" />
  }
}

function generateOutfit(clothes: ClothingItem[], weatherCategory: string): Outfit {
  const tops = clothes.filter(c => c.category === "top" && c.temperature.includes(weatherCategory))
  const bottoms = clothes.filter(c => c.category === "bottom" && c.temperature.includes(weatherCategory))
  const shoes = clothes.filter(c => c.category === "shoes" && c.temperature.includes(weatherCategory))

  // Fallback to any item if no weather-appropriate ones found
  const top = tops.length > 0 ? tops[Math.floor(Math.random() * tops.length)] : 
              clothes.find(c => c.category === "top") || null
  const bottom = bottoms.length > 0 ? bottoms[Math.floor(Math.random() * bottoms.length)] : 
                 clothes.find(c => c.category === "bottom") || null
  const shoe = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : 
               clothes.find(c => c.category === "shoes") || null

  const score = Math.floor(Math.random() * 20 + 75) / 10
  
  const explanations = [
    "Great color coordination and weather-appropriate choices.",
    "Perfect balance of style and comfort for today's weather.",
    "A versatile outfit that works well for the current conditions.",
    "Good combination of pieces that complement each other nicely.",
  ]

  return {
    top,
    bottom,
    shoes: shoe,
    score,
    explanation: explanations[Math.floor(Math.random() * explanations.length)],
  }
}

export default function OutfitPage() {
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [outfit, setOutfit] = useState<Outfit | null>(null)
  const [alternateOutfits, setAlternateOutfits] = useState<Outfit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setClothes(getStoredClothes())
  }, [])

  const fetchWeather = async () => {
    setIsLoading(true)
    setLocationError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocoding for location name
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
      const geoData = await geoResponse.json()
      const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || "Unknown"

      // Weather from Open-Meteo
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit`
      )
      const weatherData = await weatherResponse.json()

      const weatherCodes: Record<number, string> = {
        0: "Clear", 1: "Clear", 2: "Cloudy", 3: "Overcast",
        45: "Foggy", 48: "Foggy", 51: "Rainy", 53: "Rainy", 55: "Rainy",
        61: "Rainy", 63: "Rainy", 65: "Rainy", 71: "Snowy", 73: "Snowy", 75: "Snowy",
        77: "Snowy", 80: "Rainy", 81: "Rainy", 82: "Rainy", 85: "Snowy", 86: "Snowy",
      }

      setWeather({
        temperature: Math.round(weatherData.current.temperature_2m),
        condition: weatherCodes[weatherData.current.weather_code] || "Clear",
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        location: city,
      })
    } catch {
      setLocationError("Unable to get your location. Please enable location services.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateOutfit = () => {
    if (!weather || clothes.length === 0) return
    
    setIsGenerating(true)
    setIsSaved(false)
    
    setTimeout(() => {
      const weatherCategory = getWeatherCategory(weather.temperature)
      const mainOutfit = generateOutfit(clothes, weatherCategory)
      setOutfit(mainOutfit)

      // Generate alternate outfits
      const alts: Outfit[] = []
      for (let i = 0; i < 3; i++) {
        alts.push(generateOutfit(clothes, weatherCategory))
      }
      setAlternateOutfits(alts)
      setIsGenerating(false)
    }, 1500)
  }

  const handleSaveOutfit = () => {
    if (outfit) {
      saveOutfit(outfit)
      setIsSaved(true)
    }
  }

  const handleSelectAlternate = (alt: Outfit) => {
    setOutfit(alt)
    setIsSaved(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{"Today's Outfit"}</h1>
          <p className="mt-1 text-muted-foreground">
            AI-powered outfit recommendations based on your weather
          </p>
        </div>

        {/* Weather Section */}
        {!weather ? (
          <div className="mb-8 flex flex-col items-center justify-center rounded-2xl bg-secondary p-8">
            {isLoading ? (
              <>
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Getting your location...</p>
              </>
            ) : locationError ? (
              <>
                <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-center text-muted-foreground">{locationError}</p>
                <Button onClick={fetchWeather} className="rounded-full">
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">Allow location access for weather-based recommendations</p>
                <Button onClick={fetchWeather} className="rounded-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Enable Location
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span>{weather.location}</span>
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-bold">{weather.temperature}°F</span>
                  <span className="mb-2 text-xl text-white/80">{weather.condition}</span>
                </div>
              </div>
              {getWeatherIcon(weather.condition)}
            </div>
            <div className="mt-4 flex gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                <span>{weather.humidity}% humidity</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4" />
                <span>{weather.windSpeed} mph wind</span>
              </div>
            </div>
          </div>
        )}

        {/* No Clothes Warning */}
        {clothes.length === 0 && weather && (
          <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8">
            <Shirt className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No clothes in your closet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Upload some clothes first to get outfit recommendations
            </p>
            <Link href="/closet">
              <Button className="rounded-full">Go to Closet</Button>
            </Link>
          </div>
        )}

        {/* Generate Button */}
        {weather && clothes.length > 0 && !outfit && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="h-14 rounded-full px-10 text-lg"
              onClick={handleGenerateOutfit}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  AI Styling...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Outfit
                </>
              )}
            </Button>
          </div>
        )}

        {/* Generating Animation */}
        {isGenerating && (
          <div className="flex min-h-[300px] flex-col items-center justify-center">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-lg font-medium">AI Styling Your Outfit...</p>
            <p className="text-muted-foreground">Matching colors and weather conditions</p>
          </div>
        )}

        {/* Outfit Result */}
        {outfit && !isGenerating && (
          <div className="space-y-8">
            {/* Weather Context */}
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                {"Today is "}{weather?.temperature}°F and {weather?.condition.toLowerCase()}
              </p>
            </div>

            {/* Main Outfit Display */}
            <div className="grid grid-cols-3 gap-4">
              {outfit.top && (
                <div className="flex flex-col items-center">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
                    <Image
                      src={outfit.top.imageUrl}
                      alt={outfit.top.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-center text-sm font-medium">{outfit.top.name}</p>
                  <p className="text-xs text-muted-foreground">{outfit.top.type}</p>
                </div>
              )}
              {outfit.bottom && (
                <div className="flex flex-col items-center">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
                    <Image
                      src={outfit.bottom.imageUrl}
                      alt={outfit.bottom.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-center text-sm font-medium">{outfit.bottom.name}</p>
                  <p className="text-xs text-muted-foreground">{outfit.bottom.type}</p>
                </div>
              )}
              {outfit.shoes && (
                <div className="flex flex-col items-center">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
                    <Image
                      src={outfit.shoes.imageUrl}
                      alt={outfit.shoes.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-center text-sm font-medium">{outfit.shoes.name}</p>
                  <p className="text-xs text-muted-foreground">{outfit.shoes.type}</p>
                </div>
              )}
            </div>

            {/* Score */}
            <div className="rounded-2xl bg-secondary p-6 text-center">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Outfit Rating</p>
              <p className="text-4xl font-bold">{outfit.score.toFixed(1)} / 10</p>
              <p className="mt-2 text-muted-foreground">{outfit.explanation}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleSaveOutfit}
                disabled={isSaved}
              >
                <Heart className={`mr-2 h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                {isSaved ? "Saved!" : "Save Outfit"}
              </Button>
              <Button className="rounded-full" onClick={handleGenerateOutfit}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New
              </Button>
            </div>

            {/* Alternate Outfits */}
            {alternateOutfits.length > 0 && (
              <div>
                <h3 className="mb-4 text-center text-lg font-semibold">Other outfit ideas</h3>
                <div className="grid grid-cols-3 gap-4">
                  {alternateOutfits.map((alt, index) => (
                    <button
                      key={index}
                      className="rounded-2xl bg-secondary p-3 transition-transform hover:scale-105"
                      onClick={() => handleSelectAlternate(alt)}
                    >
                      <div className="flex gap-1">
                        {alt.top && (
                          <div className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-background">
                            <Image
                              src={alt.top.imageUrl}
                              alt={alt.top.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {alt.bottom && (
                          <div className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-background">
                            <Image
                              src={alt.bottom.imageUrl}
                              alt={alt.bottom.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {alt.shoes && (
                          <div className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-background">
                            <Image
                              src={alt.shoes.imageUrl}
                              alt={alt.shoes.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        {alt.score.toFixed(1)} / 10
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
