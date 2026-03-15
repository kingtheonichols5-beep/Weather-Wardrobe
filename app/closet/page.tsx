"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload, X, Shirt, Sparkles, Heart, Trash2, Pencil } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type ClothingItem = {
  id: string
  name: string
  category: "layer" | "top" | "bottom" | "shoes" | "accessories"
  type: string
  color: string[]
  temperature: string[]
  image: string
  favorite: boolean
  fit?: string
  condition?: string[]
}

const categoryTypes: Record<string, string[]> = {
  layer: ["Jacket", "Coat", "Hoodie", "Cardigan", "Vest", "Blazer", "Sweater"],
  top: ["T-Shirt", "Shirt", "Blouse", "Tank Top", "Polo", "Sweater", "Crop Top"],
  bottom: ["Jeans", "Pants", "Shorts", "Skirt", "Dress Pants", "Joggers", "Leggings"],
  shoes: ["Sneakers", "Boots", "Sandals", "Heels", "Flats", "Loafers", "Athletic"],
  accessories: ["Hat", "Scarf", "Belt", "Watch", "Jewelry", "Bag", "Sunglasses"],
}

const colorOptions = [
  { value: "black", label: "Black", hex: "#000000" },
  { value: "white", label: "White", hex: "#FFFFFF" },
  { value: "gray", label: "Gray", hex: "#808080" },
  { value: "navy", label: "Navy", hex: "#000080" },
  { value: "blue", label: "Blue", hex: "#0066CC" },
  { value: "red", label: "Red", hex: "#CC0000" },
  { value: "green", label: "Green", hex: "#228B22" },
  { value: "yellow", label: "Yellow", hex: "#FFD700" },
  { value: "orange", label: "Orange", hex: "#FF8C00" },
  { value: "pink", label: "Pink", hex: "#FF69B4" },
  { value: "purple", label: "Purple", hex: "#800080" },
  { value: "brown", label: "Brown", hex: "#8B4513" },
  { value: "beige", label: "Beige", hex: "#F5F5DC" },
  { value: "cream", label: "Cream", hex: "#FFFDD0" },
]

const temperatureOptions = [
  { value: "hot", label: "Hot (80°F+)" },
  { value: "warm", label: "Warm (65-79°F)" },
  { value: "mild", label: "Mild (50-64°F)" },
  { value: "cool", label: "Cool (35-49°F)" },
  { value: "cold", label: "Cold (<35°F)" },
]

const fitOptions = ["Slim", "Regular", "Relaxed", "Oversized"]
const conditionOptions = ["Casual", "Formal", "Athletic", "Business", "Party", "Outdoor", "Loungewear"]
const layerConditionOptions = ["Casual", "Formal", "Athletic", "Business", "Outdoor", "Rain", "Snow"]
const shoeConditionOptions = ["Casual", "Formal", "Athletic", "Business", "Party", "Outdoor", "Beach"]

const categoryLabels: Record<string, string> = {
  layer: "Layers",
  top: "Tops",
  bottom: "Bottoms",
  shoes: "Shoes",
  accessories: "Accessories",
}

const categoryIcons: Record<string, React.ReactNode> = {
  layer: <Shirt className="h-4 w-4" />,
  top: <Shirt className="h-4 w-4" />,
  bottom: <Shirt className="h-4 w-4" />,
  shoes: <Sparkles className="h-4 w-4" />,
  accessories: <Sparkles className="h-4 w-4" />,
}

export default function ClosetPage() {
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null)
  const [uploadStep, setUploadStep] = useState(1)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [newItem, setNewItem] = useState<Partial<ClothingItem>>({
    color: [],
    temperature: [],
    condition: [],
  })

  useEffect(() => {
    const saved = localStorage.getItem("closet-items")
    if (saved) {
      setClothes(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (clothes.length > 0) {
      localStorage.setItem("closet-items", JSON.stringify(clothes))
    }
  }, [clothes])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setUploadStep(2)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
  })

  const toggleColor = (color: string) => {
    setNewItem((prev) => ({
      ...prev,
      color: prev.color?.includes(color) ? prev.color.filter((c) => c !== color) : [...(prev.color || []), color],
    }))
  }

  const toggleTemperature = (temp: string) => {
    setNewItem((prev) => ({
      ...prev,
      temperature: prev.temperature?.includes(temp)
        ? prev.temperature.filter((t) => t !== temp)
        : [...(prev.temperature || []), temp],
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

  const handleSaveItem = () => {
    if (!newItem.name || !newItem.category || !newItem.type || !previewUrl) return

    const item: ClothingItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category as ClothingItem["category"],
      type: newItem.type,
      color: newItem.color || [],
      temperature: newItem.temperature || [],
      image: previewUrl,
      favorite: false,
      fit: newItem.fit,
      condition: newItem.condition,
    }

    setClothes((prev) => [...prev, item])
    resetForm()
  }

  const handleSaveEdit = () => {
    if (!editingItem || !newItem.name || !newItem.category || !newItem.type) return

    setClothes((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: newItem.name!,
              category: newItem.category as ClothingItem["category"],
              type: newItem.type!,
              color: newItem.color || [],
              temperature: newItem.temperature || [],
              fit: newItem.fit,
              condition: newItem.condition,
              image: previewUrl || item.image,
            }
          : item
      )
    )
    resetEdit()
  }

  const resetForm = () => {
    setIsOpen(false)
    setUploadStep(1)
    setPreviewUrl(null)
    setUploadedFile(null)
    setNewItem({ color: [], temperature: [], condition: [] })
  }

  const resetEdit = () => {
    setIsEditOpen(false)
    setEditingItem(null)
    setPreviewUrl(null)
    setNewItem({ color: [], temperature: [], condition: [] })
  }

  const startEdit = (item: ClothingItem) => {
    setEditingItem(item)
    setNewItem({
      name: item.name,
      category: item.category,
      type: item.type,
      color: item.color,
      temperature: item.temperature,
      fit: item.fit,
      condition: item.condition,
    })
    setPreviewUrl(item.image)
    setIsEditOpen(true)
  }

  const toggleFavorite = (id: string) => {
    setClothes((prev) => prev.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item)))
  }

  const deleteItem = (id: string) => {
    setClothes((prev) => prev.filter((item) => item.id !== id))
  }

  const filteredClothes = activeCategory === "all" ? clothes : clothes.filter((item) => item.category === activeCategory)

  const categories = ["all", "layer", "top", "bottom", "shoes", "accessories"]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Closet</h1>
            <p className="mt-1 text-muted-foreground">{clothes.length} items in your wardrobe</p>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open) }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Add Clothing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{uploadStep === 1 ? "Upload Clothing" : "Add Details"}</DialogTitle>
                <DialogDescription className="sr-only">
                  {uploadStep === 1 ? "Upload an image of your clothing item" : "Add details about your clothing item"}
                </DialogDescription>
              </DialogHeader>

              {uploadStep === 1 && (
                <div
                  {...getRootProps()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium">Drop your clothing image here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
              )}

              {uploadStep === 2 && (
                <div className="flex flex-col">
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-4">
                      {previewUrl && (
                        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-xl bg-secondary">
                          <Image src={previewUrl} alt="Preview" fill className="object-cover" />
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
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>
                                {newItem.category && categoryTypes[newItem.category].map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
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
                                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${newItem.color?.includes(color.value) ? "border-primary ring-2 ring-primary/20" : "border-transparent"}`}
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
                                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${newItem.condition?.includes(condition) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
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
                                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${newItem.condition?.includes(condition) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
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
                              <Select value={newItem.fit} onValueChange={(value) => setNewItem((prev) => ({ ...prev, fit: value }))}>
                                <SelectTrigger><SelectValue placeholder="Select fit" /></SelectTrigger>
                                <SelectContent>
                                  {fitOptions.map((fit) => (<SelectItem key={fit} value={fit}>{fit}</SelectItem>))}
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
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${newItem.condition?.includes(condition) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
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
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${newItem.temperature?.includes(temp.value) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
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
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setUploadStep(1)}>Back</Button>
                    <Button
                      className="flex-1"
                      onClick={handleSaveItem}
                      disabled={!newItem.name || !newItem.category || !newItem.type || !newItem.color?.length || !newItem.temperature?.length || (newItem.category !== "shoes" && newItem.category !== "accessories" && !newItem.fit) || !newItem.condition?.length}
                    >
                      Add to Closet
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) resetEdit() }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Clothing</DialogTitle>
                <DialogDescription className="sr-only">Edit details about your clothing item</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col">
                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-4">
                    {previewUrl && (
                      <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-xl bg-secondary">
                        <Image src={previewUrl} alt="Preview" fill className="object-cover" />
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
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {newItem.category && categoryTypes[newItem.category].map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
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
                              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${newItem.color?.includes(color.value) ? "border-primary ring-2 ring-primary/20" : "border-transparent"}`}
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
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${newItem.condition?.includes(condition) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
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
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${newItem.condition?.includes(condition) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
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
                            <Select value={newItem.fit} onValueChange={(value) => setNewItem((prev) => ({ ...prev, fit: value }))}>
                              <SelectTrigger><SelectValue placeholder="Select fit" /></SelectTrigger>
                              <SelectContent>
                                {fitOptions.map((fit) => (<SelectItem key={fit} value={fit}>{fit}</SelectItem>))}
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
                                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${newItem.condition?.includes(condition) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
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
                              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${newItem.temperature?.includes(temp.value) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
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
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={resetEdit}>Cancel</Button>
                  <Button
                    className="flex-1"
                    onClick={handleSaveEdit}
                    disabled={!newItem.name || !newItem.category || !newItem.type || !newItem.color?.length || !newItem.temperature?.length || (newItem.category !== "shoes" && newItem.category !== "accessories" && !newItem.fit) || !newItem.condition?.length}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="mb-6 flex w-full justify-start gap-2 bg-transparent p-0">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-full border border-border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat === "all" ? "All Items" : categoryLabels[cat]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
            {filteredClothes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-secondary p-6">
                  <Shirt className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No items yet</h3>
                <p className="mt-1 text-muted-foreground">Add your first clothing item to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredClothes.map((item) => (
                  <Card key={item.id} className="group relative overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform group-hover:translate-y-0">
                          <div className="flex justify-center gap-2">
                            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => toggleFavorite(item.id)}>
                              <Heart className={`h-4 w-4 ${item.favorite ? "fill-red-500 text-red-500" : ""}`} />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => startEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => deleteItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="truncate font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.type}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
