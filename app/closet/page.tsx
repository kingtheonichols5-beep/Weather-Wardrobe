"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
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
import { Plus, Upload, X, Shirt, Sparkles } from "lucide-react"

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

const categoryTypes = {
  layer: ["Hoodie", "Jacket", "Cardigan", "Blazer", "Coat", "Vest", "Windbreaker", "Fleece", "Denim Jacket", "Puffer"],
  top: ["T-Shirt", "Tank Top", "Sweater", "Flannel", "Button-Up", "Polo", "Long Sleeve", "Blouse", "Henley"],
  bottom: ["Jeans", "Shorts", "Sweatpants", "Joggers", "Chinos", "Skirt", "Dress Pants"],
  shoes: ["Sneakers", "Boots", "Sandals", "Loafers", "Running Shoes", "Dress Shoes"],
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

const fitOptions = ["Fitted", "Regular", "Oversized", "Baggy", "Athletic"]
const shoeConditionOptions = ["Athletic", "Casual", "Formal", "Rainy", "Comfy", "Beach/Pool"]
const temperatureOptions = [
  { value: "cold", label: "Cold" },
  { value: "mild", label: "Mild" },
  { value: "warm", label: "Warm" },
  { value: "hot", label: "Hot" },
]

const STORAGE_KEY = "stylist-closet"

function getStoredClothes(): ClothingItem[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveClothes(clothes: ClothingItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clothes))
}

export default function ClosetPage() {
  const [clothes, setClothes] = useState<ClothingItem[]>(() => getStoredClothes())
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadStep, setUploadStep] = useState(1)
  const [newItem, setNewItem] = useState<Partial<ClothingItem>>({
    temperature: [],
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
    if (newItem.name && newItem.category && newItem.type && newItem.color && newItem.fit && newItem.temperature?.length && newItem.imageUrl) {
      const item: ClothingItem = {
        id: Date.now().toString(),
        name: newItem.name,
        category: newItem.category as ClothingItem["category"],
        type: newItem.type,
        color: newItem.color,
        fit: newItem.fit,
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
    const updatedClothes = clothes.filter((item) => item.id !== id)
    setClothes(updatedClothes)
    saveClothes(updatedClothes)
  }

  const resetUpload = () => {
    setIsUploadOpen(false)
    setUploadStep(1)
    setNewItem({ temperature: [] })
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

  const groupedClothes = {
    layer: clothes.filter((c) => c.category === "layer"),
    top: clothes.filter((c) => c.category === "top"),
    bottom: clothes.filter((c) => c.category === "bottom"),
    shoes: clothes.filter((c) => c.category === "shoes"),
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
                <div className="space-y-6">
                  {previewUrl && (
                    <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl bg-secondary">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
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
                          onValueChange={(value) => setNewItem((prev) => ({ ...prev, category: value as ClothingItem["category"], type: "", fit: "" }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="layer">Layer</SelectItem>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="bottom">Bottom</SelectItem>
                            <SelectItem value="shoes">Shoes</SelectItem>
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
                      <label className="mb-2 block text-sm font-medium">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                              newItem.color === color.value ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            onClick={() => setNewItem((prev) => ({ ...prev, color: color.value }))}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        {newItem.category === "shoes" ? "Condition" : "Fit"}
                      </label>
                      <Select
                        value={newItem.fit}
                        onValueChange={(value) => setNewItem((prev) => ({ ...prev, fit: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={newItem.category === "shoes" ? "Select condition" : "Select fit"} />
                        </SelectTrigger>
                        <SelectContent>
                          {newItem.category === "shoes"
                            ? shoeConditionOptions.map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                  {condition}
                                </SelectItem>
                              ))
                            : fitOptions.map((fit) => (
                                <SelectItem key={fit} value={fit}>
                                  {fit}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>

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

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setUploadStep(1)}>
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSaveItem}
                      disabled={!newItem.name || !newItem.category || !newItem.type || !newItem.color || !newItem.fit || !newItem.temperature?.length}
                    >
                      Add to Closet
                    </Button>
                  </div>
                </div>
              )}
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
            {(["layer", "top", "bottom", "shoes"] as const).map((category) => (
              groupedClothes[category].length > 0 && (
                <section key={category}>
                  <h2 className="mb-4 text-lg font-semibold capitalize">
                    {category === "layer" ? "Layers" : category === "top" ? "Tops" : category === "bottom" ? "Bottoms" : "Shoes"}{" "}
                    <span className="text-muted-foreground">({groupedClothes[category].length})</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {groupedClothes[category].map((item) => (
                      <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-2xl bg-secondary"
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
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                          onClick={() => handleDeleteItem(item.id)}
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
          </div>
        )}
      </main>
    </div>
  )
}
