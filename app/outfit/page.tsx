"use client"

import { useState, useEffect, useRef } from "react"
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
  Shirt,
  Search,
  Loader2,
  X,
  Calendar,
  Umbrella
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface ClothingItem {
  id: string
  name: string
  category: "layer" | "top" | "bottom" | "shoes"
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

interface ForecastDay {
  date: string
  dayName: string
  high: number
  low: number
  condition: string
  precipitation: number
}

interface Outfit {
  layer: ClothingItem | null
  top: ClothingItem | null
  bottom: ClothingItem | null
  shoes: ClothingItem | null
  score: number
  explanation: string
}

const STORAGE_KEY = "stylist-closet"
const SAVED_OUTFITS_KEY = "stylist-saved-outfits"
const SETTINGS_KEY = "stylist-settings"

interface Settings {
  units: "fahrenheit" | "celsius"
  stylePreference: string[]
  colorPreference: string
}

function getSettings(): Settings {
  if (typeof window === "undefined") return { units: "fahrenheit", stylePreference: [], colorPreference: "" }
  const stored = localStorage.getItem(SETTINGS_KEY)
  return stored ? JSON.parse(stored) : { units: "fahrenheit", stylePreference: [], colorPreference: "" }
}

function fahrenheitToCelsius(f: number): number {
  return Math.round((f - 32) * 5 / 9)
}

function formatTemp(tempF: number, units: "fahrenheit" | "celsius"): string {
  if (units === "celsius") {
    return `${fahrenheitToCelsius(tempF)}°C`
  }
  return `${tempF}°F`
}

function formatTempNumber(tempF: number, units: "fahrenheit" | "celsius"): number {
  if (units === "celsius") {
    return fahrenheitToCelsius(tempF)
  }
  return tempF
}

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

function getClothingRecommendations(high: number, low: number, condition: string, precipitation: number): { layers: string[]; tops: string[]; bottoms: string[]; shoes: string[]; accessories: string[]; tips: string[] } {
  const avgTemp = (high + low) / 2
  const isRainy = condition.toLowerCase().includes("rain")
  const isSnowy = condition.toLowerCase().includes("snow")
  const isCloudy = condition.toLowerCase().includes("cloud") || condition.toLowerCase().includes("overcast")
  
  let layers: string[] = []
  let tops: string[] = []
  let bottoms: string[] = []
  let shoes: string[] = []
  let accessories: string[] = []
  let tips: string[] = []
  
  // Temperature-based recommendations
  if (avgTemp <= 40) {
    layers = ["Heavy winter coat", "Fleece jacket", "Down vest", "Thermal base layer"]
    tops = ["Wool sweater", "Turtleneck", "Thermal shirt"]
    bottoms = ["Insulated pants", "Thick jeans", "Thermal leggings"]
    shoes = ["Insulated boots", "Warm waterproof boots"]
    accessories = ["Warm beanie", "Thick scarf", "Insulated gloves", "Wool socks"]
    tips.push("Layer up to trap body heat effectively")
  } else if (avgTemp <= 55) {
    layers = ["Light jacket", "Hoodie", "Cardigan", "Denim jacket"]
    tops = ["Long-sleeve shirt", "Henley", "Light sweater"]
    bottoms = ["Jeans", "Chinos", "Casual pants"]
    shoes = ["Sneakers", "Ankle boots", "Loafers"]
    accessories = ["Light scarf", "Beanie optional"]
    tips.push("Dress in layers you can easily remove if it warms up")
  } else if (avgTemp <= 70) {
    layers = ["Light cardigan", "Zip-up hoodie", "Overshirt"]
    tops = ["T-shirt", "Light long-sleeve", "Casual button-up"]
    bottoms = ["Jeans", "Chinos", "Light pants", "Skirt"]
    shoes = ["Sneakers", "Casual shoes", "Flats"]
    accessories = ["Sunglasses", "Light jacket for evening"]
    tips.push("Perfect weather for comfortable, versatile outfits")
  } else if (avgTemp <= 85) {
    layers = ["Light linen overshirt", "Thin cardigan (for AC)"]
    tops = ["Light t-shirt", "Tank top", "Linen shirt", "Breathable blouse"]
    bottoms = ["Shorts", "Light pants", "Flowy skirt", "Linen trousers"]
    shoes = ["Sandals", "Breathable sneakers", "Canvas shoes"]
    accessories = ["Sunglasses", "Sun hat", "Light tote bag"]
    tips.push("Opt for breathable, light-colored fabrics")
  } else {
    layers = ["Optional light cover-up for sun protection"]
    tops = ["Loose tank top", "Light linen shirt", "Moisture-wicking top"]
    bottoms = ["Loose shorts", "Flowy skirt", "Linen pants"]
    shoes = ["Open sandals", "Breathable slides"]
    accessories = ["Wide-brim hat", "Sunglasses", "Portable fan"]
    tips.push("Stay cool with loose, breathable clothing and stay hydrated")
  }
  
  // Weather condition adjustments
  if (isRainy || precipitation > 0.1) {
    layers.unshift("Rain jacket", "Waterproof windbreaker")
    shoes = ["Waterproof boots", "Rain boots", "Water-resistant sneakers"]
    accessories.push("Umbrella")
    tips.push(`Expect around ${precipitation.toFixed(2)}" of rain - waterproof layers recommended`)
  }
  
  if (isSnowy) {
    layers.unshift("Waterproof puffer jacket")
    shoes = ["Insulated snow boots", "Waterproof winter boots"]
    accessories.push("Waterproof gloves", "Warm hat")
    tips.push("Wear waterproof outer layers to stay dry in the snow")
  }
  
  if (isCloudy && !isRainy) {
    tips.push("Overcast skies - you might not need sunglasses but keep them handy")
  }
  
  if (condition.toLowerCase() === "clear" || condition.toLowerCase() === "sunny") {
    tips.push("Sunny day ahead - don't forget sun protection")
    accessories.push("Sunscreen")
  }
  
  return { layers, tops, bottoms, shoes, accessories, tips }
}

function getWeatherIcon(condition: string, size: "sm" | "md" = "md") {
  const sizeClass = size === "sm" ? "h-5 w-5" : "h-8 w-8"
  switch (condition.toLowerCase()) {
    case "sunny":
    case "clear":
      return <Sun className={`${sizeClass} text-yellow-500`} />
    case "cloudy":
    case "overcast":
      return <Cloud className={`${sizeClass} text-gray-400`} />
    case "rain":
    case "rainy":
      return <CloudRain className={`${sizeClass} text-blue-400`} />
    case "snow":
    case "snowy":
      return <Snowflake className={`${sizeClass} text-cyan-300`} />
    case "foggy":
      return <Cloud className={`${sizeClass} text-gray-300`} />
    default:
      return <Sun className={`${sizeClass} text-yellow-500`} />
  }
}

// Maps style preferences to clothing attributes (fit, type, condition)
function getStyleMatchScore(item: ClothingItem, stylePreferences: string[]): number {
  if (stylePreferences.length === 0) return 0
  
  let score = 0
  const itemFit = item.fit?.toLowerCase() || ""
  const itemType = item.type?.toLowerCase() || ""
  const itemCondition = (item as ClothingItem & { condition?: string }).condition?.toLowerCase() || ""
  
  for (const style of stylePreferences) {
    const styleLower = style.toLowerCase()
    
    switch (styleLower) {
      case "casual":
        if (itemCondition === "casual") score += 3
        if (itemFit === "regular" || itemFit === "oversized") score += 1
        if (itemType.includes("t-shirt") || itemType.includes("jeans") || itemType.includes("sneakers")) score += 2
        break
      case "formal":
        if (itemCondition === "formal") score += 3
        if (itemFit === "fitted" || itemFit === "regular") score += 1
        if (itemType.includes("dress") || itemType.includes("blazer") || itemType.includes("oxford") || itemType.includes("loafers")) score += 2
        break
      case "athletic":
        if (itemCondition === "athletic") score += 3
        if (itemType.includes("athletic") || itemType.includes("running") || itemType.includes("sport")) score += 2
        break
      case "streetwear":
        if (itemFit === "oversized" || itemFit === "baggy") score += 2
        if (itemType.includes("hoodie") || itemType.includes("sneakers") || itemType.includes("joggers")) score += 2
        break
      case "minimal":
        if (itemFit === "fitted" || itemFit === "regular") score += 1
        // Prefer neutral/simple pieces - basic types score higher
        if (itemType.includes("t-shirt") || itemType.includes("jeans") || itemType.includes("chinos")) score += 1
        break
      case "bohemian":
        if (itemFit === "oversized" || itemFit === "regular") score += 1
        if (itemCondition === "comfy" || itemCondition === "casual") score += 1
        if (itemType.includes("flowy") || itemType.includes("maxi") || itemType.includes("cardigan")) score += 2
        break
    }
  }
  
  return score
}

function selectItemWithStylePriority(
  items: ClothingItem[], 
  stylePreferences: string[],
  usedIds: Set<string> = new Set()
): ClothingItem | null {
  if (items.length === 0) return null
  
  // Filter out already used items
  const availableItems = items.filter(item => !usedIds.has(item.id))
  if (availableItems.length === 0) return items[Math.floor(Math.random() * items.length)]
  
  if (stylePreferences.length === 0) {
    // No style preferences - pick randomly
    return availableItems[Math.floor(Math.random() * availableItems.length)]
  }
  
  // Score each item based on style preferences
  const scoredItems = availableItems.map(item => ({
    item,
    score: getStyleMatchScore(item, stylePreferences)
  }))
  
  // Sort by score descending
  scoredItems.sort((a, b) => b.score - a.score)
  
  // Get items with the highest score
  const maxScore = scoredItems[0].score
  const topItems = scoredItems.filter(s => s.score === maxScore)
  
  // Pick randomly from top scoring items
  return topItems[Math.floor(Math.random() * topItems.length)].item
}

function generateOutfit(clothes: ClothingItem[], weatherCategory: string, stylePreferences: string[] = []): Outfit {
  const layers = clothes.filter(c => c.category === "layer" && c.temperature.includes(weatherCategory))
  const tops = clothes.filter(c => c.category === "top" && c.temperature.includes(weatherCategory))
  const bottoms = clothes.filter(c => c.category === "bottom" && c.temperature.includes(weatherCategory))
  const shoes = clothes.filter(c => c.category === "shoes" && c.temperature.includes(weatherCategory))

  const usedIds = new Set<string>()

  // Fallback to any item if no weather-appropriate ones found
  // Layer is optional - only include if weather calls for it (cold or mild)
  const needsLayer = weatherCategory === "cold" || weatherCategory === "mild"
  let layer: ClothingItem | null = null
  if (needsLayer) {
    layer = layers.length > 0 
      ? selectItemWithStylePriority(layers, stylePreferences, usedIds) 
      : clothes.find(c => c.category === "layer") || null
    if (layer) usedIds.add(layer.id)
  }
  
  const top = tops.length > 0 
    ? selectItemWithStylePriority(tops, stylePreferences, usedIds) 
    : clothes.find(c => c.category === "top") || null
  if (top) usedIds.add(top.id)
  
  const bottom = bottoms.length > 0 
    ? selectItemWithStylePriority(bottoms, stylePreferences, usedIds) 
    : clothes.find(c => c.category === "bottom") || null
  if (bottom) usedIds.add(bottom.id)
  
  const shoe = shoes.length > 0 
    ? selectItemWithStylePriority(shoes, stylePreferences, usedIds) 
    : clothes.find(c => c.category === "shoes") || null

  // Calculate a score based on how well items match style preferences
  const matchedItems = [layer, top, bottom, shoe].filter(Boolean) as ClothingItem[]
  const totalStyleScore = matchedItems.reduce((sum, item) => sum + getStyleMatchScore(item, stylePreferences), 0)
  const baseScore = 7.5 + (Math.random() * 2)
  const styleBonus = stylePreferences.length > 0 && matchedItems.length > 0 
    ? Math.min(2, totalStyleScore / matchedItems.length * 0.3) 
    : 0
  const score = Math.min(10, Math.round((baseScore + styleBonus) * 10) / 10)
  
  const explanations = stylePreferences.length > 0 && totalStyleScore > 0
    ? [
        `Great choices that match your ${stylePreferences.join(" & ").toLowerCase()} style preferences.`,
        `Outfit curated based on your ${stylePreferences[0].toLowerCase()} style preference.`,
        `This combination reflects your preferred ${stylePreferences.join(", ").toLowerCase()} aesthetic.`,
      ]
    : [
        "Great color coordination and weather-appropriate choices.",
        "Perfect balance of style and comfort for today's weather.",
        "A versatile outfit that works well for the current conditions.",
        "Good combination of pieces that complement each other nicely.",
      ]

  return {
    layer,
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
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [outfit, setOutfit] = useState<Outfit | null>(null)
  const [alternateOutfits, setAlternateOutfits] = useState<Outfit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ name: string; country: string; state?: string; lat: number; lon: number }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null)
  const [outfitDay, setOutfitDay] = useState<ForecastDay | null>(null)
  const [settings, setSettings] = useState<Settings>({ units: "fahrenheit", stylePreference: [], colorPreference: "" })

  useEffect(() => {
    setClothes(getStoredClothes())
    setSettings(getSettings())
  }, [])

  const weatherCodes: Record<number, string> = {
    0: "Clear", 1: "Clear", 2: "Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Foggy", 51: "Rainy", 53: "Rainy", 55: "Rainy",
    61: "Rainy", 63: "Rainy", 65: "Rainy", 71: "Snowy", 73: "Snowy", 75: "Snowy",
    77: "Snowy", 80: "Rainy", 81: "Rainy", 82: "Rainy", 85: "Snowy", 86: "Snowy",
  }

  const getDayName = (dateString: string, index: number): string => {
    if (index === 0) return "Today"
    if (index === 1) return "Tomorrow"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  const fetchWeatherByCoords = async (latitude: number, longitude: number, cityName?: string) => {
    setIsLoading(true)
    setLocationError(null)
    setShowLocationSearch(false)
    setSearchQuery("")
    setSearchResults([])

    try {
      const city = cityName || "Your Location"

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&forecast_days=10&timezone=auto`
      )
      
      if (!weatherResponse.ok) {
        throw new Error("Weather API error")
      }
      
      const weatherData = await weatherResponse.json()

      setWeather({
        temperature: Math.round(weatherData.current.temperature_2m),
        condition: weatherCodes[weatherData.current.weather_code] || "Clear",
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        location: city,
      })

      // Parse 10-day forecast
      const forecastDays: ForecastDay[] = weatherData.daily.time.map((date: string, index: number) => ({
        date,
        dayName: getDayName(date, index),
        high: Math.round(weatherData.daily.temperature_2m_max[index]),
        low: Math.round(weatherData.daily.temperature_2m_min[index]),
        condition: weatherCodes[weatherData.daily.weather_code[index]] || "Clear",
        precipitation: weatherData.daily.precipitation_sum[index],
      }))
      setForecast(forecastDays)
    } catch {
      setLocationError("Unable to fetch weather data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

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
      await fetchWeatherByCoords(latitude, longitude)
    } catch {
      setLocationError("Unable to get your location. Please enable location services.")
      setIsLoading(false)
    }
  }

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      // Using Open-Meteo geocoding API instead of Nominatim
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      )
      
      if (!response.ok) {
        throw new Error("Geocoding API error")
      }
      
      const data = await response.json()
      
      if (!data.results) {
        setSearchResults([])
        return
      }
      
      const results = data.results.map((item: { name: string; country: string; admin1?: string; latitude: number; longitude: number }) => ({
        name: item.name,
        country: item.country || "",
        state: item.admin1,
        lat: item.latitude,
        lon: item.longitude,
      }))
      setSearchResults(results)
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value)
    }, 300)
  }

  const selectLocation = (result: { name: string; lat: number; lon: number }) => {
    fetchWeatherByCoords(result.lat, result.lon, result.name)
  }

  const handleGenerateOutfit = () => {
    if (!weather || clothes.length === 0) return
    
    setIsGenerating(true)
    setIsSaved(false)
    setOutfitDay(null)
    
setTimeout(() => {
  const weatherCategory = getWeatherCategory(weather.temperature)
const mainOutfit = generateOutfit(clothes, weatherCategory, settings.stylePreference)
  setOutfit(mainOutfit)
  
  // Generate alternate outfits
  const alts: Outfit[] = []
  for (let i = 0; i < 3; i++) {
alts.push(generateOutfit(clothes, weatherCategory, settings.stylePreference))
  }
  setAlternateOutfits(alts)
  setIsGenerating(false)
  }, 1500)
  }

  const handleGenerateOutfitForDay = (day: ForecastDay) => {
    if (clothes.length === 0) return
    
    setIsGenerating(true)
    setIsSaved(false)
    setSelectedDay(null)
    setOutfitDay(day)
    
setTimeout(() => {
  const avgTemp = (day.high + day.low) / 2
  const weatherCategory = getWeatherCategory(avgTemp)
const mainOutfit = generateOutfit(clothes, weatherCategory, settings.stylePreference)
  setOutfit(mainOutfit)
  
  // Generate alternate outfits
  const alts: Outfit[] = []
  for (let i = 0; i < 3; i++) {
alts.push(generateOutfit(clothes, weatherCategory, settings.stylePreference))
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
              <div className="flex flex-col items-center gap-4">
                <MapPin className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Allow location access for weather-based recommendations</p>
                <Button onClick={fetchWeather} className="rounded-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Enable Location
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={() => setShowLocationSearch(!showLocationSearch)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Select a Location
                </Button>

                {showLocationSearch && (
                  <div className="relative w-full max-w-sm">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search for a city..."
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        className="h-12 rounded-full border-border bg-background pl-11 pr-4"
                        autoFocus
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    {searchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
                        {searchResults.map((result, index) => (
                          <button
                            key={`${result.lat}-${result.lon}-${index}`}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary"
                            onClick={() => selectLocation(result)}
                          >
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{result.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {result.state ? `${result.state}, ` : ""}{result.country}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                  <span className="text-5xl font-bold">{formatTemp(weather.temperature, settings.units)}</span>
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

        {/* 10-Day Forecast */}
        {forecast.length > 0 && (
          <div className="mb-8 rounded-2xl bg-secondary p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <ThermometerSun className="h-5 w-5" />
              10-Day Forecast
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">Click on a day for detailed recommendations</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {forecast.map((day, index) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(day)}
                  className={`flex min-w-[90px] cursor-pointer flex-col items-center rounded-xl p-3 transition-all hover:scale-105 hover:shadow-md ${
                    index === 0 ? "bg-primary/10 ring-2 ring-primary" : "bg-background hover:bg-background/80"
                  } ${selectedDay?.date === day.date ? "ring-2 ring-foreground" : ""}`}
                >
                  <span className={`text-sm font-medium ${index === 0 ? "text-primary" : ""}`}>
                    {day.dayName}
                  </span>
                  <div className="my-2">
                    {getWeatherIcon(day.condition, "sm")}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-semibold">{formatTempNumber(day.high, settings.units)}°</span>
                    <span className="text-muted-foreground">{formatTempNumber(day.low, settings.units)}°</span>
                  </div>
                  {day.precipitation > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-blue-500">
                      <Droplets className="h-3 w-3" />
                      <span>{day.precipitation.toFixed(2)}"</span>
                    </div>
                  )}
                  <span className="mt-1 text-xs text-muted-foreground">{day.condition}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Day Detail Modal */}
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedDay(null)}>
            <div 
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedDay.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                  </div>
                  <h2 className="mt-1 text-2xl font-bold">{selectedDay.dayName} Weather</h2>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="rounded-full p-2 hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Weather Overview */}
              <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(selectedDay.condition)}
                      <span className="text-xl font-medium">{selectedDay.condition}</span>
                    </div>
                    <div className="mt-3 flex items-end gap-4">
                      <div>
                        <span className="text-sm text-white/70">High</span>
                        <p className="text-3xl font-bold">{formatTemp(selectedDay.high, settings.units)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-white/70">Low</span>
                        <p className="text-3xl font-bold">{formatTemp(selectedDay.low, settings.units)}</p>
                      </div>
                    </div>
                  </div>
                  {selectedDay.precipitation > 0 && (
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Umbrella className="h-5 w-5" />
                        <span className="text-lg font-medium">Precipitation</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold">{selectedDay.precipitation.toFixed(2)}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Outfit Button */}
              <div className="mb-6">
                <Button 
                  onClick={() => handleGenerateOutfitForDay(selectedDay)}
                  disabled={clothes.length === 0 || isGenerating}
                  className="w-full rounded-full bg-black py-6 text-white hover:bg-black/90"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate an outfit for this day
                    </>
                  )}
                </Button>
              </div>

              {/* Clothing Recommendations */}
              {(() => {
                const recs = getClothingRecommendations(selectedDay.high, selectedDay.low, selectedDay.condition, selectedDay.precipitation)
                return (
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold">What to Wear</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-secondary p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-medium">
                          <span className="text-base">🧥</span>
                          Layers
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {recs.layers.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl bg-secondary p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-medium">
                          <Shirt className="h-4 w-4" />
                          Tops
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {recs.tops.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl bg-secondary p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-medium">
                          <span className="text-base">👖</span>
                          Bottoms
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {recs.bottoms.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl bg-secondary p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-medium">
                          <span className="text-base">👟</span>
                          Footwear
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {recs.shoes.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl bg-secondary p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-medium">
                          <span className="text-base">🎒</span>
                          Accessories
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {recs.accessories.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Tips */}
                    {recs.tips.length > 0 && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <h4 className="mb-2 font-medium text-primary">Style Tips</h4>
                        <ul className="space-y-2 text-sm">
                          {recs.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })()}

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedDay(null)} variant="outline" className="rounded-full">
                  Close
                </Button>
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
                {outfitDay 
                    ? `${outfitDay.dayName} will be ${formatTemp(outfitDay.high, settings.units)} / ${formatTemp(outfitDay.low, settings.units)} and ${outfitDay.condition.toLowerCase()}`
                    : `Today is ${weather ? formatTemp(weather.temperature, settings.units) : ""} and ${weather?.condition.toLowerCase()}`}
              </p>
            </div>

            {/* Main Outfit Display */}
            <div className={`grid gap-4 ${outfit.layer ? "grid-cols-4" : "grid-cols-3"}`}>
              {outfit.layer && (
                <div className="flex flex-col items-center">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary ring-2 ring-primary/20">
                    <Image
                      src={outfit.layer.imageUrl}
                      alt={outfit.layer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-center text-sm font-medium">{outfit.layer.name}</p>
                  <p className="text-xs text-muted-foreground">{outfit.layer.type}</p>
                  <span className="mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Layer</span>
                </div>
              )}
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
