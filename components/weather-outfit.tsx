"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  Loader2,
  Shirt,
  Footprints,
  Palette,
  Lightbulb,
  CloudSun,
  CloudFog,
  CloudLightning,
  ChevronRight,
  Check,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Clothing data organized by category and gender-specific items
const CLOTHING_DATA = {
  tops: {
    label: "Tops",
    items: [
      { id: "tshirt", name: "T-shirt", gender: "all" },
      { id: "graphic-tshirt", name: "Graphic T-shirt", gender: "all" },
      { id: "longsleeve", name: "Long sleeve shirt", gender: "all" },
      { id: "buttonup", name: "Button-up shirt", gender: "all" },
      { id: "flannel", name: "Flannel shirt", gender: "all" },
      { id: "polo", name: "Polo shirt", gender: "all" },
      { id: "tanktop", name: "Tank top", gender: "all" },
      { id: "sleeveless", name: "Sleeveless shirt", gender: "all" },
      { id: "croptop", name: "Crop top", gender: "female" },
      { id: "tubetop", name: "Tube top", gender: "female" },
      { id: "athletic-shirt", name: "Athletic shirt", gender: "all" },
      { id: "compression", name: "Compression shirt", gender: "male" },
      { id: "sweater", name: "Sweater", gender: "all" },
      { id: "turtleneck", name: "Turtleneck", gender: "all" },
      { id: "sweatshirt", name: "Sweatshirt", gender: "all" },
      { id: "hoodie", name: "Hoodie", gender: "all" },
      { id: "zipup-hoodie", name: "Zip-up hoodie", gender: "all" },
      { id: "cardigan", name: "Cardigan", gender: "all" },
      { id: "henley", name: "Henley shirt", gender: "all" },
      { id: "thermal", name: "Thermal shirt", gender: "all" },
    ],
  },
  bottoms: {
    label: "Bottoms",
    items: [
      { id: "jeans", name: "Jeans", gender: "all" },
      { id: "skinny-jeans", name: "Skinny jeans", gender: "all" },
      { id: "baggy-jeans", name: "Baggy jeans", gender: "all" },
      { id: "sweatpants", name: "Sweatpants", gender: "all" },
      { id: "joggers", name: "Joggers", gender: "all" },
      { id: "cargo-pants", name: "Cargo pants", gender: "all" },
      { id: "khakis", name: "Khakis", gender: "all" },
      { id: "chinos", name: "Chinos", gender: "all" },
      { id: "athletic-shorts", name: "Athletic shorts", gender: "all" },
      { id: "denim-shorts", name: "Denim shorts", gender: "all" },
      { id: "casual-shorts", name: "Casual shorts", gender: "all" },
      { id: "running-shorts", name: "Running shorts", gender: "all" },
      { id: "bike-shorts", name: "Bike shorts", gender: "female" },
      { id: "leggings", name: "Leggings", gender: "female" },
      { id: "yoga-pants", name: "Yoga pants", gender: "female" },
      { id: "skirt", name: "Skirt", gender: "female" },
      { id: "tennis-skirt", name: "Tennis skirt", gender: "female" },
      { id: "sundress", name: "Sundress", gender: "female" },
    ],
  },
  outerwear: {
    label: "Outerwear",
    items: [
      { id: "jacket", name: "Jacket", gender: "all" },
      { id: "light-jacket", name: "Light jacket", gender: "all" },
      { id: "windbreaker", name: "Windbreaker", gender: "all" },
      { id: "rain-jacket", name: "Rain jacket", gender: "all" },
      { id: "puffer", name: "Puffer jacket", gender: "all" },
      { id: "winter-coat", name: "Winter coat", gender: "all" },
      { id: "parka", name: "Parka", gender: "all" },
      { id: "denim-jacket", name: "Denim jacket", gender: "all" },
      { id: "bomber", name: "Bomber jacket", gender: "all" },
      { id: "trench", name: "Trench coat", gender: "all" },
      { id: "fleece", name: "Fleece jacket", gender: "all" },
    ],
  },
  shoes: {
    label: "Shoes",
    items: [
      { id: "sneakers", name: "Sneakers", gender: "all" },
      { id: "running-shoes", name: "Running shoes", gender: "all" },
      { id: "athletic-shoes", name: "Athletic shoes", gender: "all" },
      { id: "boots", name: "Boots", gender: "all" },
      { id: "winter-boots", name: "Winter boots", gender: "all" },
      { id: "sandals", name: "Sandals", gender: "all" },
      { id: "slides", name: "Slides", gender: "all" },
      { id: "flipflops", name: "Flip-flops", gender: "all" },
      { id: "loafers", name: "Loafers", gender: "all" },
    ],
  },
  accessories: {
    label: "Accessories",
    items: [
      { id: "hat", name: "Hat", gender: "all" },
      { id: "beanie", name: "Beanie", gender: "all" },
      { id: "baseball-cap", name: "Baseball cap", gender: "all" },
      { id: "sunglasses", name: "Sunglasses", gender: "all" },
      { id: "scarf", name: "Scarf", gender: "all" },
      { id: "gloves", name: "Gloves", gender: "all" },
    ],
  },
}

type Gender = "male" | "female" | null
type Step = "gender" | "wardrobe" | "location" | "result"

interface WeatherData {
  temp: number
  feelsLike: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
  main: string
}

interface OutfitRecommendation {
  summary: string
  top: string
  bottom: string
  footwear: string
  outerwear: string | null
  accessories: string[]
  tips: string
  colorPalette: string[]
}

interface LocationData {
  city: string
  country: string
  lat: number
  lon: number
}

export function WeatherOutfit() {
  const [step, setStep] = useState<Step>("gender")
  const [gender, setGender] = useState<Gender>(null)
  const [wardrobe, setWardrobe] = useState<Set<string>>(new Set())
  const [location, setLocation] = useState<LocationData | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [outfit, setOutfit] = useState<OutfitRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [outfitLoading, setOutfitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamedText, setStreamedText] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("tops")

  const getWeatherIcon = (main: string) => {
    const iconProps = { className: "w-16 h-16 text-foreground" }
    switch (main.toLowerCase()) {
      case "clear":
        return <Sun {...iconProps} />
      case "clouds":
        return <Cloud {...iconProps} />
      case "rain":
      case "drizzle":
        return <CloudRain {...iconProps} />
      case "snow":
        return <Snowflake {...iconProps} />
      case "thunderstorm":
        return <CloudLightning {...iconProps} />
      case "mist":
      case "fog":
      case "haze":
        return <CloudFog {...iconProps} />
      default:
        return <CloudSun {...iconProps} />
    }
  }

  const fetchWeather = async (lat: number, lon: number) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`
    )
    const data = await response.json()

    const weatherCodeMap: Record<number, { description: string; main: string }> = {
      0: { description: "Clear sky", main: "Clear" },
      1: { description: "Mainly clear", main: "Clear" },
      2: { description: "Partly cloudy", main: "Clouds" },
      3: { description: "Overcast", main: "Clouds" },
      45: { description: "Foggy", main: "Fog" },
      48: { description: "Depositing rime fog", main: "Fog" },
      51: { description: "Light drizzle", main: "Drizzle" },
      53: { description: "Moderate drizzle", main: "Drizzle" },
      55: { description: "Dense drizzle", main: "Drizzle" },
      61: { description: "Slight rain", main: "Rain" },
      63: { description: "Moderate rain", main: "Rain" },
      65: { description: "Heavy rain", main: "Rain" },
      71: { description: "Slight snow", main: "Snow" },
      73: { description: "Moderate snow", main: "Snow" },
      75: { description: "Heavy snow", main: "Snow" },
      77: { description: "Snow grains", main: "Snow" },
      80: { description: "Slight rain showers", main: "Rain" },
      81: { description: "Moderate rain showers", main: "Rain" },
      82: { description: "Violent rain showers", main: "Rain" },
      85: { description: "Slight snow showers", main: "Snow" },
      86: { description: "Heavy snow showers", main: "Snow" },
      95: { description: "Thunderstorm", main: "Thunderstorm" },
      96: { description: "Thunderstorm with hail", main: "Thunderstorm" },
      99: { description: "Thunderstorm with heavy hail", main: "Thunderstorm" },
    }

    const weatherCode = data.current.weather_code
    const weatherInfo = weatherCodeMap[weatherCode] || { description: "Unknown", main: "Clear" }

    return {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      description: weatherInfo.description,
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      icon: weatherInfo.main.toLowerCase(),
      main: weatherInfo.main,
    }
  }

  const fetchLocation = async (lat: number, lon: number) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    )
    const data = await response.json()
    return {
      city: data.address.city || data.address.town || data.address.village || data.address.municipality || "Unknown",
      country: data.address.country || "Unknown",
      lat,
      lon,
    }
  }

  const getLocation = () => {
    setLoading(true)
    setError(null)
    setOutfit(null)
    setStreamedText("")

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const [locationData, weatherData] = await Promise.all([
            fetchLocation(latitude, longitude),
            fetchWeather(latitude, longitude),
          ])
          setLocation(locationData)
          setWeather(weatherData)
          setLoading(false)
          setStep("result")
          
          fetchOutfitRecommendation(weatherData, locationData)
        } catch {
          setError("Failed to fetch weather data")
          setLoading(false)
        }
      },
      () => {
        setError("Unable to retrieve your location. Please enable location access.")
        setLoading(false)
      }
    )
  }

  const getWardrobeItems = () => {
    const items: string[] = []
    Object.values(CLOTHING_DATA).forEach(category => {
      category.items.forEach(item => {
        if (wardrobe.has(item.id)) {
          items.push(item.name)
        }
      })
    })
    return items
  }

  const fetchOutfitRecommendation = async (weatherData: WeatherData, locationData: LocationData) => {
    setOutfitLoading(true)
    setStreamedText("")

    const wardrobeItems = getWardrobeItems()

    try {
      const response = await fetch("/api/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weather: weatherData,
          location: `${locationData.city}, ${locationData.country}`,
          wardrobe: wardrobeItems,
          gender: gender,
        }),
      })

      if (!response.ok) throw new Error("Failed to get outfit recommendation")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        setStreamedText(fullText)
      }

      try {
        const parsed = JSON.parse(fullText)
        setOutfit(parsed)
      } catch {
        // Parsing error handled silently
      }
    } catch {
      setError("Failed to get outfit recommendation")
    } finally {
      setOutfitLoading(false)
    }
  }

  useEffect(() => {
    if (streamedText) {
      try {
        const parsed = JSON.parse(streamedText)
        setOutfit(parsed)
      } catch {
        // Still streaming
      }
    }
  }, [streamedText])

  const toggleItem = (itemId: string) => {
    const newWardrobe = new Set(wardrobe)
    if (newWardrobe.has(itemId)) {
      newWardrobe.delete(itemId)
    } else {
      newWardrobe.add(itemId)
    }
    setWardrobe(newWardrobe)
  }

  const getFilteredItems = (category: typeof CLOTHING_DATA.tops) => {
    return category.items.filter(
      item => item.gender === "all" || item.gender === gender
    )
  }

  const selectAllCategory = (categoryKey: string) => {
    const category = CLOTHING_DATA[categoryKey as keyof typeof CLOTHING_DATA]
    const filtered = getFilteredItems(category)
    const newWardrobe = new Set(wardrobe)
    
    const allSelected = filtered.every(item => wardrobe.has(item.id))
    
    if (allSelected) {
      filtered.forEach(item => newWardrobe.delete(item.id))
    } else {
      filtered.forEach(item => newWardrobe.add(item.id))
    }
    
    setWardrobe(newWardrobe)
  }

  const resetAndStartOver = () => {
    setStep("gender")
    setGender(null)
    setWardrobe(new Set())
    setLocation(null)
    setWeather(null)
    setOutfit(null)
    setError(null)
    setStreamedText("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="font-serif text-2xl tracking-tight text-foreground">
            <span className="italic">Weather</span> Wardrobe
          </h1>
          {step !== "gender" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAndStartOver}
              className="text-muted-foreground hover:text-foreground"
            >
              Start Over
            </Button>
          )}
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-4">
          {["gender", "wardrobe", "location", "result"].map((s, i) => (
            <div key={s} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    step === s
                      ? "bg-iris text-primary-foreground"
                      : ["gender", "wardrobe", "location", "result"].indexOf(step) > i
                      ? "bg-iris/20 text-iris"
                      : "bg-surface text-muted-foreground"
                  }`}
                >
                  {["gender", "wardrobe", "location", "result"].indexOf(step) > i ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`hidden text-sm sm:inline ${step === s ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {s === "gender" && "Gender"}
                  {s === "wardrobe" && "Wardrobe"}
                  {s === "location" && "Location"}
                  {s === "result" && "Outfit"}
                </span>
              </div>
              {i < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Gender Selection */}
            {step === "gender" && (
              <motion.div
                key="gender"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h2 className="font-serif text-4xl tracking-tight text-foreground md:text-5xl">
                  Tell us about <span className="italic">yourself</span>
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  This helps us show you relevant clothing options
                </p>

                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    onClick={() => {
                      setGender("male")
                      setStep("wardrobe")
                    }}
                    className="group relative w-full overflow-hidden rounded-2xl bg-surface p-8 transition-all hover:bg-iris/10 sm:w-64"
                  >
                    <div className="relative z-10">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background">
                        <svg className="h-10 w-10 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="7" r="4" />
                          <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                        </svg>
                      </div>
                      <p className="mt-4 text-xl font-medium text-foreground">Male</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setGender("female")
                      setStep("wardrobe")
                    }}
                    className="group relative w-full overflow-hidden rounded-2xl bg-surface p-8 transition-all hover:bg-iris/10 sm:w-64"
                  >
                    <div className="relative z-10">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background">
                        <svg className="h-10 w-10 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="7" r="4" />
                          <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                          <path d="M12 11v4" />
                        </svg>
                      </div>
                      <p className="mt-4 text-xl font-medium text-foreground">Female</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Wardrobe Selection */}
            {step === "wardrobe" && (
              <motion.div
                key="wardrobe"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center">
                  <h2 className="font-serif text-4xl tracking-tight text-foreground md:text-5xl">
                    Build your <span className="italic">wardrobe</span>
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Select all the clothing items you own
                  </p>
                </div>

                {/* Category Tabs */}
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {Object.entries(CLOTHING_DATA).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        activeCategory === key
                          ? "bg-iris text-primary-foreground"
                          : "bg-surface text-muted-foreground hover:bg-iris/10 hover:text-foreground"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                {/* Items Grid */}
                <div className="mt-8">
                  {Object.entries(CLOTHING_DATA).map(([key, category]) => (
                    <div
                      key={key}
                      className={activeCategory === key ? "block" : "hidden"}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-foreground">{category.label}</h3>
                        <button
                          onClick={() => selectAllCategory(key)}
                          className="text-sm text-iris hover:text-iris/80"
                        >
                          {getFilteredItems(category).every(item => wardrobe.has(item.id))
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {getFilteredItems(category).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`relative rounded-xl p-4 text-left transition-all ${
                              wardrobe.has(item.id)
                                ? "bg-iris text-primary-foreground"
                                : "bg-surface text-foreground hover:bg-iris/10"
                            }`}
                          >
                            <span className="text-sm">{item.name}</span>
                            {wardrobe.has(item.id) && (
                              <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Count & Continue */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <Button
                    variant="ghost"
                    onClick={() => setStep("gender")}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <p className="text-muted-foreground">
                    {wardrobe.size} items selected
                  </p>
                  <Button
                    onClick={() => setStep("location")}
                    disabled={wardrobe.size === 0}
                    className="gap-2 bg-iris px-6 text-primary-foreground hover:bg-iris/90"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Location */}
            {step === "location" && (
              <motion.div
                key="location"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h2 className="font-serif text-4xl tracking-tight text-foreground md:text-5xl">
                  Share your <span className="italic">location</span>
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  We need your location to check the weather and recommend the perfect outfit
                </p>

                <div className="mt-12">
                  <Button
                    onClick={getLocation}
                    disabled={loading}
                    size="lg"
                    className="gap-2 bg-iris px-8 py-6 text-lg text-primary-foreground hover:bg-iris/90"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <MapPin className="h-5 w-5" />
                    )}
                    {loading ? "Finding your location..." : "Get My Location"}
                  </Button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => setStep("wardrobe")}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Wardrobe
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Results */}
            {step === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Weather Card */}
                  {weather && location && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-2xl bg-surface p-8"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{location.city}, {location.country}</span>
                          </div>
                          <div className="mt-4 flex items-end gap-2">
                            <span className="font-serif text-7xl text-foreground">{weather.temp}</span>
                            <span className="mb-3 text-2xl text-muted-foreground">°F</span>
                          </div>
                          <p className="mt-2 text-xl capitalize text-foreground">{weather.description}</p>
                        </div>
                        <div className="opacity-80">
                          {getWeatherIcon(weather.main)}
                        </div>
                      </div>

                      <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="rounded-xl bg-background p-4 text-center">
                          <Thermometer className="mx-auto h-5 w-5 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Feels Like</p>
                          <p className="text-lg font-medium text-foreground">{weather.feelsLike}°F</p>
                        </div>
                        <div className="rounded-xl bg-background p-4 text-center">
                          <Droplets className="mx-auto h-5 w-5 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Humidity</p>
                          <p className="text-lg font-medium text-foreground">{weather.humidity}%</p>
                        </div>
                        <div className="rounded-xl bg-background p-4 text-center">
                          <Wind className="mx-auto h-5 w-5 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Wind</p>
                          <p className="text-lg font-medium text-foreground">{weather.windSpeed} mph</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Outfit Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl bg-surface p-8"
                  >
                    {outfitLoading && !outfit ? (
                      <div className="flex h-full flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-iris" />
                        <p className="mt-4 text-muted-foreground">Curating your outfit from your wardrobe...</p>
                      </div>
                    ) : outfit ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-serif text-2xl italic text-foreground">Your Outfit</h3>
                          <p className="mt-2 text-muted-foreground">{outfit.summary}</p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iris/10">
                              <Shirt className="h-5 w-5 text-iris" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Top</p>
                              <p className="text-foreground">{outfit.top}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iris/10">
                              <svg className="h-5 w-5 text-iris" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 4h12v16H6z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Bottom</p>
                              <p className="text-foreground">{outfit.bottom}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iris/10">
                              <Footprints className="h-5 w-5 text-iris" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Footwear</p>
                              <p className="text-foreground">{outfit.footwear}</p>
                            </div>
                          </div>

                          {outfit.outerwear && (
                            <div className="flex items-start gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iris/10">
                                <svg className="h-5 w-5 text-iris" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 3L4 8v12h16V8l-8-5z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Outerwear</p>
                                <p className="text-foreground">{outfit.outerwear}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {outfit.accessories.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Accessories</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {outfit.accessories.map((accessory, i) => (
                                <span
                                  key={i}
                                  className="rounded-full bg-lilac/30 px-3 py-1 text-sm text-foreground"
                                >
                                  {accessory}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {outfit.colorPalette.length > 0 && (
                          <div className="flex items-center gap-3">
                            <Palette className="h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-wrap gap-2">
                              {outfit.colorPalette.map((color, i) => (
                                <span
                                  key={i}
                                  className="rounded-full bg-background px-3 py-1 text-sm text-foreground"
                                >
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="rounded-xl bg-lime/20 p-4">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="mt-0.5 h-5 w-5 text-foreground" />
                            <p className="text-sm text-foreground">{outfit.tips}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                        <Shirt className="h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-muted-foreground">
                          Getting your outfit recommendation...
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Actions */}
                {outfit && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
                  >
                    <Button
                      onClick={() => {
                        if (weather && location) {
                          setOutfit(null)
                          fetchOutfitRecommendation(weather, location)
                        }
                      }}
                      variant="outline"
                      disabled={outfitLoading}
                      className="gap-2"
                    >
                      {outfitLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Shirt className="h-4 w-4" />
                      )}
                      Get Another Outfit
                    </Button>
                    <Button
                      onClick={resetAndStartOver}
                      variant="outline"
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Start Over
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>Weather Wardrobe recommends outfits from your actual wardrobe based on local weather.</p>
        </div>
      </footer>
    </div>
  )
}
