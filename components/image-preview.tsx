"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [transformOrigin, setTransformOrigin] = useState("center center")
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

  // Reset zoom and pan when closing
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setZoomLevel(1)
      setTransformOrigin("center center")
      setImgOffset({ x: 0, y: 0 })
    }
  }

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(Number(e.target.value))
    setImgOffset({ x: 0, y: 0 }) // Reset pan on zoom change
  }

  const handleReset = () => {
    setZoomLevel(1)
    setTransformOrigin("center center")
    setImgOffset({ x: 0, y: 0 })
  }

  const handleCenter = () => {
    setTransformOrigin("center center")
    setImgOffset({ x: 0, y: 0 })
  }

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel === 1) return
    setDragging(true)
    setDragStart({ x: e.clientX - imgOffset.x, y: e.clientY - imgOffset.y })
  }
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || zoomLevel === 1) return;

    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const containerRect = container.getBoundingClientRect();

    // Use the displayed (scaled) image size
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let displayWidth = containerRect.width;
    let displayHeight = containerRect.height;
    if (displayWidth / displayHeight > imgAspect) {
      displayWidth = displayHeight * imgAspect;
    } else {
      displayHeight = displayWidth / imgAspect;
    }
    const scaledWidth = displayWidth * zoomLevel;
    const scaledHeight = displayHeight * zoomLevel;

    // Calculate max offset so image cannot be dragged out of canvas
    const maxOffsetX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - containerRect.height) / 2);

    const newX = e.clientX - (dragStart?.x ?? 0);
    const newY = e.clientY - (dragStart?.y ?? 0);

    setImgOffset({
      x: clamp(newX, -maxOffsetX, maxOffsetX),
      y: clamp(newY, -maxOffsetY, maxOffsetY),
    });
  }
  const handleMouseUp = () => setDragging(false)

  return (
    <div>
      <div
        className="cursor-pointer w-full h-full transition-transform hover:scale-[1.02]"
        onClick={() => setIsOpen(true)}
        role="button"
        aria-label={`Xem ảnh ${alt}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(true)
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

      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent
          className="max-w-4xl p-0 overflow-hidden bg-transparent border-none"
        >
          {/* Toolbar */}
          <div className="toolbar fixed w-max left-1/2 -translate-x-1/2 top-0 z-20 flex gap-2 items-center bg-white/80 rounded-lg px-4 py-2 shadow border select-none">
            <span className="font-medium text-sm">
              Thu phóng: <span className="w-10 inline-block">{zoomLevel.toFixed(2)}x</span>
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoomLevel}
              onChange={handleSlider}
              className="w-40 bg-pink-500 cursor-pointer"
              style={{
                accentColor: "#2563eb",
                height: "4px",
                borderRadius: "2px",
              }}
            />
            <button
              onClick={handleReset}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium"
            >
              Đặt lại
            </button>
            <button
              onClick={handleCenter}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium"
            >
              Về giữa
            </button>
          </div>
          <div
            ref={containerRef}
            className="previewCanvas relative overflow-hidden w-full flex justify-center items-center"
            style={{
              height: "fit-content",
              cursor: zoomLevel > 1 ? (dragging ? "grabbing" : "grab") : "pointer",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={src || "/placeholder.svg"}
              alt={alt}
              className={`max-h-full object-contain rounded-lg select-none ${
                !dragging ? "transition-transform duration-300" : ""
              }`}
              style={{
                transform: `scale(${zoomLevel}) translate(${imgOffset.x / zoomLevel}px, ${imgOffset.y / zoomLevel}px)`,
                transformOrigin: transformOrigin,
                userSelect: "none",
                pointerEvents: "auto",
              }}
              draggable={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}