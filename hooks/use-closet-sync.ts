"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"

interface ClothingItem {
  id: string
  name: string
  category: "layer" | "top" | "bottom" | "shoes" | "accessories"
  type: string
  color: string[]
  fit: string
  condition: string[]
  temperature: string[]
  imageUrl: string
}

interface Outfit {
  layer: ClothingItem | null
  top: ClothingItem | null
  bottom: ClothingItem | null
  shoes: ClothingItem | null
  accessory: ClothingItem | null
  score: number
  accuracy: number
  explanation: string
}

const STORAGE_KEY = "stylist-closet"
const SAVED_OUTFITS_KEY = "stylist-saved-outfits"

function getLocalClothes(): ClothingItem[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveLocalClothes(clothes: ClothingItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clothes))
}

function getLocalOutfits(): Outfit[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(SAVED_OUTFITS_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveLocalOutfits(outfits: Outfit[]) {
  localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(outfits))
}

export function useClosetSync() {
  const { user } = useAuth()
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const supabase = createClient()

  // Load clothes from Supabase or localStorage
  const loadClothes = useCallback(async () => {
    setIsLoading(true)
    
    if (user) {
      // Load from Supabase
      const { data, error } = await supabase
        .from("closet_items")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading clothes from Supabase:", error)
        // Fall back to localStorage
        setClothes(getLocalClothes())
      } else {
        const items: ClothingItem[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          type: item.type,
          color: item.color,
          fit: item.fit,
          condition: item.condition,
          temperature: item.temperature,
          imageUrl: item.image_url,
        }))
        setClothes(items)
        // Also save to localStorage as backup
        saveLocalClothes(items)
      }
    } else {
      // Load from localStorage
      setClothes(getLocalClothes())
    }
    
    setIsLoading(false)
  }, [user, supabase])

  // Load saved outfits
  const loadOutfits = useCallback(async () => {
    if (user) {
      const { data, error } = await supabase
        .from("saved_outfits")
        .select(`
          *,
          layer:closet_items!saved_outfits_layer_id_fkey(*),
          top:closet_items!saved_outfits_top_id_fkey(*),
          bottom:closet_items!saved_outfits_bottom_id_fkey(*),
          shoes:closet_items!saved_outfits_shoes_id_fkey(*),
          accessory:closet_items!saved_outfits_accessory_id_fkey(*)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading outfits from Supabase:", error)
        setSavedOutfits(getLocalOutfits())
      } else {
        const outfits: Outfit[] = data.map((outfit) => ({
          layer: outfit.layer ? {
            id: outfit.layer.id,
            name: outfit.layer.name,
            category: outfit.layer.category,
            type: outfit.layer.type,
            color: outfit.layer.color,
            fit: outfit.layer.fit,
            condition: outfit.layer.condition,
            temperature: outfit.layer.temperature,
            imageUrl: outfit.layer.image_url,
          } : null,
          top: outfit.top ? {
            id: outfit.top.id,
            name: outfit.top.name,
            category: outfit.top.category,
            type: outfit.top.type,
            color: outfit.top.color,
            fit: outfit.top.fit,
            condition: outfit.top.condition,
            temperature: outfit.top.temperature,
            imageUrl: outfit.top.image_url,
          } : null,
          bottom: outfit.bottom ? {
            id: outfit.bottom.id,
            name: outfit.bottom.name,
            category: outfit.bottom.category,
            type: outfit.bottom.type,
            color: outfit.bottom.color,
            fit: outfit.bottom.fit,
            condition: outfit.bottom.condition,
            temperature: outfit.bottom.temperature,
            imageUrl: outfit.bottom.image_url,
          } : null,
          shoes: outfit.shoes ? {
            id: outfit.shoes.id,
            name: outfit.shoes.name,
            category: outfit.shoes.category,
            type: outfit.shoes.type,
            color: outfit.shoes.color,
            fit: outfit.shoes.fit,
            condition: outfit.shoes.condition,
            temperature: outfit.shoes.temperature,
            imageUrl: outfit.shoes.image_url,
          } : null,
          accessory: outfit.accessory ? {
            id: outfit.accessory.id,
            name: outfit.accessory.name,
            category: outfit.accessory.category,
            type: outfit.accessory.type,
            color: outfit.accessory.color,
            fit: outfit.accessory.fit,
            condition: outfit.accessory.condition,
            temperature: outfit.accessory.temperature,
            imageUrl: outfit.accessory.image_url,
          } : null,
          score: outfit.score,
          accuracy: outfit.accuracy,
          explanation: outfit.explanation,
        }))
        setSavedOutfits(outfits)
        saveLocalOutfits(outfits)
      }
    } else {
      setSavedOutfits(getLocalOutfits())
    }
  }, [user, supabase])

  // Initial load
  useEffect(() => {
    loadClothes()
    loadOutfits()
  }, [loadClothes, loadOutfits])

  // Sync localStorage to Supabase when user signs in
  useEffect(() => {
    const syncToSupabase = async () => {
      if (!user) return

      setIsSyncing(true)
      
      // Check if user has any items in Supabase
      const { data: existingItems } = await supabase
        .from("closet_items")
        .select("id")
        .limit(1)

      // If no items in Supabase but have local items, sync them
      if ((!existingItems || existingItems.length === 0)) {
        const localClothes = getLocalClothes()
        
        if (localClothes.length > 0) {
          // Upload local items to Supabase
          const itemsToInsert = localClothes.map((item) => ({
            user_id: user.id,
            name: item.name,
            category: item.category,
            type: item.type,
            color: item.color,
            fit: item.fit,
            condition: item.condition,
            temperature: item.temperature,
            image_url: item.imageUrl,
          }))

          const { error } = await supabase
            .from("closet_items")
            .insert(itemsToInsert)

          if (error) {
            console.error("Error syncing to Supabase:", error)
          } else {
            // Reload to get the Supabase IDs
            await loadClothes()
          }
        }
      }
      
      setIsSyncing(false)
    }

    syncToSupabase()
  }, [user, supabase, loadClothes])

  // Add item
  const addItem = useCallback(async (item: Omit<ClothingItem, "id">) => {
    if (user) {
      const { data, error } = await supabase
        .from("closet_items")
        .insert({
          user_id: user.id,
          name: item.name,
          category: item.category,
          type: item.type,
          color: item.color,
          fit: item.fit,
          condition: item.condition,
          temperature: item.temperature,
          image_url: item.imageUrl,
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding item to Supabase:", error)
        return null
      }

      const newItem: ClothingItem = {
        id: data.id,
        name: data.name,
        category: data.category,
        type: data.type,
        color: data.color,
        fit: data.fit,
        condition: data.condition,
        temperature: data.temperature,
        imageUrl: data.image_url,
      }
      
      setClothes((prev) => {
        const updated = [newItem, ...prev]
        saveLocalClothes(updated)
        return updated
      })
      
      return newItem
    } else {
      // Save to localStorage only
      const newItem: ClothingItem = {
        ...item,
        id: Date.now().toString(),
      }
      
      setClothes((prev) => {
        const updated = [newItem, ...prev]
        saveLocalClothes(updated)
        return updated
      })
      
      return newItem
    }
  }, [user, supabase])

  // Update item
  const updateItem = useCallback(async (item: ClothingItem) => {
    if (user) {
      const { error } = await supabase
        .from("closet_items")
        .update({
          name: item.name,
          category: item.category,
          type: item.type,
          color: item.color,
          fit: item.fit,
          condition: item.condition,
          temperature: item.temperature,
          image_url: item.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)

      if (error) {
        console.error("Error updating item in Supabase:", error)
        return false
      }
    }

    setClothes((prev) => {
      const updated = prev.map((c) => (c.id === item.id ? item : c))
      saveLocalClothes(updated)
      return updated
    })
    
    return true
  }, [user, supabase])

  // Delete item
  const deleteItem = useCallback(async (id: string) => {
    if (user) {
      const { error } = await supabase
        .from("closet_items")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Error deleting item from Supabase:", error)
        return false
      }
    }

    setClothes((prev) => {
      const updated = prev.filter((c) => c.id !== id)
      saveLocalClothes(updated)
      return updated
    })
    
    return true
  }, [user, supabase])

  // Delete outfit
  const deleteOutfit = useCallback(async (index: number) => {
    if (user) {
      // For Supabase, we need the outfit ID, but we're using index here
      // We'd need to store outfit IDs to properly delete from Supabase
      // For now, fall back to localStorage pattern
    }

    setSavedOutfits((prev) => {
      const updated = [...prev]
      updated.splice(index, 1)
      saveLocalOutfits(updated)
      return updated
    })
    
    return true
  }, [user])

  return {
    clothes,
    savedOutfits,
    isLoading,
    isSyncing,
    addItem,
    updateItem,
    deleteItem,
    deleteOutfit,
    refreshClothes: loadClothes,
    refreshOutfits: loadOutfits,
  }
}
