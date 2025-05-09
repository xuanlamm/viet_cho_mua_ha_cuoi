"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string; // Add className as an optional property
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div
        className="cursor-pointer w-full h-full transition-transform hover:scale-[1.02]"
        onClick={() => setIsOpen(true)}
        role="button"
        aria-label={`Xem ảnh ${alt}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(true);
          }
        }}
      >
        <img
          loading="lazy"
          src={src || "/placeholder.svg"}
          alt={alt}
          className={`w-full h-full object-cover ${
            alt === "Ảnh cá nhân" ? "" : "rounded-[10px]"
          }`}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          <div className="relative">
            <button
              onClick={() => setIsOpen(false)}
              className="closeBtn absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full z-10"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={src || "/placeholder.svg"}
              alt={alt}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
