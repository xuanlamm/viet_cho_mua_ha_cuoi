"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Inbox, Clock, Heart, Camera, FolderHeart, Menu, Bug, PencilLine, Sparkles, User, Hash } from "lucide-react"
import { FaCircle } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { PasswordProtection } from "@/components/password-protection"
import { DecorativeCircle, DecorativeDots, FloatingHearts } from "@/components/decorative-elements"
import { Logo } from "@/components/logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ImagePreview } from "@/components/image-preview"
import { SearchComponent } from "@/components/search"
import LetterContent from "@/components/letterContent";
import { Footer } from "@/components/footer";

export default function Home() {
  const [wishes, setWishes] = useState<WishType[]>([
    //Example data for testing
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

  // Search function
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchResults, setSearchResults] = useState<{ count: number; currentIndex: number }>({
    count: 0,
    currentIndex: 0,
  })
  const [highlightedElements, setHighlightedElements] = useState<Element[]>([])

  // Reset window position on page load
  useEffect(() => {
    window.scrollTo(0, 0)
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0
    }
  }, [])

  // Handle scroll to set active section
  useEffect(() => {
    const initializeObserver = () => {
      const sections = Array.from(document.querySelectorAll("section[id]")).filter(
        (section) => section.id !== "letter"
      );
      const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      };
  
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      }, observerOptions);
  
      sections.forEach((section) => observer.observe(section));
  
      return () => {
        sections.forEach((section) => observer.unobserve(section));
      };
    };
    const cleanup = initializeObserver();
  
    return cleanup;
  }, [isLetterUnlocked]);

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
        console.error("Không thể gửi lưu bút")
      }
    } catch (error) {
      console.error("Lỗi khi gửi lưu bút:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Perform search with the given query
  const performSearch = (query: string) => {
    // Clear previous highlights
    clearHighlights()

    if (!query.trim()) return

    // Get only the content sections to be searched
    const contentSections = [
      isLetterUnlocked ? document.getElementById("letter") : null, //Only perform search for #letter if the letter is unlocked :D
      document.getElementById("memories"),
      document.getElementById("timeline"),
      document.getElementById("wishes"),
    ].filter(Boolean) as HTMLElement[]

    const searchText = query.toLowerCase()
    const matchedElements: Element[] = []

    // Search only within the specified content sections
    contentSections.forEach((section) => {
      const textElements = section.querySelectorAll("p, h2, h3, h4, h5, h6, span:not(.search-highlight)")

      textElements.forEach((el) => {
        // Skip elements
        if (!el.textContent || el.closest(".search-container") || el.classList.contains("search-highlight")) {
          return
        }

        const content = el.textContent.toLowerCase()
        if (content.includes(searchText)) {
          // Store original content
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
    const headerHeight = 75

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

  // Fetch lưu bút from Firestore database when the component mounts*
  useEffect(() => {
    const fetchWishes = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        console.log("Đang tải lưu bút từ API...")
        const response = await fetch("/api/wishes")

        if (!response.ok) {
          throw new Error(`API trả về trạng thái: ${response.status}`)
        }

        const data = await response.json()
        console.log("Dữ liệu lưu bút đã nhận:", data)

        if (data.wishes && Array.isArray(data.wishes) && data.wishes.length > 0) {
          const sortedWishes = data.wishes.sort((a: WishType, b: WishType) => {
            return parseInt(a.id) - parseInt(b.id); // Sorting from databasse: wishes > document_id> id
          });
  
          setWishes(sortedWishes);
          console.log(`Đã tải thành công ${data.wishes.length} lưu bút`)
        } else {
          console.log("Không tìm thấy lưu bút hoặc Array[] được trả về")
        }

        console.log("")
        console.log("Đây chỉ là 1 số method try và catch để debug thôi ^^")
        console.log("Nếu bạn đang đọc được những dòng này thì chắc hẳn bạn cũng có tí kiến thức về Web nhỉ?")
        console.log("Have fun! Và mình có source code mà ^^")
        console.log("")

      } catch (error) {
        console.error("Không thể tải lưu bút:", error)
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
    { id: "letter", icon: <Inbox className="mr-2 h-4 w-4" />, label: "Hộp thư đến" },
    { id: "memories", icon: <Camera className="mr-2 h-4 w-4" />, label: "Kỷ niệm" },
    { id: "timeline", icon: <Clock className="mr-2 h-4 w-4" />, label: "Dòng thời gian" },
    { id: "wishes", icon: <FolderHeart className="mr-2 h-4 w-4" />, label: "Lưu bút" },
  ]

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    if (!mainContentRef.current) return

    const section = document.getElementById(sectionId)
    if (!section) return

    const container = mainContentRef.current
    const headerHeight = 75

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
        <div className="absolute bottom-0 -right-3 bg-pink-100 rounded-full p-1">
          <Heart className="h-4 w-4 text-pink-500" />
        </div>
      </div>
      <h2 className="text-xl font-semibold mt-2">Nguyễn Thị Thuý Loan</h2>
      <p className="text-pink-500">Giáo viên</p>
      <p className="text-gray-500 text-base">THPT Quang Trung Đống Đa</p>

      <Separator className="my-4 bg-pink-100 w-full" />

      <div className="space-y-3 w-full text-left">
        <div>
          <h3 className="text-base font-medium text-pink-500">Năm công tác</h3>
          <p className="text-gray-900">1990 - nay</p>
        </div>
        <div>
          <h3 className="text-base font-medium text-pink-500">Môn học giảng dạy</h3>
          <p className="text-gray-900">Ngữ Văn<span className="text-pink-500">*</span>, Sử, GDĐP</p>
        </div>
        <div>
          <h3 className="text-base font-medium text-pink-500">Học vấn</h3>
          <p className="text-gray-900">Đại học Sư phạm 2 Hà Nội</p>
        </div>
      </div>

      <Separator className="my-4 bg-pink-100 w-full" />

      <div className="w-full text-left">
        <h3 className="text-base font-medium text-pink-500 mb-2">Thành tựu nổi bật</h3>
        <ul className="space-y-2 text-base">
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
        <h3 className="text-base font-medium text-pink-500 mb-2">Lời cô nhắn nhủ</h3>
        <blockquote className="text-gray-900 italic text-base bg-white p-3 border-l-2 border-pink-300 rounded-r-md">
          "Cô chúc các con - lứa con út bé bỏng nhưng ra đời sẽ lớn mạnh, thành công, hạnh phúc!"
          <footer className="text-pink-500 mt-1">— N.T Thuý Loan</footer>
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
            className={`flex items-center px-3 py-2 text-base rounded-md hover:bg-pink-50 transition-colors ${
              activeSection === item.id && item.id !== "letter"
                ? "bg-gradient-to-r from-pink-50 to-pink-100 text-pink-600 font-medium border-l-2 border-pink-400"
                : "text-gray-900"
            } ${item.id === "profile" ? "md:hidden" : ""}`} // Hide profile information on desktop
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(item.id);
            }}
            >
              {item.icon}
              {item.label}
              {item.id === "letter" && !isLetterUnlocked && (
                <FaCircle className="ml-2 text-[8px] text-pink-500" />
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 border-b print:hidden bg-white z-10">
          <div className="flex items-center justify-between p-4 bg-white">
            <div className="flex items-center bg-white">
              {/* Mobile menu button */}
              <Sheet
                open={isMobileMenuOpen} // Control the open state
                onOpenChange={(open) => setIsMobileMenuOpen(open)} // Update state when the menu is opened/closed
              >
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden mr-2 hover:bg-pink-50"
                    onClick={() => setIsMobileMenuOpen(true)} // Open the menu
                  >
                    <Menu className="h-5 w-5 text-gray-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-white">
                  <div className="p-4">
                    <Logo />
                    <div className="decorative-line w-3/5 mt-2"></div>
                  </div>
                  <Separator />
                  <nav className="flex-1 p-4 space-y-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`#${item.id}`}
                        className={`flex items-center px-3 py-2 text-base rounded-md hover:bg-pink-50 transition-colors`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(item.id); // Scroll to the section
                          setIsMobileMenuOpen(false); // Close the mobile menu
                        }}
                      >
                        {item.icon}
                        {item.label}
                        {item.id === "letter" && !isLetterUnlocked && (
                          <FaCircle className="ml-2 text-[8px] text-pink-500" />
                        )}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              <img src={"/xuanlam_signature_black.png"} alt={"Xuân Lâm"} className="w-32 object-cover" />
            </div>
            <div className="flex items-center space-x-2">
              <SearchComponent
                onSearch={performSearch}
                onNavigate={navigateSearchResults}
                onClose={closeSearch}
                searchResults={searchResults}
              />
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
            <DecorativeCircle className="dec_cir w-96 h-96 -top-20 -left-20" />
            <DecorativeCircle className="dec_cir w-96 h-96 -bottom-20 -right-20" />
            <DecorativeDots className="w-full h-full opacity-50" />
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
                <div className="letter-container mb-6 flex justify-left items-center pb-5 mt-auto">
                  <h2 className="text-2xl font-semibold section-heading">
                    Viết cho mùa hạ cuối (cuối khoá 2022-2025)
                  </h2>
                  <div className="small-button ml-3 mt-auto mb-[0.35rem] inline text-xs bg-[#ddd] px-1 py-[0.1rem] text-[#666] rounded-[3px]"><span>Hộp thư đến</span></div>
                </div>
              
                <div className="max-w-3xl mx-auto bg-white p-0 md:p-0 border border-pink-100 shadow-sm ">
                  {isLetterUnlocked ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.5 }}
                      className="space-y-4 letter paper-texture p-4 md:p-8"
                    >
                      <LetterContent />

                      <div className="flex flex-col md:flex-row gap-6 mt-8 mb-4">
                        <div className="flex-1">
                          <div className="border-2 border-dashed border-pink-300 rounded-md p-4 flex flex-col items-center justify-center min-h-[200px]">
                            <p className="text-pink-400 text-base mb-1">[Ảnh cá nhân]</p>
                            <div className="w-32 h-40 bg-gray-100 flex items-center justify-center">
                              <ImagePreview
                                src="/YEU_1556[1].jpg"
                                alt="Ảnh cá nhân"
                                className="max-w-full max-h-full object-cover personal-photo"
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
                            <div className="mt-4 text-base text-gray-900">
                              <p>Địa chỉ liên lạc: Số 19, ngách 122/22 đường Láng, Thịnh Quang, Đống Đa, Hà Nội.</p>
                              <p>Số điện thoại: 0962913298</p>
                              <p>Email: hoangxuanlam2007@outlook.com</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
                <FloatingHearts />
                <h2 className="text-2xl font-semibold mb-2 section-heading">Lưu bút và trở thành 1 phần ký ức của tớ ❤️</h2>
                <div className="decorative-line w-6/7 md:w-[30rem] mb-6"></div>

                {/* Well Wishes Form */}
                <div className="max-w-2xl mx-auto bg-white p-6 border border-pink-100 rounded-lg shadow-sm mb-8">
                  <form className="space-y-4" onSubmit={handleWishSubmit}>
                    <div>
                      <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-1">
                        Tên
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newWish.name}
                        onChange={handleWishChange}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Tên"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="nickname" className="block text-base font-medium text-gray-700 mb-1">
                        Biệt danh
                      </label>
                      <input
                        type="text"
                        id="nickname"
                        name="nickname"
                        value={newWish.nickname}
                        onChange={handleWishChange}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Biệt danh"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="relationship" className="block text-base font-medium text-gray-700 mb-1">
                        Mối quan hệ
                      </label>
                      <input
                        type="text"
                        id="relationship"
                        name="relationship"
                        value={newWish.relationship}
                        onChange={handleWishChange}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Bạn cùng bàn, bro, v.v."
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-base font-medium text-gray-700 mb-1">
                        Nội dung
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={newWish.message}
                        onChange={handleWishChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-pink-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Nội dung lưu bút nè..."
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
                            <PencilLine className="mr-2 h-4 w-4" />
                            Lưu bút
                          </span>
                        )}
                      </Button>
                      <AnimatePresence>
                        {submitSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-full left-0 right-0 mt-2 p-2 bg-green-50 text-green-700 text-base rounded-md border border-green-200"
                          >
                            <div className="flex items-center">
                              <Sparkles className="h-4 w-4 mr-2 text-green-500" />
                              Lưu bút của bạn đã lưu lại vào bộ nhớ của mình ❤️
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
                      <p className="mt-2 text-gray-600">Đang tải lưu bút...</p>
                    </div>
                  ) : loadError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                      <p>Lỗi khi tải lưu bút: {loadError}</p>
                      <p className="text-base mt-1">Vui lòng thử làm mới trang.</p>
                    </div>
                  ) : wishes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Chưa có lưu bút nào. Hãy là người đầu tiên để lại lưu bút nhé!</p>
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
                            <h3 className="font-medium text-gray-900">
                              {wish.name} 
                            </h3>
                            {wish.nickname && <p className="text-base text-pink-500"><span className="quotation pr-0.5">❝</span>{wish.nickname}<span className="quotation pl-0.5">❞</span></p>}
                            {wish.relationship && <p className="text-sm text-gray-500">{wish.relationship}</p>}
                          </div>
                          <span className="text-xs/[24px] text-gray-400 top-0.5 relative">{wish.date}</span>
                        </div>
                        <p className="text-gray-700">{wish.message}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>
              <div>
              </div>

              {/* Footer */}
              <Footer />
              
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
          <p className="text-pink-500 text-base mb-2">{date}</p>
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
        <span className="text-base font-medium text-pink-500">{date}</span>
      </div>
      <h3 className="font-medium text-lg mb-1">{title}</h3>
      <p className="text-gray-900">{description}</p>
    </div>
  )
}

// Sample data for memories
const memories = [
  {
    title: "Tham quan Hạ Long - Đền thờ Chu Văn An",
    date: "2 Tháng 11, 2022",
    description: "Chuyến đi tham quan đầu tiên của tập thể lớp 10D5 với cô Loan và được tham gia các trò chơi tại Quần thể du lịch giải trí Sun World Hạ Long.",
    images: [
      "/L-10.jpg",
      "/L-102.jpg",
    ],
  },
  {
    title: "Tham quan Tràng An - Ninh Bình",
    date: "3 Tháng 12, 2023",
    description: "Tham quan, dã ngoại tại Quần thể danh thắng Tràng An - biểu tượng lịch sử nổi tiếng của Ninh Bình.",
    images: [
      "/12.jpg",
      "/11.jpg",
    ],
  },
  {
    title: "Kỷ yếu lớp 12D5",
    date: "13 Tháng 10, 2024",
    description: "Buổi chụp ảnh kỷ yếu đầy ý nghĩa, là những kỷ niệm thanh xuân ngọt ngào khắc sâu vào tâm hồn.",
    images: [
      "/kiyeu1.jpg",
      "/kiyeu2.jpg",
    ],
  },
  {
    title: "Tham quan FLC Sầm Sơn - Thanh Hoá",
    date: "26 Tháng 10, 2024",
    description: "Những khoảnh khắc gắn kết ấy đã khắc sâu trong tim ta những kỷ niệm đáng nhớ chặng cuối năm học cấp Ba",
    images: [
      "/L12.jpg",
      "/121.jpg",
    ],
  },
]

const timelineItems = [
  {
    date: "Tháng 8, 2022",
    title: "Bắt đầu năm học lớp 10",
    description: "Những bước chân chập chững đầu tiên, được làm quen với môi trường mới, thầy cô, bạn bè mới.",
  },
  {
    date: "Tháng 5, 2023",
    title: "Kết thúc năm học lớp 10",
    description: "Đã dần thoải mái và thích nghi được với môi trường học tập, làm quen được với các bạn.",
  },
  {
    date: "Tháng 8, 2023",
    title: "Bắt đầu năm học lớp 11",
    description: "Chơi thân với các bạn hơn, làm việc nhóm và có lưu bút trong nhiều dự án.",
  },
  {
    date: "Tháng 5, 2024",
    title: "Kết thúc năm học lớp 11",
    description: "Một năm học đầy ắp kỷ niệm, các hoạt động trải nghiệm thú vị.",
  },
  {
    date: "Tháng 8, 2024",
    title: "Bắt đầu năm học lớp 12",
    description: "Năm học cuối cấp, chơi thân với nhiều bạn hơn, mở lòng và thoải mái hơn với bản thân rất nhiều.",
  },
  {
    date: "Tháng 5, 2025",
    title: "Lễ trưởng thành và tốt nghiệp",
    description: "Những ngày tháng cuối cùng dưới mái trường THPT Quang Trung-Đống Đa, hy vọng về một tương lai tốt đẹp.",
  },
]
