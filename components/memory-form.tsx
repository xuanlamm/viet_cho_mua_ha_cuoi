"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, ImageIcon, X } from "lucide-react"

export function MemoryForm() {
  const [images, setImages] = useState<string[]>(["", ""])
  const [isOpen, setIsOpen] = useState(false)

  // This would normally handle file uploads, but for demo purposes we'll just use placeholders
  const handleImageUpload = (index: number) => {
    const newImages = [...images]
    newImages[index] = `/placeholder.svg?height=200&width=300&text=Memory+${index + 1}`
    setImages(newImages)
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages[index] = ""
    setImages(newImages)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // This would normally save the memory, but for demo purposes we'll just close the dialog
    setIsOpen(false)
    // Reset form
    setImages(["", ""])
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Add New Memory</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add a New Memory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Enter a title for this memory" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" placeholder="e.g., Spring 2022" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe this memory..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Images (Max 2)</Label>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((index) => (
                <div key={index} className="relative aspect-[4/3]">
                  {images[index] ? (
                    <div className="h-full w-full relative rounded-md overflow-hidden border">
                      <img
                        src={images[index] || "/placeholder.svg"}
                        alt={`Memory image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleImageUpload(index)}
                      className="h-full w-full border border-dashed rounded-md flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add image</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Memory</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
