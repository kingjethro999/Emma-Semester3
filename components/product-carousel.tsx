"use client"

import { useState, useRef, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductCarouselProps {
  title: string
  products: any[]
  viewAllHref?: string
}

export function ProductCarousel({ title, products, viewAllHref }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Check if we can scroll in either direction
  const checkScrollability = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10) // 10px buffer
  }

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener("scroll", checkScrollability)
    window.addEventListener("resize", checkScrollability)

    // Initial check
    checkScrollability()

    return () => {
      container.removeEventListener("scroll", checkScrollability)
      window.addEventListener("resize", checkScrollability)
    }
  }, [])

  // Handle scroll buttons
  const handleScroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 300 // Scroll by 300px (approximately 1 product card)
    const targetScroll = container.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 py-2 overflow-x-auto hide-scrollbar scroll-smooth"
          aria-label={`${title} product carousel`}
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Gradient overlays */}
        {canScrollLeft && (
          <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"></div>
        )}
        {canScrollRight && (
          <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>
        )}
      </div>

      {viewAllHref && (
        <div className="text-center mt-8">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <a href={viewAllHref}>View All</a>
          </Button>
        </div>
      )}
    </div>
  )
}
