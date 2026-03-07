"use client"

import { useState, useRef, useEffect } from "react"
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
  CloudSun,
  CloudFog,
  CloudLightning,
  RefreshCw,
  Search,
  Navigation,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Temperature-based clothing categories
const CLOTHING_BY_TEMP = {
  veryC old: {
    // Below 40°F
    label: "Very Cold (Below 40°F)",
    tops: ["Sweater", "Hoodie", "Sweatshirt", "Thermal shirt", "Turtleneck"],
    bottoms: ["Jeans", "Sweatpants", "Joggers", "Cargo pants"],
    shoes: ["Boots", "Winter boots", "Sneakers"],
    outerwear: ["Puffer jacket", "Winter coat", "Parka"],
    accessories: ["Beanie", "Scarf", "Gloves"],
  },
  cold: {
    // 40-55°F
    label: "Cold (40-55°F)",
    tops: ["Hoodie", "Sweatshirt", "Sweater", "Long sleeve shirt", "Flannel"],
    bottoms: ["Jeans", "Joggers", "Sweatpants", "Khakis"],
    shoes: ["Sneakers", "Boots", "Running shoes"],
    outerwear: ["Light jacket", "Fleece jacket", "Denim jacket"],
    accessories: ["Baseball cap", "Light scarf"],
  },
  cool: {
    // 55-70°F
    label: "Cool/Mild (55-70°F)",
    tops: ["Hoodie", "Long sleeve shirt", "T-shirt", "Flannel"],
    bottoms: ["Jeans", "Joggers", "Khakis", "Athletic shorts", "Casual shorts"],
    shoes: ["Sneakers", "Running shoes", "Casual shoes"],
    outerwear: null,
    accessories: ["Sunglasses", "Baseball cap"],
  },
  warm: {
    // 70-85°F
    label: "Warm (70-85°F)",
    tops: ["T-shirt", "Graphic T-shirt", "Tank top", "Polo shirt"],
    bottoms: ["Athletic shorts", "Denim shorts", "Casual shorts", "Running shorts", "Joggers", "Light chinos"],
    shoes: ["Sneakers", "Running shoes", "Sandals", "Slides"],
    outerwear: null,
    accessories: ["Sunglasses", "Baseball cap"],
  },
  hot: {
    // 85°F+
    label: "Hot (85°F+)",
    tops: ["Tank top", "Sleeveless shirt", "Athletic shirt", "T-shirt"],
    bottoms: ["Athletic shorts", "Running shorts", "Casual shorts"],
    shoes: ["Sandals", "Slides", "Sneakers"],
    outerwear: null,
    accessories: ["Sunglasses", "Hat"],
  },
}

interface WeatherData {
  temp: number
  feelsLike: number
  description: string
  humidity: number
  windSpeed: number
  main: string
}

interface Outfit {
  top: string
  bottom: string
  shoes: string
  outerwear: string | null
  accessory: string | null
  tempRange: string
}

interface LocationData {
  city: string
  country: string
  lat: number
  lon: number
}

interface SearchResult {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getTempCategory(temp: number): keyof typeof CLOTHING_BY_TEMP {
  if (temp < 40) return "veryC old"
  if (temp < 55) return "cold"
  if (temp < 70) return "cool"
  if (temp < 85) return "warm"
  return "hot"
}

function generateOutfit(temp: number): Outfit {
  const category = getTempCategory(temp)
  const clothes = CLOTHING_BY_TEMP[category]

  return {
    top: getRandomItem(clothes.tops),
    bottom: getRandomItem(clothes.bottoms),
    shoes: getRandomItem(clothes.shoes),
    outerwear: clothes.outerwear ? getRandomItem(clothes.outerwear) : null,
    accessory: clothes.accessories ? getRandomItem(clothes.accessories) : null,
    tempRange: clothes.label,
  }
}

export function WeatherOutfit() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [outfit, setOutfit] = useState<Outfit | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
        setSearchResults([])
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getWeatherIcon = (main: string) => {
    const iconProps = { className: "w-20 h-20 text-foreground" }
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

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
      )
      const data = await response.json()
      const results: SearchResult[] = data.map((item: { display_name: string; lat: string; lon: string; address?: { city?: string; town?: string; village?: string; state?: string; country?: string } }) => ({
        name: item.address?.city || item.address?.town || item.address?.village || item.display_name.split(",")[0],
        country: item.address?.country || "",
        state: item.address?.state,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
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

  const selectLocation = async (result: SearchResult) => {
    setLoading(true)
    setShowSearch(false)
    setShowLocationSelector(false)
    setSearchQuery("")
    setSearchResults([])
    setError(null)
    try {
      const [locationData, weatherData] = await Promise.all([
        fetchLocation(result.lat, result.lon),
        fetchWeather(result.lat, result.lon),
      ])
      setLocation(locationData)
      setWeather(weatherData)
      setOutfit(generateOutfit(weatherData.temp))
    } catch {
      setError("Failed to fetch weather data for this location")
    } finally {
      setLoading(false)
    }
  }

  const getLocation = () => {
    setLoading(true)
    setError(null)

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
          setOutfit(generateOutfit(weatherData.temp))
          setLoading(false)
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

  const regenerateOutfit = () => {
    if (weather) {
      setOutfit(generateOutfit(weather.temp))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="font-serif text-2xl tracking-tight text-foreground">
            <span className="italic">Weather</span> Wardrobe
          </h1>
          {weather && (
            <Button
              variant="ghost"
              size="sm"
              onClick={getLocation}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Initial State */}
            {!weather && !loading && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-surface">
                  <Sun className="h-16 w-16 text-iris" />
                </div>
                
                <h2 className="font-serif text-4xl tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  Dress for the <span className="italic">weather</span>
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                  Share your location and we will recommend the perfect outfit based on your local weather conditions.
                </p>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <Button
                    onClick={getLocation}
                    size="lg"
                    className="bg-iris px-8 py-6 text-lg hover:bg-iris/90"
                  >
                    <Navigation className="mr-2 h-5 w-5" />
                    Use My Location
                  </Button>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="h-px w-12 bg-border" />
                    <span className="text-sm">or</span>
                    <div className="h-px w-12 bg-border" />
                  </div>

                  <div ref={searchRef} className="relative w-full max-w-md">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search for a city..."
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onFocus={() => setShowSearch(true)}
                        className="h-14 rounded-full border-border bg-surface pl-12 pr-4 text-lg"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    <AnimatePresence>
                      {showSearch && searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
                        >
                          {searchResults.map((result, index) => (
                            <button
                              key={`${result.lat}-${result.lon}-${index}`}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-background"
                              onClick={() => selectLocation(result)}
                            >
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-foreground">{result.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {result.state ? `${result.state}, ` : ""}{result.country}
                                </p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
              </motion.div>
            )}

            {/* Loading State */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="h-12 w-12 animate-spin text-iris" />
                <p className="mt-4 text-lg text-muted-foreground">
                  Finding your location and checking the weather...
                </p>
              </motion.div>
            )}

            {/* Results */}
            {weather && outfit && !loading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Location Header */}
                <div className="mb-12 text-center">
                  <div className="relative inline-block" ref={searchRef}>
                    <button
                      onClick={() => setShowLocationSelector(!showLocationSelector)}
                      className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-muted-foreground transition-colors hover:bg-surface/80 hover:text-foreground"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>
                        {location?.city}, {location?.country}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showLocationSelector ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {showLocationSelector && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-1/2 top-full z-10 mt-2 w-80 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-lg"
                        >
                          <p className="mb-3 text-sm font-medium text-foreground">Change Location</p>
                          
                          <button
                            onClick={() => {
                              setShowLocationSelector(false)
                              getLocation()
                            }}
                            className="mb-3 flex w-full items-center gap-3 rounded-xl bg-background px-4 py-3 text-left transition-colors hover:bg-iris/10"
                          >
                            <Navigation className="h-4 w-4 text-iris" />
                            <span className="text-sm font-medium">Use current location</span>
                          </button>

                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Search for a city..."
                              value={searchQuery}
                              onChange={(e) => handleSearchInput(e.target.value)}
                              className="h-10 rounded-xl border-border bg-background pl-10 pr-4 text-sm"
                            />
                            {isSearching && (
                              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                            )}
                          </div>

                          {searchResults.length > 0 && (
                            <div className="mt-2 max-h-48 overflow-y-auto">
                              {searchResults.map((result, index) => (
                                <button
                                  key={`${result.lat}-${result.lon}-${index}`}
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-background"
                                  onClick={() => selectLocation(result)}
                                >
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{result.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {result.state ? `${result.state}, ` : ""}{result.country}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Weather Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-3xl bg-surface p-8"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                          Current Weather
                        </p>
                        <p className="mt-2 font-serif text-6xl text-foreground">
                          {weather.temp}°F
                        </p>
                        <p className="mt-1 text-lg text-muted-foreground">
                          Feels like {weather.feelsLike}°F
                        </p>
                        <p className="mt-4 text-xl text-foreground">
                          {weather.description}
                        </p>
                      </div>
                      <div className="text-iris">
                        {getWeatherIcon(weather.main)}
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 rounded-xl bg-background p-4">
                        <Droplets className="h-5 w-5 text-iris" />
                        <div>
                          <p className="text-sm text-muted-foreground">Humidity</p>
                          <p className="text-lg font-medium text-foreground">{weather.humidity}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl bg-background p-4">
                        <Wind className="h-5 w-5 text-iris" />
                        <div>
                          <p className="text-sm text-muted-foreground">Wind</p>
                          <p className="text-lg font-medium text-foreground">{weather.windSpeed} mph</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-background p-4">
                      <Thermometer className="h-5 w-5 text-iris" />
                      <div>
                        <p className="text-sm text-muted-foreground">Temperature Range</p>
                        <p className="text-lg font-medium text-foreground">{outfit.tempRange}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Outfit Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl bg-iris/10 p-8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shirt className="h-6 w-6 text-iris" />
                        <p className="text-sm font-medium uppercase tracking-widest text-iris">
                          Your Outfit
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={regenerateOutfit}
                        className="text-iris hover:text-iris/80 hover:bg-iris/10"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        New Outfit
                      </Button>
                    </div>

                    <div className="mt-8 space-y-6">
                      {/* Top */}
                      <div className="rounded-2xl bg-background p-5">
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                          Top
                        </p>
                        <p className="mt-2 text-2xl font-medium text-foreground">
                          {outfit.top}
                        </p>
                      </div>

                      {/* Bottom */}
                      <div className="rounded-2xl bg-background p-5">
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                          Bottom
                        </p>
                        <p className="mt-2 text-2xl font-medium text-foreground">
                          {outfit.bottom}
                        </p>
                      </div>

                      {/* Shoes */}
                      <div className="rounded-2xl bg-background p-5">
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                          Shoes
                        </p>
                        <p className="mt-2 text-2xl font-medium text-foreground">
                          {outfit.shoes}
                        </p>
                      </div>

                      {/* Outerwear */}
                      {outfit.outerwear && (
                        <div className="rounded-2xl bg-background p-5">
                          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Outerwear
                          </p>
                          <p className="mt-2 text-2xl font-medium text-foreground">
                            {outfit.outerwear}
                          </p>
                        </div>
                      )}

                      {/* Accessory */}
                      {outfit.accessory && (
                        <div className="rounded-2xl bg-background p-5">
                          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Accessory
                          </p>
                          <p className="mt-2 text-2xl font-medium text-foreground">
                            {outfit.accessory}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Weather Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 rounded-3xl bg-surface p-8"
                >
                  <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Weather Tips
                  </p>
                  <p className="mt-4 text-lg text-foreground">
                    {weather.temp < 40 && "Bundle up! It is very cold outside. Layer your clothing and do not forget your warm accessories."}
                    {weather.temp >= 40 && weather.temp < 55 && "It is chilly out there. A good jacket will keep you comfortable throughout the day."}
                    {weather.temp >= 55 && weather.temp < 70 && "Perfect layering weather! You might want to bring a light layer in case it gets cooler."}
                    {weather.temp >= 70 && weather.temp < 85 && "Nice and warm! Light, breathable clothing will keep you comfortable."}
                    {weather.temp >= 85 && "It is hot outside! Stay cool with light clothing and remember to stay hydrated."}
                    {weather.main === "Rain" && " Do not forget an umbrella or rain jacket!"}
                    {weather.main === "Snow" && " Watch out for slippery conditions and wear waterproof footwear."}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
