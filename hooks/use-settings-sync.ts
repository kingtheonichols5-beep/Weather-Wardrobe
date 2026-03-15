"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"

interface Settings {
  units: "fahrenheit" | "celsius"
  stylePreference: string[]
  colorPreference: string[]
}

const SETTINGS_KEY = "stylist-settings"

const defaultSettings: Settings = {
  units: "fahrenheit",
  stylePreference: [],
  colorPreference: [],
}

function getLocalSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings
  const stored = localStorage.getItem(SETTINGS_KEY)
  return stored ? JSON.parse(stored) : defaultSettings
}

function saveLocalSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function useSettingsSync() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const supabase = createClient()

  // Load settings from Supabase or localStorage
  const loadSettings = useCallback(async () => {
    setIsLoading(true)

    if (user) {
      // Load from Supabase
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // No settings found, use localStorage or defaults
          const localSettings = getLocalSettings()
          setSettings(localSettings)
          
          // Create settings in Supabase
          await supabase.from("user_settings").insert({
            user_id: user.id,
            units: localSettings.units,
            style_preference: localSettings.stylePreference,
            color_preference: localSettings.colorPreference,
          })
        } else {
          console.error("Error loading settings from Supabase:", error)
          setSettings(getLocalSettings())
        }
      } else {
        const loadedSettings: Settings = {
          units: data.units,
          stylePreference: data.style_preference || [],
          colorPreference: data.color_preference || [],
        }
        setSettings(loadedSettings)
        saveLocalSettings(loadedSettings)
      }
    } else {
      // Load from localStorage
      setSettings(getLocalSettings())
    }

    setIsLoading(false)
  }, [user, supabase])

  // Initial load
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Sync localStorage to Supabase when user signs in
  useEffect(() => {
    const syncToSupabase = async () => {
      if (!user) return

      setIsSyncing(true)

      // Check if user has settings in Supabase
      const { data: existingSettings } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", user.id)
        .single()

      // If no settings in Supabase, sync local settings
      if (!existingSettings) {
        const localSettings = getLocalSettings()

        const { error } = await supabase.from("user_settings").insert({
          user_id: user.id,
          units: localSettings.units,
          style_preference: localSettings.stylePreference,
          color_preference: localSettings.colorPreference,
        })

        if (error) {
          console.error("Error syncing settings to Supabase:", error)
        }
      }

      setIsSyncing(false)
    }

    syncToSupabase()
  }, [user, supabase])

  // Update settings
  const updateSettings = useCallback(
    async (newSettings: Partial<Settings>) => {
      const updated = { ...settings, ...newSettings }
      setSettings(updated)
      saveLocalSettings(updated)

      if (user) {
        const { error } = await supabase
          .from("user_settings")
          .upsert({
            user_id: user.id,
            units: updated.units,
            style_preference: updated.stylePreference,
            color_preference: updated.colorPreference,
            updated_at: new Date().toISOString(),
          })

        if (error) {
          console.error("Error updating settings in Supabase:", error)
          return false
        }
      }

      return true
    },
    [user, supabase, settings]
  )

  // Toggle style preference
  const toggleStyle = useCallback(
    async (style: string) => {
      const stylePreference = settings.stylePreference.includes(style)
        ? settings.stylePreference.filter((s) => s !== style)
        : [...settings.stylePreference, style]

      await updateSettings({ stylePreference })
    },
    [settings.stylePreference, updateSettings]
  )

  // Toggle color preference
  const toggleColorPreference = useCallback(
    async (color: string) => {
      const colorPreference = settings.colorPreference.includes(color)
        ? settings.colorPreference.filter((c) => c !== color)
        : [...settings.colorPreference, color]

      await updateSettings({ colorPreference })
    },
    [settings.colorPreference, updateSettings]
  )

  // Set units
  const setUnits = useCallback(
    async (units: "fahrenheit" | "celsius") => {
      await updateSettings({ units })
    },
    [updateSettings]
  )

  return {
    settings,
    isLoading,
    isSyncing,
    updateSettings,
    toggleStyle,
    toggleColorPreference,
    setUnits,
    refreshSettings: loadSettings,
  }
}
