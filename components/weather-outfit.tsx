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
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [location, setLocation] = useState<LocationData | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [outfit, setOutfit] = useState<OutfitRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [outfitLoading, setOutfitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamedText, setStreamedText] = useState("")

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
    // Using Open-Meteo API (free, no API key required)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`
    )
    const data = await response.json()

    // Map weather codes to descriptions and main categories
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
          
          // Auto-fetch outfit recommendation
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

  const fetchOutfitRecommendation = async (weatherData: WeatherData, locationData: LocationData) => {
    setOutfitLoading(true)
    setStreamedText("")

    try {
      const response = await fetch("/api/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weather: weatherData,
          location: `${locationData.city}, ${locationData.country}`,
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

      // Parse the final JSON
      try {
        const parsed = JSON.parse(fullText)
        setOutfit(parsed)
      } catch {
        // If parsing fails, the stream might still be valid partial JSON
        console.log("[v0] Parsing streamed response")
      }
    } catch {
      setError("Failed to get outfit recommendation")
    } finally {
      setOutfitLoading(false)
    }
  }

  // Parse streaming text for display
  useEffect(() => {
    if (streamedText) {
      try {
        const parsed = JSON.parse(streamedText)
        setOutfit(parsed)
      } catch {
        // Still streaming, show partial
      }
    }
  }, [streamedText])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="font-serif text-5xl font-normal tracking-tight text-foreground md:text-7xl lg:text-8xl">
            <span className="italic">Weather</span> Wardrobe
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Get personalized outfit recommendations based on your local weather conditions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12"
        >
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
            {loading ? "Finding your location..." : "Get My Weather Outfit"}
          </Button>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-destructive"
          >
            {error}
          </motion.p>
        )}
      </section>

      {/* Weather & Outfit Section */}
      <AnimatePresence mode="wait">
        {(weather || outfitLoading) && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            className="px-6 pb-20"
          >
            <div className="mx-auto max-w-6xl">
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

                {/* Outfit Recommendation Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl bg-surface p-8"
                >
                  {outfitLoading && !outfit ? (
                    <div className="flex h-full flex-col items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-iris" />
                      <p className="mt-4 text-muted-foreground">Curating your outfit...</p>
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
                          <div className="flex gap-2">
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
                        Click the button above to get your personalized outfit recommendation
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Refresh Button */}
              {outfit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <Button
                    onClick={getLocation}
                    variant="outline"
                    size="lg"
                    disabled={loading || outfitLoading}
                    className="gap-2"
                  >
                    {loading || outfitLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    Refresh Weather & Outfit
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>Weather Wardrobe uses your location to provide personalized outfit recommendations.</p>
          <p className="mt-2">Powered by AI for smart, weather-appropriate styling suggestions.</p>
        </div>
      </footer>
    </div>
  )
}
