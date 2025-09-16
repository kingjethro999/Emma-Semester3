"use client"

import { useState, useRef, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { productsAPI } from "@/lib/api"

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)

  // Load products
  useEffect(() => {
    const load = async () => {
      try {
        const items = await productsAPI.getAll("all")
        setFeaturedProducts((items || []).filter((p: any) => p.isNew).slice(0, 4))
      } catch (e) {
        console.error("Failed to load featured products", e)
      }
    }
    load()
  }, [])

  // Calculate container and content widths for scroll limits
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      setContainerWidth(container.clientWidth)
      setContentWidth(container.scrollWidth)
    }

    const handleResize = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        setContainerWidth(container.clientWidth)
        setContentWidth(container.scrollWidth)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || !scrollContainerRef.current || containerWidth >= contentWidth) return

    const scrollSpeed = 1 // pixels per frame
    let animationFrameId: number

    const scroll = () => {
      setScrollPosition((prevPosition) => {
        const newPosition = prevPosition + scrollSpeed

        // Reset to beginning when reaching the end
        if (newPosition >= contentWidth - containerWidth) {
          return 0
        }

        return newPosition
      })

      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animationFrameId)
  }, [isPaused, containerWidth, contentWidth])

  // Update scroll position
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollPosition
    }
  }, [scrollPosition])

  const handleManualScroll = (direction: "left" | "right") => {
    // Pause auto-scroll when manually scrolling
    setIsPaused(true)

    const scrollAmount = containerWidth * 0.8

    setScrollPosition((prevPosition) => {
      let newPosition = prevPosition + (direction === "right" ? scrollAmount : -scrollAmount)

      // Ensure we don't scroll beyond boundaries
      if (newPosition < 0) newPosition = 0
      if (newPosition > contentWidth - containerWidth) newPosition = contentWidth - containerWidth

      return newPosition
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-8">
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/products">View All Products</Link>
        </Button>
      </div>
    </div>
  )
}
