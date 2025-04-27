"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Pen, Clock, Camera, Heart, Menu, Search, Bug, ChevronDown, ChevronUp, Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { PasswordProtection } from "@/components/password-protection"
import { DecorativeCircle, DecorativeDots, FloatingHearts } from "@/components/decorative-elements"

export default function Home() {
  // State for well wishes
  const [wishes, setWishes] = useState<WishType[]>([
    {
      id: "1",
      name: "Emma Thompson",
      relationship: "Former Student",
      message: "You were the best math teacher I ever had. Thank you for believing in me!",
      date: "May 10, 2024",
    },
    {
      id: "2",
      name: "Michael Chen",
      relationship: "Colleague",
      message: "It's been an honor working alongside you these past 15 years. Enjoy your well-deserved retirement!",
      date: "May 12, 2024",
    },
  ])

  const [newWish, setNewWish] = useState<Omit<WishType, "id" | "date">>({
    name: "",
    relationship: "",
    message: "",
  })

  const [activeSection, setActiveSection] = useState<string>("letter")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLetterUnlocked, setIsLetterUnlocked] = useState(false)

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchResults, setSearchResults] = useState<{ count: number; currentIndex: number }>({
    count: 0,
    currentIndex: 0,
  })
  const [highlightedElements, setHighlightedElements] = useState<Element[]>([])

  // Handle scroll to set active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["letter", "memories", "timeline", "wishes"]
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetHeight = element.offsetHeight

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  const handleWishChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewWish((prev) => ({ ...prev, [name]: value }))
  }

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!newWish.name || !newWish.message) return

    setIsSubmitting(true)

    try {
      // Send the wish to the API
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWish),
      })

      if (response.ok) {
        const result = await response.json()

        // Add the new wish to the local state
        setWishes((prev) => [
          ...prev,
          {
            id: result.wish.id || Date.now().toString(),
            ...newWish,
            date:
              result.wish.date ||
              new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
          },
        ])

        // Show success message
        setSubmitSuccess(true)
        setTimeout(() => setSubmitSuccess(false), 3000)

        // Reset form
        setNewWish({
          name: "",
          relationship: "",
          message: "",
        })
      } else {
        console.error("Failed to submit wish")
      }
    } catch (error) {
      console.error("Error submitting wish:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Improved search functionality that only searches in specific content sections
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous highlights
    clearHighlights()

    if (!searchQuery.trim()) return

    // Get only the content sections we want to search in
    const contentSections = [
      document.getElementById("letter"),
      document.getElementById("memories"),
      document.getElementById("timeline"),
      document.getElementById("wishes"),
    ].filter(Boolean) as HTMLElement[]

    const searchText = searchQuery.toLowerCase()
    const matchedElements: Element[] = []

    // Search only within the specified content sections
    contentSections.forEach((section) => {
      // Get all text elements within this section
      const textElements = section.querySelectorAll("p, h2, h3, h4, h5, h6, span:not(.search-highlight)")

      textElements.forEach((el) => {
        // Skip elements that don't contain text or are part of the search UI
        if (!el.textContent || el.closest(".search-container") || el.classList.contains("search-highlight")) {
          return
        }

        const content = el.textContent.toLowerCase()
        if (content.includes(searchText)) {
          // Store original content for restoration later
          el.setAttribute("data-original-content", el.innerHTML)

          // Highlight matches
          const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
          el.innerHTML = el.innerHTML.replace(regex, '<span class="search-highlight bg-yellow-200">$1</span>')

          matchedElements.push(el)
        }
      })
    })

    setHighlightedElements(matchedElements)
    setSearchResults({
      count: matchedElements.length,
      currentIndex: matchedElements.length > 0 ? 0 : -1,
    })

    // Scroll to first result if found
    if (matchedElements.length > 0) {
      matchedElements[0].scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Navigate between search results
  const navigateSearchResults = (direction: "next" | "prev") => {
    if (highlightedElements.length === 0) return

    const newIndex =
      direction === "next"
        ? (searchResults.currentIndex + 1) % highlightedElements.length
        : (searchResults.currentIndex - 1 + highlightedElements.length) % highlightedElements.length

    setSearchResults((prev) => ({ ...prev, currentIndex: newIndex }))
    highlightedElements[newIndex].scrollIntoView({ behavior: "smooth", block: "center" })
  }

  // Clear search highlights
  const clearHighlights = () => {
    highlightedElements.forEach((el) => {
      const originalContent = el.getAttribute("data-original-content")
      if (originalContent) {
        el.innerHTML = originalContent
      }
    })
    setHighlightedElements([])
    setSearchResults({ count: 0, currentIndex: -1 })
  }

  // Close search and clear highlights
  const closeSearch = () => {
    clearHighlights()
    setIsSearchOpen(false)
    setSearchQuery("")
  }

  // Add the SearchComponent function inside the main component
  function SearchComponent() {
    return (
      <div className="relative search-container">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          title="Search"
          className="hover:bg-pink-50"
        >
          <Search className="h-5 w-5 text-gray-600" />
        </Button>

        {isSearchOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-pink-100 rounded-md shadow-lg p-3 z-10">
            <form onSubmit={handleSearch} className="flex flex-col gap-2">
              <div className="flex">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-pink-100 rounded-l-md focus:outline-none focus:ring-1 focus:ring-pink-300"
                  placeholder="Search content..."
                />
                <Button
                  type="submit"
                  className="rounded-l-none bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults.count > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {searchResults.currentIndex + 1} of {searchResults.count} results
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs border-pink-100 hover:bg-pink-50"
                      onClick={() => navigateSearchResults("prev")}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs border-pink-100 hover:bg-pink-50"
                      onClick={() => navigateSearchResults("next")}
                    >
                      Next
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs border-pink-100 hover:bg-pink-50"
                      onClick={closeSearch}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {searchResults.count === 0 && searchQuery.trim() !== "" && (
                <div className="text-xs text-gray-500 mt-1">No results found for "{searchQuery}"</div>
              )}
            </form>
          </div>
        )}
      </div>
    )
  }

  // Fetch wishes from Vercel KV when the component mounts
  useEffect(() => {
    const fetchWishes = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        console.log("Fetching wishes from API...")
        const response = await fetch("/api/wishes")

        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Wishes data received:", data)

        if (data.wishes && Array.isArray(data.wishes) && data.wishes.length > 0) {
          setWishes(data.wishes)
          console.log(`Successfully loaded ${data.wishes.length} wishes`)
        } else {
          console.log("No wishes found or empty array returned")
        }
      } catch (error) {
        console.error("Failed to fetch wishes:", error)
        setLoadError(error instanceof Error ? error.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishes()
  }, [])

  return (
    <div className="flex h-screen bg-white print:block relative overflow-hidden">
      {/* Decorative background elements */}
      <DecorativeCircle className="w-96 h-96 -top-20 -left-20" />
      <DecorativeCircle className="w-96 h-96 -bottom-20 -right-20" />
      <DecorativeDots className="w-full h-full opacity-10" />

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex w-64 flex-col border-r print:hidden bg-white relative z-10">
        <div className="p-4">
          <h1 className="text-xl font-semibold gradient-text">Retirement Letter</h1>
          <div className="decorative-line w-1/2 mt-2"></div>
        </div>
        <Separator />
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "letter", icon: <Pen className="mr-2 h-4 w-4" />, label: "Letter" },
            { id: "memories", icon: <Camera className="mr-2 h-4 w-4" />, label: "Memories" },
            { id: "timeline", icon: <Clock className="mr-2 h-4 w-4" />, label: "Timeline" },
            { id: "wishes", icon: <Heart className="mr-2 h-4 w-4" />, label: "Wishes" },
          ].map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-pink-50 transition-colors ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-pink-50 to-pink-100 text-pink-600 font-medium border-l-2 border-pink-400"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b print:hidden bg-white relative z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="md:hidden mr-2 hover:bg-pink-50">
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
              <h1 className="text-xl font-semibold">
                <span className="gradient-text">Teacher Tribute</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <SearchComponent />
              <a
                href="https://github.com/yourusername/teacher-tribute/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" title="Report Bug" className="hover:bg-pink-50">
                  <Bug className="h-5 w-5 text-gray-600" />
                </Button>
              </a>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col md:flex-row h-full">
            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
              {/* Letter Section */}
              <motion.section
                id="letter"
                className="mb-12 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="max-w-3xl mx-auto bg-white p-8 border border-pink-100 rounded-lg shadow-sm paper-texture">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold gradient-text">Retirement Letter</h2>
                    <span className="text-sm text-pink-400 font-medium">May 2024</span>
                  </div>

                  {isLetterUnlocked ? (
                    <div className="space-y-4">
                      <p className="text-lg">Dear [Teacher's Name],</p>
                      <p className="text-gray-700 leading-relaxed">
                        As I prepare to graduate and embark on my university journey, I wanted to take a moment to
                        express my deepest gratitude for the profound impact you've had on my education and personal
                        growth.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Your passion for teaching has ignited a love for learning within me that I will carry throughout
                        my life. The knowledge, wisdom, and guidance you've shared have been invaluable, and I am truly
                        grateful for the countless hours you've dedicated to helping me and my classmates succeed.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        I'll never forget how you [specific memory or lesson that was meaningful]. That moment, along
                        with many others, has shaped my perspective and influenced my decision to pursue [field of
                        study] at university.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        As you retire, please know that your legacy lives on in the hearts and minds of all the students
                        whose lives you've touched. Your dedication to education has created ripples that will continue
                        to spread far beyond the classroom.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        I wish you all the best in this new chapter of your life. May it be filled with joy, relaxation,
                        and new adventures.
                      </p>
                      <div className="pt-4">
                        <p className="text-gray-700">With immense gratitude and respect,</p>
                        <p className="font-semibold mt-2">[Your Name]</p>
                        <p className="text-pink-400 text-sm">Class of 2024</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Blurred content */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="space-y-4 filter blur-md select-none pointer-events-none">
                          <p className="text-lg">Dear [Teacher's Name],</p>
                          <p className="text-gray-700 leading-relaxed">
                            As I prepare to graduate and embark on my university journey, I wanted to take a moment to
                            express my deepest gratitude for the profound impact you've had on my education and personal
                            growth.
                          </p>
                          <p className="text-gray-700 leading-relaxed">
                            Your passion for teaching has ignited a love for learning within me that I will carry
                            throughout my life. The knowledge, wisdom, and guidance you've shared have been invaluable,
                            and I am truly grateful for the countless hours you've dedicated to helping me and my
                            classmates succeed.
                          </p>
                          {/* More blurred paragraphs */}
                        </div>
                      </div>

                      {/* Password protection overlay */}
                      <div className="relative bg-white bg-opacity-90 backdrop-blur-sm py-10">
                        <PasswordProtection onUnlock={() => setIsLetterUnlocked(true)} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>

              {/* Memories Section */}
              <motion.section
                id="memories"
                className="mb-12 relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-2xl font-semibold mb-6 gradient-text">Cherished Memories</h2>
                <div className="decorative-line w-32 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {memories.map((memory, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <MemoryCard {...memory} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Timeline Section */}
              <motion.section
                id="timeline"
                className="mb-12 relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-2xl font-semibold mb-6 gradient-text">Our Journey</h2>
                <div className="decorative-line w-32 mb-6"></div>
                <div className="space-y-4">
                  {timelineItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <TimelineItem {...item} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Wishes Section */}
              <motion.section
                id="wishes"
                className="mb-12 relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <FloatingHearts />
                <h2 className="text-2xl font-semibold mb-6 gradient-text">Well Wishes</h2>
                <div className="decorative-line w-32 mb-6"></div>

                {/* Well Wishes Form */}
                <div className="max-w-2xl mx-auto bg-white p-6 border border-pink-100 rounded-lg shadow-sm mb-8">
                  <form className="space-y-4" onSubmit={handleWishSubmit}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newWish.name}
                        onChange={handleWishChange}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <input
                        type="text"
                        id="relationship"
                        name="relationship"
                        value={newWish.relationship}
                        onChange={handleWishChange}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Student, Colleague, Parent, etc."
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={newWish.message}
                        onChange={handleWishChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Share your well wishes, memories, or gratitude..."
                        required
                      ></textarea>
                    </div>
                    <div className="relative">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <span className="flex items-center">
                            <Gift className="mr-2 h-4 w-4" />
                            Send Your Wishes
                          </span>
                        )}
                      </Button>
                      <AnimatePresence>
                        {submitSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-full left-0 right-0 mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md border border-green-200"
                          >
                            <div className="flex items-center">
                              <Sparkles className="h-4 w-4 mr-2 text-green-500" />
                              Your message has been added successfully!
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </form>
                </div>

                {/* Well Wishes Display */}
                <div className="max-w-2xl mx-auto space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-200 border-r-pink-500"></div>
                      <p className="mt-2 text-gray-600">Loading wishes...</p>
                    </div>
                  ) : loadError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                      <p>Error loading wishes: {loadError}</p>
                      <p className="text-sm mt-1">Please try refreshing the page.</p>
                    </div>
                  ) : wishes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No wishes yet. Be the first to leave a message!</p>
                    </div>
                  ) : (
                    wishes.map((wish, index) => (
                      <motion.div
                        key={wish.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="wish-card bg-white p-5 border border-pink-100 rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{wish.name}</h3>
                            {wish.relationship && <p className="text-sm text-pink-400">{wish.relationship}</p>}
                          </div>
                          <span className="text-xs text-gray-500 bg-pink-50 px-2 py-1 rounded-full">{wish.date}</span>
                        </div>
                        <p className="text-sm text-gray-700">{wish.message}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>
            </div>

            {/* Teacher Profile Sidebar */}
            <div className="w-full md:w-80 border-l p-6 bg-gradient-to-b from-white to-pink-50 print:hidden">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 mb-4 ring-4 ring-pink-100 ring-offset-2">
                    <div className="bg-gradient-to-br from-pink-200 to-pink-300 h-full w-full flex items-center justify-center text-2xl font-semibold text-white">
                      T
                    </div>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-pink-100 rounded-full p-1">
                    <Heart className="h-4 w-4 text-pink-500" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold mt-2">[Teacher's Name]</h2>
                <p className="text-pink-500">[Subject] Teacher</p>
                <p className="text-gray-500 text-sm">[School Name]</p>
              </div>

              <Separator className="my-4 bg-pink-100" />

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-pink-500">Years of Service</h3>
                  <p className="text-gray-900">1990 - 2024</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-pink-500">Subjects Taught</h3>
                  <p className="text-gray-900">[Subject 1], [Subject 2]</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-pink-500">Education</h3>
                  <p className="text-gray-900">[University Name]</p>
                </div>
              </div>

              <Separator className="my-4 bg-pink-100" />

              <div>
                <h3 className="text-sm font-medium text-pink-500 mb-2">Notable Achievements</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-300 mt-1.5 mr-2"></span>
                    <span className="text-gray-700">[Achievement 1]</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-300 mt-1.5 mr-2"></span>
                    <span className="text-gray-700">[Achievement 2]</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-300 mt-1.5 mr-2"></span>
                    <span className="text-gray-700">[Achievement 3]</span>
                  </li>
                </ul>
              </div>

              <Separator className="my-4 bg-pink-100" />

              <div>
                <h3 className="text-sm font-medium text-pink-500 mb-2">Favorite Quote</h3>
                <blockquote className="text-gray-700 italic text-sm bg-white p-3 border-l-2 border-pink-300 rounded-r-md">
                  "Education is not the filling of a pail, but the lighting of a fire."
                  <footer className="text-pink-400 mt-1">— W.B. Yeats</footer>
                </blockquote>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Memory Card Component with static images
function MemoryCard({
  title,
  date,
  description,
  images = [],
}: {
  title: string
  date: string
  description: string
  images?: string[]
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="memory-card card-hover bg-white">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-gray-800">{title}</h3>
          <span className="text-xs bg-pink-50 text-pink-500 px-2 py-1 rounded-full">{date}</span>
        </div>

        {description.length > 100 && !expanded ? (
          <>
            <p className="text-sm text-gray-700 mb-2">{description.substring(0, 100)}...</p>
            <button
              onClick={() => setExpanded(true)}
              className="text-xs flex items-center text-pink-500 hover:text-pink-600 transition-colors"
            >
              Read more <ChevronDown className="h-3 w-3 ml-1" />
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-2">{description}</p>
            {description.length > 100 && (
              <button
                onClick={() => setExpanded(false)}
                className="text-xs flex items-center text-pink-500 hover:text-pink-600 transition-colors"
              >
                Show less <ChevronUp className="h-3 w-3 ml-1" />
              </button>
            )}
          </>
        )}

        {/* Static images display */}
        {images && images.length > 0 && (
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              {images.map(
                (image, index) =>
                  image && (
                    <div key={index} className="relative aspect-[4/3] group overflow-hidden rounded-md">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Memory image for ${title}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Timeline Item Component
function TimelineItem({ year, title, description }: { year: string; title: string; description: string }) {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div className="w-px h-full bg-pink-100"></div>
        <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-pink-400"></div>
        </div>
        <div className="w-px h-full bg-pink-100"></div>
      </div>
      <div className="pb-8 pt-1">
        <span className="text-xs font-medium text-pink-500 bg-pink-50 px-2 py-1 rounded-full">{year}</span>
        <h3 className="text-base font-medium mt-2">{title}</h3>
        <p className="text-sm text-gray-700 mt-1">{description}</p>
      </div>
    </div>
  )
}

// Type for well wishes
type WishType = {
  id: string
  name: string
  relationship: string
  message: string
  date: string
}

// Sample data
const memories = [
  {
    title: "Class Project",
    date: "Fall 2021",
    description:
      "That time we worked on the science fair project and you stayed after hours to help us perfect our presentation. I remember how you encouraged us to think outside the box and approach the problem from different angles. Your patience and guidance helped us win first place, but more importantly, it taught me the value of perseverance and creative thinking.",
    images: [
      "/placeholder.svg?height=200&width=300&text=Science+Fair",
      "/placeholder.svg?height=200&width=300&text=Project+Display",
    ],
  },
  {
    title: "Field Trip",
    date: "Spring 2022",
    description:
      "The museum field trip where you showed us how our classroom lessons connect to the real world. You made history come alive by sharing stories and insights that weren't in our textbooks. I'll never forget how you explained the significance of each artifact and encouraged us to ask questions.",
    images: ["/placeholder.svg?height=200&width=300&text=Museum+Visit"],
  },
  {
    title: "Difficult Lesson",
    date: "Winter 2022",
    description:
      "When I struggled with that challenging concept and you found a creative way to help me understand it. You noticed I was falling behind and offered to stay after class. Instead of just repeating the same explanation, you used a completely different approach that finally made everything click. That moment changed my relationship with the subject forever.",
    images: [],
  },
  {
    title: "Book Recommendation",
    date: "Fall 2023",
    description:
      "The book you recommended that opened my eyes to new perspectives and became one of my favorites. You somehow knew exactly what I needed to read at that point in my life. The themes in that book helped me navigate some personal challenges and inspired my college application essay.",
    images: ["/placeholder.svg?height=200&width=300&text=Book+Cover"],
  },
]

const timelineItems = [
  {
    year: "2020",
    title: "First Day",
    description: "My first day in your class, feeling nervous but you made everyone feel welcome.",
  },
  {
    year: "2021",
    title: "Major Project",
    description: "Working on that challenging year-long project that taught me perseverance.",
  },
  {
    year: "2022",
    title: "Academic Competition",
    description: "When you coached our team for the regional competition and we placed second!",
  },
  {
    year: "2023",
    title: "College Applications",
    description: "Your guidance and letter of recommendation helped me get accepted to my dream university.",
  },
  {
    year: "2024",
    title: "Graduation",
    description: "Completing high school with the knowledge and confidence you helped instill in me.",
  },
]
