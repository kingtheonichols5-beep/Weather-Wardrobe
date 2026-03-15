"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Upload, X, Shirt, Sparkles, Heart, Trash2, Pencil } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

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

const categoryTypes = {
  layer: ["Hoodie", "Jacket", "Cardigan", "Blazer", "Coat", "Vest", "Windbreaker", "Fleece", "Denim Jacket", "Puffer"],
  top: ["T-Shirt", "Tank Top", "Sweater", "Flannel", "Button-Up", "Polo", "Long Sleeve", "Blouse", "Henley"],
  bottom: ["Jeans", "Shorts", "Sweatpants", "Joggers", "Chinos", "Skirt", "Dress Pants"],
  shoes: ["Sneakers", "Boots", "Sandals", "Loafers", "Running Shoes", "Dress Shoes"],
  accessories: ["Rings", "Earrings", "Necklaces", "Beanies", "Caps", "Other Hats", "Sunglasses", "Watches", "Glasses"],
}

const colorOptions = [
  { value: "black", label: "Black", hex: "#111111" },
  { value: "white", label: "White", hex: "#FFFFFF" },
  { value: "blue", label: "Blue", hex: "#3B82F6" },
  { value: "red", label: "Red", hex: "#EF4444" },
  { value: "green", label: "Green", hex: "#22C55E" },
  { value: "brown", label: "Brown", hex: "#92400E" },
  { value: "grey", label: "Grey", hex: "#6B7280" },
  { value: "beige", label: "Beige", hex: "#D4A574" },
  { value: "yellow", label: "Yellow", hex: "#EAB308" },
  { value: "purple", label: "Purple", hex: "#A855F7" },
  { value: "pink", label: "Pink", hex: "#EC4899" },
  { value: "orange", label: "Orange", hex: "#F97316" },
  { value: "navy", label: "Navy", hex: "#1E3A5F" },
]

const fitOptions = ["Fitted", "Regular", "Oversized", "Baggy"]
const shoeConditionOptions = ["Athletic", "Casual", "Formal", "Rainy", "Comfy", "Beach/Pool", "Streetwear", "Hiking", "Running"]
const conditionOptions = ["Athletic", "Casual", "Formal", "Rainy", "Comfy", "Beach/Pool", "Streetwear"]
const layerConditionOptions = ["Athletic", "Casual", "Formal", "Rainy", "Comfy", "Streetwear"]
const temperatureOptions = [
  { value: "cold", label: "Cold" },
  { value: "mild", label: "Mild" },
  { value: "warm", label: "Warm" },
  { value: "hot", label: "Hot" },
  { value: "n/a", label: "N/A" },
]

const STORAGE_KEY = "stylist-closet"
const SAVED_OUTFITS_KEY = "stylist-saved-outfits"

function getStoredClothes(): ClothingItem[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveClothes(clothes: ClothingItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clothes))
}

function getSavedOutfits(): Outfit[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(SAVED_OUTFITS_KEY)
  return stored ? JSON.parse(stored) : []
}

function deleteSavedOutfit(index: number) {
  const saved = getSavedOutfits()
  saved.splice(index, 1)
  localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(saved))
}

export default function ClosetPage() {
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null)
  
  useEffect(() => {
    setClothes(getStoredClothes())
    setSavedOutfits(getSavedOutfits())
  }, [])
  const [uploadStep, setUploadStep] = useState(1)
  const [newItem, setNewItem] = useState<Partial<ClothingItem>>({
    temperature: [],
    condition: [],
    color: [],
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
      setNewItem((prev) => ({ ...prev, imageUrl: reader.result as string }))
      setUploadStep(2)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleSaveItem = () => {
    const isShoes = newItem.category === "shoes"
    const isAccessories = newItem.category === "accessories"
    const hasBaseFields = newItem.name && newItem.category && newItem.type && newItem.color?.length && newItem.temperature?.length && newItem.imageUrl
    const hasRequiredFields = (isAccessories || isShoes) ? (hasBaseFields && newItem.condition?.length) : (hasBaseFields && newItem.fit)
    const hasCondition = (newItem.condition?.length ?? 0) > 0
    
    if (hasRequiredFields && hasCondition) {
      const item: ClothingItem = {
        id: Date.now().toString(),
        name: newItem.name,
        category: newItem.category as ClothingItem["category"],
        type: newItem.type,
        color: newItem.color || [],
        fit: (isAccessories || isShoes) ? "N/A" : newItem.fit,
        condition: newItem.condition || [],
        temperature: newItem.temperature,
        imageUrl: newItem.imageUrl,
      }
      const updatedClothes = [...clothes, item]
      setClothes(updatedClothes)
      saveClothes(updatedClothes)
      resetUpload()
    }
  }

const handleDeleteItem = (id: string) => {
    const updatedClothes = clothes.filter((c) => c.id !== id)
    setClothes(updatedClothes)
    saveClothes(updatedClothes)
  }

  const handleDeleteOutfit = (index: number) => {
    deleteSavedOutfit(index)
    setSavedOutfits(getSavedOutfits())
  }

  const handleEditItem = (item: ClothingItem) => {
    setEditingItem(item)
    setNewItem({
      id: item.id,
      name: item.name,
      category: item.category,
      type: item.type,
      color: item.color,
      fit: item.fit,
      condition: item.condition,
      temperature: item.temperature,
      imageUrl: item.imageUrl,
    })
    setPreviewUrl(item.imageUrl)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    const isShoes = newItem.category === "shoes"
    const isAccessories = newItem.category === "accessories"
    const hasBaseFields = newItem.name && newItem.category && newItem.type && newItem.color?.length && newItem.temperature?.length && newItem.imageUrl
    const hasRequiredFields = (isAccessories || isShoes) ? (hasBaseFields && newItem.condition?.length) : (hasBaseFields && newItem.fit)
    const hasCondition = (newItem.condition?.length ?? 0) > 0
    
    if (hasRequiredFields && hasCondition && editingItem) {
      const updatedItem: ClothingItem = {
        id: editingItem.id,
        name: newItem.name!,
        category: newItem.category as ClothingItem["category"],
        type: newItem.type!,
        color: newItem.color || [],
        fit: (isAccessories || isShoes) ? "N/A" : newItem.fit!,
        condition: newItem.condition || [],
        temperature: newItem.temperature!,
        imageUrl: newItem.imageUrl!,
      }
      const updatedClothes = clothes.map(c => c.id === editingItem.id ? updatedItem : c)
      setClothes(updatedClothes)
      saveClothes(updatedClothes)
      resetEdit()
    }
  }

  const resetEdit = () => {
    setIsEditOpen(false)
    setEditingItem(null)
    setNewItem({ temperature: [], condition: [], color: [] })
    setPreviewUrl(null)
  }

  const resetUpload = () => {
    setIsUploadOpen(false)
    setUploadStep(1)
    setNewItem({ temperature: [], condition: [], color: [] })
    setPreviewUrl(null)
  }

  const toggleTemperature = (temp: string) => {
    setNewItem((prev) => ({
      ...prev,
      temperature: prev.temperature?.includes(temp)
        ? prev.temperature.filter((t) => t !== temp)
        : [...(prev.temperature || []), temp],
    }))
  }

  const toggleColor = (color: string) => {
    setNewItem((prev) => ({
      ...prev,
      color: prev.color?.includes(color)
        ? prev.color.filter((c) => c !== color)
        : [...(prev.color || []), color],
    }))
  }

  const toggleCondition = (condition: string) => {
    setNewItem((prev) => ({
      ...prev,
      condition: prev.condition?.includes(condition)
        ? prev.condition.filter((c) => c !== condition)
        : [...(prev.condition || []), condition],
    }))
  }

  const groupedClothes = {
    layer: clothes.filter((c) => c.category === "layer"),
    top: clothes.filter((c) => c.category === "top"),
    bottom: clothes.filter((c) => c.category === "bottom"),
    shoes: clothes.filter((c) => c.category === "shoes"),
    accessories: clothes.filter((c) => c.category === "accessories"),
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Closet</h1>
            <p className="mt-1 text-muted-foreground">
              {clothes.length} items in your digital wardrobe
            </p>
          </div>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" onClick={() => setIsUploadOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Clothing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {uploadStep === 1 && "Upload Photo"}
                  {uploadStep === 2 && "Clothing Details"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {uploadStep === 1 && "Upload a photo of your clothing item"}
                  {uploadStep === 2 && "Enter details about your clothing item"}
                </DialogDescription>
              </DialogHeader>

              {uploadStep === 1 && (
                <div
                  className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
                    dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-lg font-medium">Drag and drop your photo</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
              )}

              {uploadStep === 2 && (
                <>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                  {previewUrl && (
                    <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-xl bg-secondary">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Name</label>
                      <Input
                        placeholder="e.g., Blue Baggy Jeans"
                        value={newItem.name || ""}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Category</label>
                        <Select
                          value={newItem.category}
                          onValueChange={(value) => setNewItem((prev) => ({ ...prev, category: value as ClothingItem["category"], type: "", fit: "", condition: [] }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
<SelectContent>
                                            <SelectItem value="layer">Layer</SelectItem>
                                            <SelectItem value="top">Top</SelectItem>
                                            <SelectItem value="bottom">Bottom</SelectItem>
                                            <SelectItem value="shoes">Shoes</SelectItem>
                                            <SelectItem value="accessories">Accessories</SelectItem>
                                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">Type</label>
                        <Select
                          value={newItem.type}
                          onValueChange={(value) => setNewItem((prev) => ({ ...prev, type: value }))}
                          disabled={!newItem.category}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {newItem.category &&
                              categoryTypes[newItem.category].map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Color (select all that apply)</label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                              newItem.color?.includes(color.value) ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            onClick={() => toggleColor(color.value)}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

{newItem.category === "accessories" ? (
                                      <div>
                                        <label className="mb-2 block text-sm font-medium">Condition (select all that apply)</label>
                                        <div className="flex flex-wrap gap-2">
                                          {conditionOptions.map((condition) => (
                                            <button
                                              key={condition}
                                              type="button"
                                              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                                newItem.condition?.includes(condition)
                                                  ? "bg-primary text-primary-foreground"
                                                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                              }`}
                                              onClick={() => toggleCondition(condition)}
                                            >
                                              {condition}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ) : newItem.category === "shoes" ? (
                                      <div>
                                        <label className="mb-2 block text-sm font-medium">Condition (select all that apply)</label>
                                        <div className="flex flex-wrap gap-2">
                                          {shoeConditionOptions.map((condition) => (
                                            <button
                                              key={condition}
                                              type="button"
                                              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                                newItem.condition?.includes(condition)
                                                  ? "bg-primary text-primary-foreground"
                                                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                              }`}
                                              onClick={() => toggleCondition(condition)}
                                            >
                                              {condition}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        <div>
                                          <label className="mb-2 block text-sm font-medium">Fit</label>
                                          <Select
                                            value={newItem.fit}
                                            onValueChange={(value) => setNewItem((prev) => ({ ...prev, fit: value }))}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select fit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {fitOptions.map((fit) => (
                                                <SelectItem key={fit} value={fit}>
                                                  {fit}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <label className="mb-2 block text-sm font-medium">Condition (select all that apply)</label>
                                          <div className="flex flex-wrap gap-2">
                                            {(newItem.category === "layer" ? layerConditionOptions : conditionOptions).map((condition) => (
                                              <button
                                                key={condition}
                                                type="button"
                                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                                  newItem.condition?.includes(condition)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                                }`}
                                                onClick={() => toggleCondition(condition)}
                                              >
                                                {condition}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium">Best for Weather</label>
                      <div className="flex flex-wrap gap-2">
                        {temperatureOptions.map((temp) => (
                          <button
                            key={temp.value}
                            type="button"
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                              newItem.temperature?.includes(temp.value)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                            onClick={() => toggleTemperature(temp.value)}
                          >
                            {temp.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  </div>
                </ScrollArea>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setUploadStep(1)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSaveItem}
                    disabled={!newItem.name || !newItem.category || !newItem.type || !newItem.color?.length || !newItem.temperature?.length || (newItem.category !== "shoes" && newItem.category !== "accessories" && !newItem.fit) || !newItem.condition?.length}
                  >
                    Add to Closet
                  </Button>
                </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) resetEdit() }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Clothing</DialogTitle>
                <DialogDescription className="sr-only">
                  Edit details about your clothing item
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {previewUrl && (
                  <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-xl bg-secondary">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Name</label>
                    <Input
                      placeholder="e.g., Blue Baggy Jeans"
                      value={newItem.name || ""}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Category</label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) => setNewItem((prev) => ({ ...prev, category: value as ClothingItem["category"], type: "", fit: "", condition: [] }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="layer">Layer</SelectItem>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="shoes">Shoes</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Type</label>
                      <Select
                        value={newItem.type}
                        onValueChange={(value) => setNewItem((prev) => ({ ...prev, type: value }))}
                        disabled={!newItem.category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {newItem.category &&
                            categoryTypes[newItem.category].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Color (select all that apply)</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                            newItem.color?.includes(color.value) ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => toggleColor(color.value)}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  {newItem.category === "accessories" ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium">Condition (select all that apply)</label>
                      <div className="flex flex-wrap gap-2">
                        {conditionOptions.map((condition) => (
                          <button
                            key={condition}
                            type="button"
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                              newItem.condition?.includes(condition)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                            onClick={() => toggleCondition(condition)}
                          >
                            {condition}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : newItem.category === "shoes" ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium">Condition (select all that apply)</label>
                      <div className="flex flex-wrap gap-2">
                        {shoeConditionOptions.map((condition) => (
                          <button
                            key={condition}
                            type="button"
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                              newItem.condition?.includes(condition)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                            onClick={() => toggleCondition(condition)}
                          >
                            {condition}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Fit</label>
                        <Select
                          value={newItem.fit}
                          onValueChange={(value) => setNewItem((prev) => ({ ...prev, fit: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fit" />
                          </SelectTrigger>
                          <SelectContent>
                            {fitOptions.map((fit) => (
                              <SelectItem key={fit} value={fit}>
                                {fit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Condition (select all that apply)</label>
                        <div className="flex flex-wrap gap-2">
                          {(newItem.category === "layer" ? layerConditionOptions : conditionOptions).map((condition) => (
                            <button
                              key={condition}
                              type="button"
                              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                newItem.condition?.includes(condition)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                              }`}
                              onClick={() => toggleCondition(condition)}
                            >
                              {condition}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium">Best for Weather</label>
                    <div className="flex flex-wrap gap-2">
                      {temperatureOptions.map((temp) => (
                        <button
                          key={temp.value}
                          type="button"
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            newItem.temperature?.includes(temp.value)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                          onClick={() => toggleTemperature(temp.value)}
                        >
                          {temp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              </ScrollArea>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={resetEdit}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveEdit}
                  disabled={!newItem.name || !newItem.category || !newItem.type || !newItem.color?.length || !newItem.temperature?.length || (newItem.category !== "shoes" && newItem.category !== "accessories" && !newItem.fit) || !newItem.condition?.length}
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {clothes.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border">
            <Shirt className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold">Your closet is empty</h3>
            <p className="mb-6 text-muted-foreground">Start by uploading your first clothing item</p>
            <Button className="rounded-full" onClick={() => setIsUploadOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Clothing
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {(["layer", "top", "bottom", "shoes", "accessories"] as const).map((category) => (
              groupedClothes[category].length > 0 && (
                <section key={category}>
                  <h2 className="mb-4 text-lg font-semibold capitalize">
                    {category === "layer" ? "Layers" : category === "top" ? "Tops" : category === "bottom" ? "Bottoms" : category === "shoes" ? "Shoes" : "Accessories"}{" "}
                    <span className="text-muted-foreground">({groupedClothes[category].length})</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {groupedClothes[category].map((item) => (
                      <div
                        key={item.id}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-secondary"
                        onClick={() => handleEditItem(item)}
                      >
                        <div className="aspect-square">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); handleEditItem(item); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-white/70">{item.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            ))}

            <div className="flex justify-center pt-8">
              <Link href="/outfit">
                <Button size="lg" className="rounded-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Outfit
                </Button>
              </Link>
            </div>

            {/* Saved Outfits Section */}
            {savedOutfits.length > 0 && (
              <section className="mt-16 border-t border-border pt-10">
                <div className="mb-6 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Saved Outfits</h2>
                  <span className="text-muted-foreground">({savedOutfits.length})</span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {savedOutfits.map((outfit, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4"
                    >
                      <button
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100"
                        onClick={() => handleDeleteOutfit(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Heart className="h-4 w-4 text-primary" />
                        </div>
<div>
  <p className="text-sm font-medium">Outfit {index + 1}</p>
  <p className="text-xs text-muted-foreground">
    {outfit.accuracy !== undefined ? `${outfit.accuracy}% accuracy` : `Score: ${outfit.score}/10`}
  </p>
  </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {outfit.layer && (
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                            <Image
                              src={outfit.layer.imageUrl}
                              alt={outfit.layer.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {outfit.top && (
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                            <Image
                              src={outfit.top.imageUrl}
                              alt={outfit.top.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {outfit.bottom && (
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                            <Image
                              src={outfit.bottom.imageUrl}
                              alt={outfit.bottom.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {outfit.shoes && (
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                            <Image
                              src={outfit.shoes.imageUrl}
                              alt={outfit.shoes.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {outfit.accessory && (
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                            <Image
                              src={outfit.accessory.imageUrl}
                              alt={outfit.accessory.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{outfit.explanation}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
