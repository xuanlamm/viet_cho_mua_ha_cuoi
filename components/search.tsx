"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchComponentProps {
  onSearch: (query: string) => void
  onNavigate: (direction: "next" | "prev") => void
  onClose: () => void
  searchResults: { count: number; currentIndex: number }
}

export function SearchComponent({ onSearch, onNavigate, onClose, searchResults }: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Perform search if query is not empty
    if (query.trim().length > 0) {
      onSearch(query)
    }
  }

  // Handle search button click
  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length > 0) {
      onSearch(searchQuery)
    }
    // Refocus the input after clicking the search button
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }
  }

  // Toggle search open/closed
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      // Focus the input when opening the search
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      // Clear search when closing
      onClose()
      setSearchQuery("")
    }
  }

  return (
    <div className="relative search-container">
      <Button variant="ghost" size="icon" onClick={toggleSearch} title="Tìm kiếm" className="hover:bg-pink-50">
        <Search className="h-5 w-5 text-gray-600" />
      </Button>

      {isSearchOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-pink-100 rounded-md shadow-lg p-3 z-50">
          <div className="flex flex-col gap-2">
            <div className="flex">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 px-3 py-1 text-sm border border-pink-100 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-300"
                placeholder="Tìm kiếm nội dung..."
                lang="vi"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
              />
              <Button
                type="button"
                className="rounded-l-none bg-pink-500 hover:bg-pink-600"
                onClick={handleSearchClick}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {searchResults.count > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>
                  {searchResults.currentIndex + 1} / {searchResults.count} kết quả
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs border-pink-100 hover:bg-pink-50"
                    onClick={() => {
                      onNavigate("prev")
                      // Refocus the input after navigation
                      if (searchInputRef.current) {
                        searchInputRef.current?.focus()
                      }
                    }}
                  >
                    Trước
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs border-pink-100 hover:bg-pink-50"
                    onClick={() => {
                      onNavigate("next")
                      // Refocus the input after navigation
                      if (searchInputRef.current) {
                        searchInputRef.current?.focus()
                      }
                    }}
                  >
                    Sau
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs border-pink-100 hover:bg-pink-50"
                    onClick={() => {
                      onClose()
                      setIsSearchOpen(false)
                      setSearchQuery("")
                    }}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            )}

            {searchResults.count === 0 && searchQuery.trim() !== "" && (
              <div className="text-xs text-gray-500 mt-1">Không tìm thấy kết quả cho "{searchQuery}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
