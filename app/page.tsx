"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Pen, Clock, Camera, Heart, Menu, Search, Bug, Gift, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { PasswordProtection } from "@/components/password-protection"
import { DecorativeCircle, DecorativeDots, FloatingHearts } from "@/components/decorative-elements"
import { Logo } from "@/components/logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ImagePreview } from "@/components/image-preview"

export default function Home() {
  // State for well wishes
  const [wishes, setWishes] = useState<WishType[]>([
    {
      id: "0",
      name: "Nguyễn Văn A",
      nickname: "nva",
      relationship: "Học sinh",
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      date: "XX/YY/ZZZZ",
    }
  ])

  const [newWish, setNewWish] = useState<Omit<WishType, "id" | "date">>({
    name: "",
    nickname: "",
    relationship: "",
    message: "",
  })

  const [activeSection, setActiveSection] = useState<string>("profile")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLetterUnlocked, setIsLetterUnlocked] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mainContentRef = useRef<HTMLDivElement>(null)

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchResults, setSearchResults] = useState<{ count: number; currentIndex: number }>({
    count: 0,
    currentIndex: 0,
  })
  const [highlightedElements, setHighlightedElements] = useState<Element[]>([])

  // Reset scroll position on page load
  useEffect(() => {
    // Reset scroll position to top when component mounts
    window.scrollTo(0, 0)
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0
    }
  }, [])

  // Handle scroll to set active section using Intersection Observer
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the section that has the largest intersection ratio
      const visibleSections = entries.filter((entry) => entry.isIntersecting)

      if (visibleSections.length > 0) {
        // Sort by intersection ratio in descending order
        const mostVisible = visibleSections.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        setActiveSection(mostVisible.target.id)
      }
    }

    const observerOptions = {
      root: mainContentRef.current, // Use the main content as the viewport
      rootMargin: "-100px 0px -100px 0px", // Adjust based on your header/footer height
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // Multiple thresholds for better accuracy
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all sections
    const sections = document.querySelectorAll("section[id]")
    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section)
      })
    }
  }, [isLetterUnlocked]) // Re-initialize when letter is unlocked

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
              new Date().toLocaleDateString("vi-VN", {
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
          nickname: "",
          relationship: "",
          message: "",
        })
      } else {
        console.error("Không thể gửi đóng góp")
      }
    } catch (error) {
      console.error("Lỗi khi gửi đóng góp:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Improved search functionality that searches as you type
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim().length > 0) {
      performSearch(query)
    } else {
      clearHighlights()
      setSearchResults({ count: 0, currentIndex: -1 })
    }
    // Ensure the input stays focused
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }
  }

  // Perform search with the given query
  const performSearch = (query: string) => {
    // Clear previous highlights
    clearHighlights()

    if (!query.trim()) return

    // Get only the content sections we want to search in
    const contentSections = [
      document.getElementById("profile"),
      document.getElementById("letter"),
      document.getElementById("memories"),
      document.getElementById("timeline"),
      document.getElementById("wishes"),
    ].filter(Boolean) as HTMLElement[]

    const searchText = query.toLowerCase()
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
      highlightCurrentResult(0)
      scrollToElement(matchedElements[0])
    }
  }

  // Scroll to an element within the main content area
  const scrollToElement = (element: Element) => {
    if (!mainContentRef.current) return

    const container = mainContentRef.current
    const headerHeight = 80 // Adjust based on your header height

    // Calculate the position of the element relative to the container
    const elementRect = element.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const relativeTop = elementRect.top - containerRect.top + container.scrollTop - headerHeight

    // Scroll the container to the element
    container.scrollTo({
      top: relativeTop,
      behavior: "smooth",
    })
  }

  // Highlight the current result with a different color
  const highlightCurrentResult = (index: number) => {
    // Reset all highlights to default color
    document.querySelectorAll(".search-highlight").forEach((el) => {
      el.classList.remove("bg-green-200")
      el.classList.add("bg-yellow-200")
    })

    // Highlight the current result with a different color
    if (highlightedElements[index]) {
      const highlights = highlightedElements[index].querySelectorAll(".search-highlight")
      highlights.forEach((el) => {
        el.classList.remove("bg-yellow-200")
        el.classList.add("bg-green-200")
      })
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
    highlightCurrentResult(newIndex)
    scrollToElement(highlightedElements[newIndex])
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
          onClick={() => {
            setIsSearchOpen(!isSearchOpen)
            // Focus the input when opening the search
            if (!isSearchOpen && searchInputRef.current) {
              setTimeout(() => searchInputRef.current?.focus(), 100)
            }
          }}
          title="Tìm kiếm"
          className="hover:bg-pink-50"
        >
          <Search className="h-5 w-5 text-gray-600" />
        </Button>

        {isSearchOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-pink-100 rounded-md shadow-lg p-3 z-10">
            <div className="flex flex-col gap-2">
              <div className="flex">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="flex-1 px-3 py-1 text-sm border border-pink-100 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-300"
                  placeholder="Tìm kiếm nội dung..."
                  onBlur={(e) => {
                    // Prevent losing focus when clicking inside the search container
                    if (e.relatedTarget && e.relatedTarget.closest(".search-container")) {
                      e.target.focus()
                    }
                  }}
                />
                <Button
                  type="button"
                  className="rounded-l-none bg-pink-500 hover:bg-pink-600"
                  onClick={(e) => {
                    e.preventDefault()
                    performSearch(searchQuery)
                    // Refocus the input after clicking the search button
                    if (searchInputRef.current) {
                      searchInputRef.current.focus()
                    }
                  }}
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
                        navigateSearchResults("prev")
                        // Refocus the input after navigation
                        if (searchInputRef.current) {
                          searchInputRef.current.focus()
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
                        navigateSearchResults("next")
                        // Refocus the input after navigation
                        if (searchInputRef.current) {
                          searchInputRef.current.focus()
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
                      onClick={closeSearch}
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


  // Fetch wishes from Vercel KV when the component mounts
  useEffect(() => {
    const fetchWishes = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        console.log("Đang tải đóng góp từ API...")
        const response = await fetch("/api/wishes")

        if (!response.ok) {
          throw new Error(`API trả về trạng thái: ${response.status}`)
        }

        const data = await response.json()
        console.log("Dữ liệu đóng góp đã nhận:", data)

        if (data.wishes && Array.isArray(data.wishes) && data.wishes.length > 0) {
          setWishes(data.wishes)
          console.log(`Đã tải thành công ${data.wishes.length} đóng góp`)
        } else {
          console.log("Không tìm thấy đóng góp hoặc mảng trống được trả về")
        }
      } catch (error) {
        console.error("Không thể tải đóng góp:", error)
        setLoadError(error instanceof Error ? error.message : "Lỗi không xác định")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishes()
  }, [])

  // Navigation items
  const navigationItems = [
    { id: "profile", icon: <User className="mr-2 h-4 w-4" />, label: "Thông tin giáo viên" },
    { id: "letter", icon: <Pen className="mr-2 h-4 w-4" />, label: "Hộp thư đến" },
    { id: "memories", icon: <Camera className="mr-2 h-4 w-4" />, label: "Kỷ niệm" },
    { id: "timeline", icon: <Clock className="mr-2 h-4 w-4" />, label: "Dòng thời gian" },
    { id: "wishes", icon: <Heart className="mr-2 h-4 w-4" />, label: "Đóng góp" },
  ]

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    if (!mainContentRef.current) return

    const section = document.getElementById(sectionId)
    if (!section) return

    const container = mainContentRef.current
    const headerHeight = 80 // Adjust based on your header height

    // Calculate the position of the section relative to the container
    const sectionRect = section.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const relativeTop = sectionRect.top - containerRect.top + container.scrollTop - headerHeight

    // Scroll the container to the section
    container.scrollTo({
      top: relativeTop,
      behavior: "smooth",
    })

    // Update active section
    setActiveSection(sectionId)
  }

  // Teacher profile component
  const TeacherProfile = () => (
    <div className="flex flex-col items-center text-center mb-6">
      <div className="relative">
        <Avatar className="h-24 w-24 mb-4 ring-4 ring-pink-100 ring-offset-2">
          <ImagePreview src={"/kBQrrlb.jpeg"} alt="Cô Loan" />
        </Avatar>
        <div className="absolute -bottom-2 -right-2 bg-pink-100 rounded-full p-1">
          <Heart className="h-4 w-4 text-pink-500" />
        </div>
      </div>
      <h2 className="text-xl font-semibold mt-2">Nguyễn Thị Thuý Loan</h2>
      <p className="text-pink-500">Giáo viên</p>
      <p className="text-gray-500 text-sm">THPT Quang Trung Đống Đa</p>

      <Separator className="my-4 bg-pink-100 w-full" />

      <div className="space-y-3 w-full text-left">
        <div>
          <h3 className="text-sm font-medium text-pink-500">Năm Công Tác</h3>
          <p className="text-gray-900">1990 - nay</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-pink-500">Môn Học Giảng Dạy</h3>
          <p className="text-gray-900">Ngữ Văn<span className="text-pink-500">*</span>, Sử, GDĐP</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-pink-500">Học Vấn</h3>
          <p className="text-gray-900">Đại học Sư phạm 2 Hà Nội</p>
        </div>
      </div>

      <Separator className="my-4 bg-pink-100 w-full" />

      <div className="w-full text-left">
        <h3 className="text-sm font-medium text-pink-500 mb-2">Thành Tựu Nổi Bật</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-300 mt-1.5 mr-2"></span>
            <span className="text-gray-900">Chủ nhiệm 10 khoá học sinh</span>
          </li>
          <li className="flex items-start">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-300 mt-1.5 mr-2"></span>
            <span className="text-gray-900">Gieo bao ước mơ xanh cho nhiều thế hệ học trò</span>
          </li>
          <li className="flex items-start">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-300 mt-1.5 mr-2"></span>
            <span className="text-gray-900">Giúp HS viết tiếp ước mơ nghề giáo, làm bác sĩ, kĩ sư,...</span>
          </li>
        </ul>
      </div>

      <Separator className="my-4 bg-pink-100 w-full" />

      <div className="w-full text-left">
        <h3 className="text-sm font-medium text-pink-500 mb-2">Lời cô nhắn nhủ</h3>
        <blockquote className="text-gray-900 italic text-sm bg-white p-3 border-l-2 border-pink-300 rounded-r-md">
          "Cô chúc các con - lứa con út bé bỏng nhưng ra đời sẽ lớn mạnh, thành công, hạnh phúc!"
          <footer className="text-pink-400 mt-1">— N.T Thuý Loan</footer>
        </blockquote>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-white print:block relative overflow-hidden">

      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden sticky top-0 md:flex w-64 flex-col border-r print:hidden bg-white z-10">
        <div className="p-4 pt-6">
          <Logo />
          <div className="decorative-line mt-1"></div>
        </div>
        <Separator />
        <nav className="flex-1 p-4 space-y-1 overflow-hidden md:mt-[-24px]">
          {navigationItems.map((item) => (
            <Link
            key={item.id}
            href={`#${item.id}`}
            className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-pink-50 transition-colors ${
              activeSection === item.id
                ? "bg-gradient-to-r from-pink-50 to-pink-100 text-pink-600 font-medium border-l-2 border-pink-400"
                : "text-gray-900"
            } ${item.id === "profile" ? "md:hidden" : ""}`} // Hide profile information on desktop
            onClick={(e) => {
              e.preventDefault()
              scrollToSection(item.id)
            }}
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
        <header className="sticky top-0 border-b print:hidden bg-white z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden mr-2 hover:bg-pink-50">
                    <Menu className="h-5 w-5 text-gray-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="p-4">
                    <Logo />
                    <div className="decorative-line w-1/2 mt-2"></div>
                  </div>
                  <Separator />
                  <nav className="flex-1 p-4 space-y-1">
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
                          scrollToSection(item.id)
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <img src={"/xuanlam_signature_black.png"} alt={"Xuân Lâm"} className="w-32 object-cover" />
            </div>
            <div className="flex items-center space-x-2">
              <SearchComponent />
              <a
                href="https://github.com/xuanlamm/viet_cho_mua_ha_cuoi/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" title="Báo Lỗi" className="hover:bg-pink-50">
                  <Bug className="h-5 w-5 text-gray-600 text-xl" />
                </Button>
              </a>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Main Content */}
            {/* Decorative background elements */}
            <div ref={mainContentRef} className="main_content flex-1 overflow-x-hidden p-4 md:p-6">
              {/* Teacher Profile Section - Mobile Only */}
              <motion.section
                id="profile"
                className="mb-12 relative md:hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="max-w-3xl mx-auto bg-white p-4 md:p-8 border border-pink-100 rounded-lg shadow-sm">
                  <TeacherProfile />
                </div>
              </motion.section>

              {/* Letter Section */}
              <motion.section
                id="letter"
                className="mb-12 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="letter-container mb-6 flex justify-left items-center px-16 pb-5 mt-auto">
                  <h2 className="text-2xl font-semibold section-heading">
                    Viết cho mùa hạ cuối (cuối khoá 2022-2025)
                  </h2>
                  <div className="small-button ml-3 mt-auto mb-[0.35rem] inline text-xs bg-[#ddd] px-1 py-[0.1rem] text-[#666] rounded-[3px]"><span>Hộp thư đến</span></div>
                </div>
              
                <div className="max-w-3xl mx-auto bg-white p-0 md:p-0 border border-pink-100 shadow-sm ">
                  {isLetterUnlocked ? (
                    <div className="space-y-4 letter paper-texture p-4 md:p-8">
                      <span className="text-base text-gray-900 font-medium flex justify-end pt-6">Hà Nội, ngày 25 tháng 5 năm 2025</span>
                      <p className="text-3xl flex justify-center mt-26 mb-32 letter-title">Viết cho mùa hạ cuối</p>
                      <p className="text-lg">Kính gửi cô Nguyễn Thị Thuý Loan,</p>
                      <p className="text-gray-900 leading-relaxed">
                        Con là Hoàng Xuân Lâm, học sinh lớp 12D5 trường THPT Quang Trung-Đống Đa. Nhân dịp mùa hè cuối
                        khoá 2022–2025, con xin được viết bức thư này để bày tỏ lòng biết ơn sâu sắc tới cô, các bạn
                        và nhà trường đã luôn ở bên con trong suốt năm học vừa qua. Trước hết, con xin kính chúc cô thật
                        nhiều sức khoẻ và luôn hạnh phúc trong cuộc sống và công việc. Mong rằng đó vẫn chưa phải là kết
                        thúc, con mong rằng cô vẫn sẽ tiếp tục truyền nguồn cảm hứng của mình cho cho thật nhiều những
                        thế hệ học sinh khác. Dạo này cô có khoẻ không ạ? Con luôn ấp ủ trong mình những thắc mắc. Cô
                        nghĩ con là một học sinh như thế nào ạ? Với những đứa nghịch ngợm và ham chơi như tụi con không
                        biết đã gây ảnh hưởng biết bao tới công việc của cô?
                      </p>
                      <p className="text-gray-900 leading-relaxed">
                        Chỉ còn một khoảng thời gian ngắn ngủi nữa thôi là con không còn được cô nâng niu, giúp đỡ như
                        những ngày nào. Chỉ vỏn vẹn vài chục ngày ấy, ai nấy cũng sẽ phải bước vào kỳ thi quan trọng.
                        Con thú nhận, đây là lần đầu tiên bản thân con viết thư cho một giáo viên của mình. Cũng chính
                        vì vậy, con xin phép được dùng những từ ngữ, lời lẽ mộc mạc, đơn giản nhất xuất phát từ tận trái
                        tim mình, xin được gửi gắm những tình yêu, tình cảm, cảm xúc ấy tới lá thư này một cách trọn vẹn
                        nhất. Con là vậy đấy! Văn con có thể không giỏi nhưng con giỏi nhất là bộc lộ cảm xúc!
                      </p>
                      <p className="text-gray-900 leading-relaxed">
                        Nhìn lại chặng đường ba năm qua dưới mái trường THPT Quang Trung-Đống Đa thân yêu, con không
                        khỏi cảm thấy bồi hồi và xúc động. Đó là những khoảng thời gian tuyệt vời, đầy ắp những kỷ niệm
                        đẹp đẽ và tinh nghịch. Con nhớ những buổi học với cô, ánh mắt hiền hậu khi lần đầu gặp cô, nhớ
                        luôn cả tiếng cười rộn rã của cả lớp, nhớ cả bạn Quân đang ngủ gật, bạn Đức hay cả bạn Bình.
                        Dưới sự dìu dắt của cô cùng các giáo viên bộ môn, con đã học hỏi được rất nhiều kiến thức bổ ích
                        và những bài học làm người quý giá. Con xin chân thành bày tỏ cảm xúc và lòng biết ơn của mình
                        trước những năm tháng học tập đáng nhớ ấy.
                      </p>
                      <p className="text-gray-900 leading-relaxed">
                        Nhân đây, con muốn gửi lời tri ân sâu sắc đến cô Loan – người giáo viên tận tuỵ và nghiêm khắc
                        nhưng đầy ắp yêu thương. Cô đã dành cho chúng con biết bao tâm huyết, từng kèm cặp chỉ bảo những
                        bài giảng khó, đồng thời dạy cho chúng con biết bao bài học cuộc sống ý nghĩa. Cảm ơn cô vì
                        những lời động viên đúng lúc, sự quan tâm ân cần mỗi khi chúng con gặp khó khăn. Ngoài ra, con
                        xin bày tỏ lòng biết ơn với tất cả các thầy cô trong trường, những người đã không quản ngại vất
                        vả, ngày đêm soạn bài và tận tình dạy dỗ. con cũng xin cảm ơn các bạn học sinh cùng lớp, những
                        người bạn thân thiết đã luôn ở bên cạnh chia sẻ niềm vui và động viên nhau trong học tập. Nhờ có
                        các bạn, mỗi ngày đến trường đều tràn đầy tiếng cười và ý nghĩa. Đặc biệt, con không thể không
                        nhắc đến bố mẹ – những người đã hy sinh thầm lặng để con có được ngày hôm nay. Bố mẹ đã luôn yêu
                        thương, ủng hộ và định hướng cho con trên mọi nẻo đường. Những lời khuyên và sự chăm sóc tận tâm
                        của cha mẹ đã giúp con vững bước hơn trong học tập cũng như cuộc sống. con xin chân thành tri ân
                        tấm lòng của các thầy cô, bạn bè và bố mẹ vì sự hỗ trợ, định hướng và công lao tuyệt vời mà mọi
                        người đã dành cho con.
                      </p>
                      <p className="text-gray-900 leading-relaxed">
                        Viết tới đây, con xin được kể cho cô nghe về chặng hành trình của mình những năm cấp Ba... Những
                        bước chân đầu tiên dưới mái trường Quang Trung để lại cho con thật nhiều những cảm xúc khó tả.
                        Ngày đầu mới vào lớp, con bị ngạc nhiên bởi đa số học sinh đều là con gái. Ngày nhận lớp và buổi
                        giới thiệu về bản thân ấy, đối với con lại rất xấu hổ. Sau buổi giới thiệu về bản thân ấy, con
                        lại càng ngạc nhiên và bị ấn tượng bởi tài năng của các bạn, điều đó khiến con cảm thấy như một
                        người tầm thường chỉ đang cố gắng phấn đấu trong một tập thể xuất sắc. Từ bạn An học song song
                        cả nhạc viện, bạn Trâm Anh với những lời phát biểu dõng dạc và khiến con cảm thấy bạn là một
                        người có tinh thần và trách nhiệm và sẽ có tiếng nói trong lớp,... Con nghĩ bản thân mình nói ra
                        những lời lẽ ấy, cứ như là đang khoe khoang thành tích bản thân vậy, nhưng vì con luống cuống
                        quá nên đã buột miệng. Khoảng thời gian đầu này, con là một bạn học sinh ít nói, con ngại giao
                        tiếp với mọi người, nhưng cũng rất may con vẫn có thể làm quen với các bạn. Bạn Phúc Tuệ, bạn
                        Thanh Sơn là hai người bạn đầu tiên con làm quen được đầu lớp 10 và đến bây giờ, tuyệt vời thay
                        con vẫn được choi cùng họ, chỉ là có thêm thật nhiều những người bạn khác nữa. Mới đầu, Sơn chỉ
                        chia sẻ với con về sở thích liên quan tới vọc vạch công nghệ của mình, con cũng rất vui khi có
                        một người bạn chung chí hướng. Kết thúc năm đầu tiên, thực sự con là một đứa nghịch ngợm trong
                        lớp, và con rất thích chơi game, đi chơi cùng các bạn!
                      </p>
                      <p className="text-gray-900 leading-relaxed">
                        Tới lớp 11, lúc ấy con đã nhớ gần hết tên của các bạn trong lớp, 1 năm học vừa qua đã giúp cho
                        con thoải mái và hoàn toàn hoà tan trong môi trường Quang Trung này. Con bắt đầu làm quen được
                        với những người bạn mới, và rồi bị ngạc nhiên bởi khả năng, thiên phú của các bạn. Bạn Trâm Anh
                        hoàn toàn trở thành một người có tiếng nói và giữ trọng trách quan trọng trong lớp. Bạn Bình rất
                        giỏi những môn tự nhiên và luôn đạt được điểm cao trong môn Toán và Vật lý. Lúc ấy con mới được
                        ngồi gần bạn Thu Trang, bạn là người vô cùng có trách nhiệm, nghiêm khắc trong việc nhóm, tổ và
                        đặc biệt là việc học. Con bị ấn tượng bởi sự tập trung cao độ và nỗ lực bạn đã và đang đạt được
                        xuyên suốt những năm học qua. Nói đi thì cũng phải nói lại, khoảng thời gian đầu năm 2024 cuối
                        lớp 11 ấy đối với con là một khoảng thời gian khó khăn nhất. Ngay khi vào lớp, con đã là một đứa
                        ít nói, không chia sẻ nhiều về bản thân, cũng chính vì trong lòng còn đang suy nghĩ tới người
                        khác. Cái tình yêu vớ vẩn ấy bây giờ nhìn nhận lại đã khiến con mất hơn 2 năm học tuyệt vời cùng
                        các bạn, con bị chi phối trong học tập, ăn uống và nghỉ ngơi không điều độ, và con mất rất nhiều
                        thời gian. Lẽ ra con đã có thể nhớ tên và làm quen được với tất cả các bạn trong lớp nhưng lại
                        chỉ chăm chú vào duy nhất 1 người mà không hề ở đây. Con bị các bạn trêu, bị cô nói nhưng lại
                        lấy đó làm động lực không đúng chỗ đúng lúc. Rồi thì việc gì đến cũng đã đến, mọi chuyện chấm
                        dứt khiến tinh thần và sức khoẻ con đi xuống trầm trọng. Con nhập viện, điểm cũng ảnh hưởng.
                        Nhưng rồi đến lúc ấy, con chợt nhận ra một điều vô cùng quan trọng mà con suýt nữa đã đánh mất
                        đó là các bạn.
                      </p>
                      <p className="text-gray-900 leading-relaxed">
                        Trong suốt những ngày tháng ấy, các bạn vẫn luôn ở bên an ủi và động viên, khích lệ tinh thần
                        con. Bạn Thắng, bạn Phúc Tuệ, Thanh Sơn, Quốc Anh và Quân vẫn luôn là những người bạn ở bên con.
                        Nhờ các bạn mà trên lớp con không cảm thấy cô đơn một chút nào cả. Con vẫn không thể ngờ được
                        bản thân đã làm bạn với nhiều những người bạn tốt ấy, luôn quan tâm tới con hàng ngày, nhờ có
                        các bạn ý mà con lại trở lại làm một con người vui vẻ, sống lạc quan và yêu đời. Hè năm lớp 11,
                        lại chính là một khoảng thời gian đặc biệt khác, một người bạn mới con chưa từng nghĩ tới. Con
                        chưa từng nghĩ sẽ làm bạn và kết thân với một bạn gái trong lớp nhưng điều đó đã giúp con rất
                        nhiều. Bạn Nguyễn Hoàng Minh Phương cũng chính là một người mà con vô cùng ấn tượng. Bạn đạt kết
                        quả 8.0 với chứng chỉ IELTS và được tham gia TEDx Talks. Trong những ngày hè ấy, bạn Phương đã
                        giúp con rất nhiều. Con vẫn không thể tin được một người tầm thường như con có thể chơi với một
                        người như bạn ấy. Bạn rủ con xem phim chung thâu đêm, rồi thì nhắn tin, gọi điện tâm sự, khiến
                        con quên mất đi những chuyện đã xảy ra, những thứ khiến con buồn và thất vọng. Thật tuyệt vời
                        khi đến bây giờ tụi con vẫn giữ được mối quan hệ bạn bè thân thiết ấy, con vẫn luôn rấ tsẵn lòng
                        giúp đỡ bạn bài tập về nhà môn Toán và điều đó khiến con cảm thấy tập trung hơn cho môn học. Bạn
                        giúp con rất nhiều, con rất biết ơn Phương.
                      </p>
                      <p className="text-gray-900 leading-relaxed">
                        Ngoài ra, bạn Quân cũng chính là người mở ra cho con một sở thích mới đó chính là chơi đàn. Con
                        rất hay nghe nhạc và những bài hát đều thuộc về những nhóm nhạc, những nghệ sĩ biết chơi đàn, sẽ
                        thật tuyệt vời nếu con có thể vừa đàn và hát những bài hát yêu thích của mình. Bạn Quân đã không
                        ngại mà cho con mượn cây đàn Classic để tập, rồi cho con mượn cả cây Guitar Accoustic chính của
                        bạn ấy. Điều đó thật tuyệt vời! Ngoài ra, còn một người bạn đặc biệt mà đến lớp 12 con mới được
                        nói chuyện nhiều hơn đó là bạn Thanh Sơn. Đầu năm lớp 10, con vẫn nghĩ là bản thân sẽ phụ trách
                        hoàn toàn mảng kỹ thuật và công nghệ cho lớp nhưng lại ngạc nhiên bởi sự nhanh nhẹn của bạn Sơn.
                        Bạn ấy đã quán xuyến mọi việc trong lớp, nhờ vậy mà con cảm thấy thoải mái hơn và đôi khi còn
                        được gọi lên để giúp đỡ nữa. Sơn là một người học sinh giỏi toàn diện, bạn có tính cách vô cùng
                        dễ gần và không muốn gây thù oán với bất kỳ ai trong lớp. Bạn chính là điển hình của sự hoà nhã,
                        nhưng lại vô cùng trách nhiệm trong công việc và học tập. Mới đây thôi lớp ta mới được chứng
                        kiến một cặp đôi Trang-Sơn, nhưng sự kết hợp ấy lại chính là đòn bẩy mạnh mẽ giúp các bạn cố
                        gắng vượt bậc trong học tập khiến con rất ngưỡng mộ. Sơn là một người bạn rất tốt, bạn luôn đi
                        chơi với con như kiểu một buổi hẹn hò vậy haha. Tất cả những quán ăn, tiệm quần áo con chưa biết
                        cũng đều được bạn giới thiệu. Đi chơi với sơn khiến con được tiếp xúc với xã hội nhiều hơn chứ
                        không lủi thủi một mình. Đôi lúc con buồn chán nhưng bạn Sơn đã luôn ở bên động viên, an ủi và
                        chở con đi chơi rất nhiều chỗ. Bọn con tâm sự rất nhiều chuyện và thật vui khi con cũng có thể
                        đưa ra lời khuyên từ những trải nghiệm của mình để giúp bạn. Để rồi cuối cùng, tất cả những
                        người bạn, những sự cho đi ấy đã giúp con tìm lại chính bản thân mình, một người tràn đầy năng
                        lượng, nghịch ngợm nhưng khao khát được làm những điều thú vị, mới mẻ và được theo đuổi đam mê
                        của mình. Được là chính mình đối với con là một điều tuyệt vời nhất, để được sống, được cố gắng,
                        được mơ ước và được thực hiện.
                      </p>
                      <p className="text-gray-900 leading-relaxed">
                        Lá thư vẫn chưa thể đầy đủ nếu thiếu đi công lao của thầy cô, giáo viên bộ môn và cả bố mẹ,
                        những người luôn ở cạnh em xuyên suốt chặng hành trình của mình. Con thực sự rất xin lỗi thầy
                        cô, bố mẹ vì đã để mọi người phải lo lắng rất nhiều. Dù vậy mà thầy cô, cả bố mẹ đã luôn ở bên
                        động viên và thôi thúc con phải cố gắng. Con rất biết ơn khoảng thời gian qua được ở bên và là
                        một người con, một người học sinh đang nỗ lực hết mình. Con cảm ơn các thầy cô đã luôn hướng
                        dẫn, dặn dò và cho con những định hướng đúng đắn và cách nhìn nhận về xã hội một cách trưởng
                        thành hơn. Con xin được cảm ơn bố mẹ, người đã hi sinh và chịu thiệt thòi lớn nhất để con có
                        được ngày hôm nay. Con, Hoàng Xuân Lâm luôn luôn ghi nhớ những công ơn của thầy cô, bố mẹ và
                        chắc chắn đang theo đuổi đam mê, nguyện vọng của mình!
                      </p>
                      <p className="text-gray-900 leading-relaxed">
                        Thư cũng đã dài, con xin được gửi gắm vào cuối lá thư này những lời hứa chân thành nhất. Con xin
                        hứa sẽ luôn nhớ mãi những lời dạy dỗ của cô và không ngừng nỗ lực học tập, rèn luyện để không
                        phụ lòng mong mỏi của thầy cô và gia đình. Con hy vọng sẽ tiếp tục làm nên nhiều thành tích tốt
                        đẹp trong tương lai, để khi trở về, con có thể tự hào báo cáo cho cô biết rằng con đã cố gắng
                        như thế nào. Con xin chúc cô Loan và gia đình nhiều sức khỏe, bình an, hạnh phúc. Mong một ngày
                        không xa, em sẽ có cơ hội trở về thăm trường và được gặp lại cô. Nếu có thêm thật nhiều những cơ
                        hội được làm lại, con vẫn sẽ chọn để được là học sinh của cô!
                      </p>
                      <p className="text-gray-900 leading-relaxed">
                        Một lần nữa, con xin chân thành cảm ơn và kính chúc cô mọi điều tốt đẹp nhất! Trân trọng cảm ơn
                        cô!
                      </p>

                      {/* Add student photo and signature section */}
                      <div className="flex flex-col md:flex-row gap-6 mt-8 mb-4">
                        <div className="flex-1">
                          <div className="border-2 border-dashed border-pink-300 rounded-md p-4 flex flex-col items-center justify-center min-h-[200px]">
                            <p className="text-pink-400 text-sm mb-2">[Ảnh cá nhân]</p>
                            <div className="w-32 h-40 bg-gray-100 flex items-center justify-center">
                              <img
                                src="/placeholder.svg?height=160&width=128&text=Ảnh+cá+nhân"
                                alt="Ảnh cá nhân"
                                className="max-w-full max-h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col">
                            <p className="font-medium">Học trò gần nghịch ngợm nhất 12D5 của cô,</p>
                            <div className="border-b border-dashed border-gray-400 h-fit my-2 flex flex-col items-center justify-center">
                              <img src={"/xuanlam_signature_black.png"} alt={"Xuân Lâm"} className="w-48 object-cover" />
                              <p className="text-gray-900 italic">Hoàng Xuân Lâm</p>
                            </div>
                            <div className="mt-4 text-sm text-gray-900">
                              <p>Địa chỉ liên lạc: Số 19, ngách 122/22 đường Láng, Thịnh Quang, Đống Đa, Hà Nội.</p>
                              <p>Số điện thoại: 0962913298</p>
                              <p>Email: hoangxuanlam2007@outlook.com</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Blurred content */}
                      <div className="space-y-4 letter paper-texture p-4 md:p-8 blurred-content">
                      <span className="text-base text-gray-900 font-medium flex justify-end">Hà Nội, ngày 25 tháng 5 năm 2025</span>
                      <p className="text-3xl flex justify-center m-20 mb-26">Viết cho mùa hạ cuối</p>
                      <p className="text-lg">Kính gửi cô Nguyễn Thị Thuý Loan,</p>
                      <p className="text-gray-900 leading-relaxed">
                        Con là Hoàng Xuân Lâm, học sinh lớp 12D5 trường THPT Quang Trung-Đống Đa. Nhân dịp mùa hè cuối
                        khoá 2022–2025, con xin được viết bức thư này để bày tỏ lòng biết ơn sâu sắc tới cô, các bạn
                        và nhà trường đã luôn ở bên con trong suốt năm học vừa qua. Trước hết, con xin kính chúc cô thật
                        nhiều sức khoẻ và luôn hạnh phúc trong cuộc sống và công việc. Mong rằng đó vẫn chưa phải là kết
                        thúc, con mong rằng cô vẫn sẽ tiếp tục truyền nguồn cảm hứng của mình cho cho thật nhiều những
                        thế hệ học sinh khác. Dạo này cô có khoẻ không ạ? Con luôn ấp ủ trong mình những thắc mắc. Cô
                        nghĩ con là một học sinh như thế nào ạ? Với những đứa nghịch ngợm và ham chơi như tụi con không
                        biết đã gây ảnh hưởng biết bao tới công việc của cô?
                      </p>
                    </div>

                      {/* Password protection overlay */}
                      <div className="absolute top-0 w-full h-full bg-white bg-opacity-90 backdrop-blur-sm py-10">
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
                <h2 className="text-2xl font-semibold mb-2 section-heading">Kỷ niệm 12D5</h2>
                <div className="decorative-line w-48 mb-6"></div>
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
                <h2 className="text-2xl font-semibold mb-2 section-heading">Hành trình năm học</h2>
                <div className="decorative-line w-64 mb-6"></div>
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
                <DecorativeCircle className="dec_cir w-96 h-96 -top-20 -left-20" />
                <DecorativeCircle className="dec_cir w-96 h-96 -bottom-20 -right-20" />
                <DecorativeDots className="w-full h-full opacity-50" />
                <FloatingHearts />
                <h2 className="text-2xl font-semibold mb-2 section-heading">Hãy trở thành 1 phần của bức thư này!</h2>
                <div className="decorative-line w-[28rem] mb-6"></div>

                {/* Well Wishes Form */}
                <div className="max-w-2xl mx-auto bg-white p-6 border border-pink-100 rounded-lg shadow-sm mb-8">
                  <form className="space-y-4" onSubmit={handleWishSubmit}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newWish.name}
                        onChange={handleWishChange}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Tên của bạn"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                        Biệt danh
                      </label>
                      <input
                        type="text"
                        id="nickname"
                        name="nickname"
                        value={newWish.nickname}
                        onChange={handleWishChange}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Biệt danh của bạn (nếu có)"
                      />
                    </div>
                    <div>
                      <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
                        Mối quan hệ
                      </label>
                      <input
                        type="text"
                        id="relationship"
                        name="relationship"
                        value={newWish.relationship}
                        onChange={handleWishChange}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Học sinh, Giáo viên, Phụ huynh, v.v."
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Lời nhắn của bạn
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={newWish.message}
                        onChange={handleWishChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Chia sẻ lời chúc, kỷ niệm hoặc lòng biết ơn của bạn..."
                        required
                      ></textarea>
                    </div>
                    <div className="relative">
                      <Button
                        type="submit"
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Đang gửi..."
                        ) : (
                          <span className="flex items-center">
                            <Gift className="mr-2 h-4 w-4" />
                            Đóng góp
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
                              Lời nhắn của bạn đã được thêm thành công!
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
                      <p className="mt-2 text-gray-600">Đang tải đóng góp...</p>
                    </div>
                  ) : loadError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                      <p>Lỗi khi tải đóng góp: {loadError}</p>
                      <p className="text-sm mt-1">Vui lòng thử làm mới trang.</p>
                    </div>
                  ) : wishes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Chưa có đóng góp nào. Hãy là người đầu tiên để lại lời nhắn!</p>
                    </div>
                  ) : (
                    wishes.map((wish, index) => (
                      <motion.div
                        key={wish.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="wish-card p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{wish.name}</h3>
                            {wish.nickname && <p className="text-sm text-pink-500">{wish.nickname}</p>}
                            {wish.relationship && <p className="text-xs text-gray-500">{wish.relationship}</p>}
                          </div>
                          <span className="text-xs text-gray-400">{wish.date}</span>
                        </div>
                        <p className="text-gray-700">{wish.message}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>
            </div>

            {/* Teacher Profile Section - Desktop Only */}
            <div className="hidden lg:block w-80 p-4 overflow-x-hidden">
              <div className="sticky top-4">
                <TeacherProfile />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Define types for the data
interface WishType {
  id: string
  name: string
  nickname?: string
  relationship?: string
  message: string
  date: string
}

interface MemoryCardProps {
  title: string
  date: string
  description: string
  images?: string[]
}

  // Memory Card Component
  function MemoryCard({ title, date, description, images = [] }: MemoryCardProps) {
    return (
      <div className="memory-card overflow-hidden border border-pink-100 rounded-lg shadow-sm">
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
            {images.map((image, index) => (
              <div key={index} className="aspect-video overflow-hidden rounded-md">
                <ImagePreview src={image || "/placeholder.svg"} alt={`${title} - ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
        <div className="p-4">
          <h3 className="font-medium text-lg mb-1">{title}</h3>
          <p className="text-pink-500 text-sm mb-2">{date}</p>
          <p className="text-gray-700">{description}</p>
        </div>
      </div>
    )
  }

interface TimelineItemProps {
  date: string
  title: string
  description: string
}

function TimelineItem({ date, title, description }: TimelineItemProps) {
  return (
    <div className="relative pl-6 pb-6 border-l border-pink-100 timeline-dot">
      <div className="mb-1">
        <span className="text-sm font-medium text-pink-500">{date}</span>
      </div>
      <h3 className="font-medium text-lg mb-1">{title}</h3>
      <p className="text-gray-900">{description}</p>
    </div>
  )
}

// Sample data for memories
const memories = [
  {
    title: "Chuyến đi dã ngoại lớp 12D5",
    date: "Tháng 10, 2023",
    description: "Chuyến đi dã ngoại đầy ắp tiếng cười và kỷ niệm đẹp cùng thầy cô và các bạn lớp 12D5.",
    images: [
      "/placeholder.svg?height=200&width=400&text=Dã+ngoại+1",
      "/placeholder.svg?height=200&width=400&text=Dã+ngoại+2",
    ],
  },
  {
    title: "Lễ kỷ niệm 20/11",
    date: "Tháng 11, 2023",
    description: "Buổi lễ tri ân thầy cô nhân ngày Nhà giáo Việt Nam với nhiều tiết mục văn nghệ đặc sắc.",
    images: [
      "/placeholder.svg?height=200&width=400&text=Lễ+20/11+1",
      "/placeholder.svg?height=200&width=400&text=Lễ+20/11+2",
    ],
  },
  {
    title: "Hội thao trường THPT Quang Trung",
    date: "Tháng 12, 2023",
    description: "Những giây phút hào hứng và đầy tinh thần đồng đội trong hội thao của trường.",
    images: [
      "/placeholder.svg?height=200&width=400&text=Hội+thao+1",
      "/placeholder.svg?height=200&width=400&text=Hội+thao+2",
    ],
  },
  {
    title: "Tết trường 2024",
    date: "Tháng 1, 2024",
    description: "Không khí Tết tràn ngập sân trường với nhiều hoạt động văn hóa truyền thống.",
    images: [
      "/placeholder.svg?height=200&width=400&text=Tết+trường+1",
      "/placeholder.svg?height=200&width=400&text=Tết+trường+2",
    ],
  },
]

// Sample data for timeline
const timelineItems = [
  {
    date: "Tháng 8, 2022",
    title: "Bắt đầu năm học lớp 10",
    description: "Những ngày đầu tiên làm quen với môi trường mới, thầy cô và bạn bè mới.",
  },
  {
    date: "Tháng 5, 2023",
    title: "Kết thúc năm học lớp 10",
    description: "Hoàn thành xuất sắc năm học đầu tiên tại trường THPT với nhiều thành tích đáng nhớ.",
  },
  {
    date: "Tháng 8, 2023",
    title: "Bắt đầu năm học lớp 11",
    description: "Bước vào năm học mới với nhiều thử thách và cơ hội mới để phát triển bản thân.",
  },
  {
    date: "Tháng 5, 2024",
    title: "Kết thúc năm học lớp 11",
    description: "Một năm học đầy ắp kỷ niệm và tiến bộ trong học tập cũng như các hoạt động ngoại khóa.",
  },
  {
    date: "Tháng 8, 2024",
    title: "Bắt đầu năm học lớp 12",
    description: "Năm học cuối cấp với nhiều dự định và mục tiêu quan trọng cho tương lai.",
  },
  {
    date: "Tháng 5, 2025",
    title: "Lễ tri ân và trưởng thành",
    description: "Khoảnh khắc xúc động khi nói lời cảm ơn và tạm biệt thầy cô, mái trường thân yêu.",
  },
]
