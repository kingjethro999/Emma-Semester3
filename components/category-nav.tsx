"use client"

import React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { categoriesAPI } from "@/lib/api"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CategoryNavProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navRef = React.useRef<HTMLDivElement>(null)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll()
        setCategories(data)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch categories:", err)
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Handle scroll event to make the nav sticky
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check if arrows should be shown
  useEffect(() => {
    if (navRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = navRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth)
    }
  }, [categories])

  // Handle horizontal scrolling
  const handleScroll = (direction: "left" | "right") => {
    if (navRef.current) {
      const scrollAmount = 200
      const newScrollLeft =
        direction === "left" ? navRef.current.scrollLeft - scrollAmount : navRef.current.scrollLeft + scrollAmount

      navRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })

      // Update arrow visibility after scrolling
      setTimeout(() => {
        if (navRef.current) {
          const { scrollWidth, clientWidth, scrollLeft } = navRef.current
          setShowLeftArrow(scrollLeft > 0)
          setShowRightArrow(scrollLeft + clientWidth < scrollWidth)
        }
      }, 300)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="h-10 flex items-center justify-center">
            <p className="text-sm text-gray-500">Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-white border-b border-gray-200 transition-all duration-300 z-10",
        scrollPosition > 100 ? "sticky top-0 shadow-md" : "",
      )}
    >
      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex items-center">
          {showLeftArrow && (
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div
            ref={navRef}
            className="flex overflow-x-auto hide-scrollbar space-x-4 px-6 py-1 scroll-smooth"
            onScroll={() => {
              if (navRef.current) {
                const { scrollWidth, clientWidth, scrollLeft } = navRef.current
                setShowLeftArrow(scrollLeft > 0)
                setShowRightArrow(scrollLeft + clientWidth < scrollWidth)
              }
            }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  activeCategory === category.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          {showRightArrow && (
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
