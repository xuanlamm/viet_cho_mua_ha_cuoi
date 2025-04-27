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
import { Logo } from "@/components/logo"

export default function Home() {
  // State for well wishes
  const [wishes, setWishes] = useState<WishType[]>([
    {
      id: "1",
      name: "Nguyễn Thị Hương",
      nickname: "Hương Giang",
      relationship: "Cựu Học Sinh",
      message: "Thầy là giáo viên toán giỏi nhất mà em từng được học. Cảm ơn thầy đã luôn tin tưởng em!",
      date: "10/05/2024",
    },
    {
      id: "2",
      name: "Trần Văn Minh",
      nickname: "Minh Trần",
      relationship: "Đồng Nghiệp",
      message: "Thật vinh dự khi được làm việc cùng cô trong suốt 15 năm qua. Chúc cô nghỉ hưu vui vẻ!",
      date: "12/05/2024",
    },
  ])

  const [newWish, setNewWish] = useState<Omit<WishType, "id" | "date">>({
    name: "",
    nickname: "",
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
          title="Tìm kiếm"
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
                  placeholder="Tìm kiếm nội dung..."
                />
                <Button type="submit" className="rounded-l-none bg-pink-500 hover:bg-pink-600">
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
                      onClick={() => navigateSearchResults("prev")}
                    >
                      Trước
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs border-pink-100 hover:bg-pink-50"
                      onClick={() => navigateSearchResults("next")}
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

  return (
    <div className="flex h-screen bg-white print:block relative overflow-hidden">
      {/* Decorative background elements */}
      <DecorativeCircle className="w-96 h-96 -top-20 -left-20" />
      <DecorativeCircle className="w-96 h-96 -bottom-20 -right-20" />
      <DecorativeDots className="w-full h-full opacity-10" />

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex w-64 flex-col border-r print:hidden bg-white relative z-10">
        <div className="p-4">
          <Logo />
          <div className="decorative-line w-1/2 mt-2"></div>
        </div>
        <Separator />
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "letter", icon: <Pen className="mr-2 h-4 w-4" />, label: "Hộp thư đến" },
            { id: "memories", icon: <Camera className="mr-2 h-4 w-4" />, label: "Kỷ niệm" },
            { id: "timeline", icon: <Clock className="mr-2 h-4 w-4" />, label: "Dòng thời gian" },
            { id: "wishes", icon: <Heart className="mr-2 h-4 w-4" />, label: "Đóng góp" },
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
              <h1 className="text-xl font-semibold text-pink-500">Thư chính</h1>
            </div>
            <div className="flex items-center space-x-2">
              <SearchComponent />
              <a
                href="https://github.com/yourusername/teacher-tribute/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" title="Báo Lỗi" className="hover:bg-pink-50">
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
                    <h2 className="text-2xl font-semibold section-heading">
                      Viết cho mùa hạ cuối (cuối khoá 2022-2025)
                    </h2>
                    <span className="text-sm text-pink-400 font-medium">Tháng 5/2024</span>
                  </div>

                  {isLetterUnlocked ? (
                    <div className="space-y-4">
                      <p className="text-lg">Kính gửi [Tên Thầy/Cô],</p>
                      <p className="text-gray-700 leading-relaxed">
                        Khi chuẩn bị tốt nghiệp và bắt đầu hành trình đại học, em muốn dành một chút thời gian để bày tỏ
                        lòng biết ơn sâu sắc về những ảnh hưởng to lớn mà thầy/cô đã tạo nên trong quá trình học tập và
                        phát triển cá nhân của em.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Niềm đam mê giảng dạy của thầy/cô đã thắp lên trong em tình yêu học tập mà em sẽ mang theo suốt
                        cuộc đời. Kiến thức, sự khôn ngoan và sự hướng dẫn mà thầy/cô đã chia sẻ thật vô giá, và em thực
                        sự biết ơn vì những giờ phút thầy/cô đã dành để giúp đỡ em và các bạn học sinh khác thành công.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Em sẽ không bao giờ quên cách thầy/cô [kỷ niệm hoặc bài học có ý nghĩa]. Khoảnh khắc đó, cùng
                        với nhiều khoảnh khắc khác, đã định hình quan điểm của em và ảnh hưởng đến quyết định theo đuổi
                        [lĩnh vực học tập] tại đại học.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Khi thầy/cô về hưu, xin hãy biết rằng di sản của thầy/cô vẫn sống mãi trong trái tim và tâm trí
                        của tất cả những học sinh mà thầy/cô đã chạm đến. Sự cống hiến của thầy/cô cho giáo dục đã tạo
                        ra những gợn sóng sẽ tiếp tục lan tỏa xa hơn ngoài lớp học.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Em chúc thầy/cô những điều tốt đẹp nhất trong chương mới của cuộc đời. Mong rằng nó sẽ tràn đầy
                        niềm vui, sự thư giãn và những cuộc phiêu lưu mới.
                      </p>
                      <div className="pt-4">
                        <p className="text-gray-700">Với lòng biết ơn và kính trọng sâu sắc,</p>
                        <p className="font-semibold mt-2">[Tên Của Bạn]</p>
                        <p className="text-pink-400 text-sm">Khóa 2024</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Blurred content */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="space-y-4 filter blur-md select-none pointer-events-none">
                          <p className="text-lg">Kính gửi [Tên Thầy/Cô],</p>
                          <p className="text-gray-700 leading-relaxed">
                            Khi chuẩn bị tốt nghiệp và bắt đầu hành trình đại học, em muốn dành một chút thời gian để
                            bày tỏ lòng biết ơn sâu sắc về những ảnh hưởng to lớn mà thầy/cô đã tạo nên trong quá trình
                            học tập và phát triển cá nhân của em.
                          </p>
                          <p className="text-gray-700 leading-relaxed">
                            Niềm đam mê giảng dạy của thầy/cô đã thắp lên trong em tình yêu học tập mà em sẽ mang theo
                            suốt cuộc đời. Kiến thức, sự khôn ngoan và sự hướng dẫn mà thầy/cô đã chia sẻ thật vô giá,
                            và em thực sự biết ơn vì những giờ phút thầy/cô đã dành để giúp đỡ em và các bạn học sinh
                            khác thành công.
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
                <h2 className="text-2xl font-semibold mb-6 section-heading">Kỷ niệm 12D5</h2>
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
                <h2 className="text-2xl font-semibold mb-6 section-heading">Hành trình năm học</h2>
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
                <h2 className="text-2xl font-semibold mb-6 section-heading">Hãy trở thành 1 phần của bức thư này!</h2>
                <div className="decorative-line w-32 mb-6"></div>

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
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="wish-card bg-white p-5 border border-pink-100 rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{wish.name}</h3>
                            {wish.nickname && <p className="text-sm text-gray-500">{wish.nickname}</p>}
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
                <h2 className="text-xl font-semibold mt-2">[Tên Thầy/Cô]</h2>
                <p className="text-pink-500">Giáo viên [Môn học]</p>
                <p className="text-gray-500 text-sm">[Tên Trường]</p>
              </div>

              <Separator className="my-4 bg-pink-100" />

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-pink-500">Năm Công Tác</h3>
                  <p className="text-gray-900">1990 - 2024</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-pink-500">Môn Học Giảng Dạy</h3>
                  <p className="text-gray-900">[Môn học 1], [Môn học 2]</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-pink-500">Học Vấn</h3>
                  <p className="text-gray-900">[Tên Trường Đại Học]</p>
                </div>
              </div>

              <Separator className="my-4 bg-pink-100" />

              <div>
                <h3 className="text-sm font-medium text-pink-500 mb-2">Thành Tựu Nổi Bật</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-300 mt-1.5 mr-2"></span>
                    <span className="text-gray-700">[Thành tựu 1]</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-300 mt-1.5 mr-2"></span>
                    <span className="text-gray-700">[Thành tựu 2]</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-300 mt-1.5 mr-2"></span>
                    <span className="text-gray-700">[Thành tựu 3]</span>
                  </li>
                </ul>
              </div>

              <Separator className="my-4 bg-pink-100" />

              <div>
                <h3 className="text-sm font-medium text-pink-500 mb-2">Câu Nói Yêu Thích</h3>
                <blockquote className="text-gray-700 italic text-sm bg-white p-3 border-l-2 border-pink-300 rounded-r-md">
                  "Giáo dục không phải là đổ đầy một cái xô, mà là thắp sáng một ngọn lửa."
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
              Đọc thêm <ChevronDown className="h-3 w-3 ml-1" />
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
                Thu gọn <ChevronUp className="h-3 w-3 ml-1" />
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
                        alt={`Hình ảnh kỷ niệm cho ${title}`}
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
  nickname?: string
  relationship: string
  message: string
  date: string
}

// Sample data
const memories = [
  {
    title: "Dự Án Lớp Học",
    date: "Mùa Thu 2021",
    description:
      "Khoảng thời gian chúng ta làm việc trên dự án hội chợ khoa học và thầy/cô đã ở lại sau giờ học để giúp chúng em hoàn thiện bài thuyết trình. Em nhớ cách thầy/cô khuyến khích chúng em suy nghĩ đột phá và tiếp cận vấn đề từ nhiều góc độ khác nhau. Sự kiên nhẫn và hướng dẫn của thầy/cô đã giúp chúng em giành giải nhất, nhưng quan trọng hơn, nó dạy em giá trị của sự kiên trì và tư duy sáng tạo.",
    images: [
      "/placeholder.svg?height=200&width=300&text=Hội+Chợ+Khoa+Học",
      "/placeholder.svg?height=200&width=300&text=Trưng+Bày+Dự+Án",
    ],
  },
  {
    title: "Chuyến Đi Thực Tế",
    date: "Mùa Xuân 2022",
    description:
      "Chuyến đi bảo tàng nơi thầy/cô đã chỉ cho chúng em cách các bài học trong lớp kết nối với thế giới thực. Thầy/cô đã làm cho lịch sử trở nên sống động bằng cách chia sẻ những câu chuyện và hiểu biết sâu sắc không có trong sách giáo khoa. Em sẽ không bao giờ quên cách thầy/cô giải thích ý nghĩa của từng hiện vật và khuyến khích chúng em đặt câu hỏi.",
    images: ["/placeholder.svg?height=200&width=300&text=Tham+Quan+Bảo+Tàng"],
  },
  {
    title: "Bài Học Khó",
    date: "Mùa Đông 2022",
    description:
      "Khi em gặp khó khăn với khái niệm thách thức đó và thầy/cô đã tìm ra cách sáng tạo để giúp em hiểu nó. Thầy/cô nhận thấy em đang bị tụt lại phía sau và đề nghị ở lại sau giờ học. Thay vì chỉ lặp lại cùng một lời giải thích, thầy/cô đã sử dụng một cách tiếp cận hoàn toàn khác cuối cùng đã giúp em hiểu được. Khoảnh khắc đó đã thay đổi mối quan hệ của em với môn học mãi mãi.",
    images: [],
  },
  {
    title: "Sách Được Giới Thiệu",
    date: "Mùa Thu 2023",
    description:
      "Cuốn sách thầy/cô giới thiệu đã mở ra cho em những góc nhìn mới và trở thành một trong những cuốn sách yêu thích của em. Bằng cách nào đó thầy/cô đã biết chính xác những gì em cần đọc tại thời điểm đó trong cuộc đời. Những chủ đề trong cuốn sách đó đã giúp em vượt qua một số thách thức cá nhân và truyền cảm hứng cho bài luận xin vào đại học của em.",
    images: ["/placeholder.svg?height=200&width=300&text=Bìa+Sách"],
  },
]

const timelineItems = [
  {
    year: "2020",
    title: "Ngày Đầu Tiên",
    description:
      "Ngày đầu tiên trong lớp của thầy/cô, cảm thấy lo lắng nhưng thầy/cô đã làm cho mọi người cảm thấy được chào đón.",
  },
  {
    year: "2021",
    title: "Dự Án Lớn",
    description: "Làm việc trên dự án kéo dài cả năm đầy thách thức đó đã dạy em sự kiên trì.",
  },
  {
    year: "2022",
    title: "Cuộc Thi Học Thuật",
    description: "Khi thầy/cô huấn luyện đội của chúng em cho cuộc thi khu vực và chúng em đã đạt giải nhì!",
  },
  {
    year: "2023",
    title: "Đơn Xin Vào Đại Học",
    description: "Sự hướng dẫn và thư giới thiệu của thầy/cô đã giúp em được nhận vào trường đại học mơ ước.",
  },
  {
    year: "2024",
    title: "Tốt Nghiệp",
    description: "Hoàn thành trung học với kiến thức và sự tự tin mà thầy/cô đã giúp em xây dựng.",
  },
]
