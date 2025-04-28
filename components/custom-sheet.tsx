"use client"

import React from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ChevronLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface CustomSheetProps {
  navigationItems: {
    id: string
    icon: React.ReactNode
    label: string
  }[]
  activeSection: string
  scrollToSection: (sectionId: string) => void
  setIsMobileMenuOpen: (isOpen: boolean) => void
}

export function CustomSheet({
  navigationItems,
  activeSection,
  scrollToSection,
  setIsMobileMenuOpen,
}: CustomSheetProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden mr-2 hover:bg-pink-50">
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-white">
        <div className="p-4 bg-white flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="hover:bg-pink-50">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        <div className="decorative-line w-full mt-0"></div>
        <Separator />
        <nav className="flex-1 p-4 space-y-1 bg-white">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-pink-50 transition-colors ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-pink-50 to-pink-100 text-pink-600 font-medium border-l-2 border-pink-400"
                  : "text-gray-900"
              }`}
              onClick={(e) => {
                e.preventDefault()
                // Close the sheet first before scrolling
                setOpen(false)
                setIsMobileMenuOpen(false)

                // Add a small delay before scrolling to ensure the sheet is closed
                setTimeout(() => {
                  scrollToSection(item.id)
                }, 100)
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
