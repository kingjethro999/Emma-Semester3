"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Search, SlidersHorizontal, Grid, List } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { CategoryNav } from "@/components/category-nav"
import { BackToTop } from "@/components/back-to-top"
import { productsAPI, categoriesAPI } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/ui/star-rating"
import { ShoppingCart } from "lucide-react"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortOption, setSortOption] = useState("featured")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [inStock, setInStock] = useState(true)
  const [onSale, setOnSale] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isScrolled, setIsScrolled] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch categories
        const categoriesData = await categoriesAPI.getAll()
        setCategories(categoriesData)

        // Fetch products
        const productsData = await productsAPI.getAll(selectedCategory !== "all" ? selectedCategory : undefined)
        setProducts(productsData)

        setLoading(false)
      } catch (err) {
        setError("Failed to load data. Please try again later.")
        setLoading(false)
        console.error(err)
      }
    }

    fetchData()
  }, [selectedCategory])

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Filter products based on search, price range, etc.
  const filteredProducts = products.filter((product) => {
    // Search filter - make it more comprehensive and case-insensitive
    const searchLower = searchTerm.toLowerCase().trim()
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)

    // Price filter
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

    // Stock filter
    const matchesStock = !inStock || (product.stock && product.stock > 0)

    // Sale filter
    const matchesSale = !onSale || product.discount

    return matchesSearch && matchesPrice && matchesStock && matchesSale
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "newest":
        return b.id - a.id
      default: // featured
        return 0
    }
  })

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("all")
    setPriceRange([0, 5000])
    setInStock(true)
    setOnSale(false)
  }

  // Get breadcrumb items
  const breadcrumbItems = [{ label: "Products", href: "/products", active: selectedCategory === "all" }]

  if (selectedCategory !== "all") {
    const category = categories.find((c) => c.id === selectedCategory)
    if (category) {
      breadcrumbItems.push({
        label: category.name,
        href: `/products?category=${category.id}`,
        active: true,
      })
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // This prevents the page from refreshing when the form is submitted
    // We're already updating the search results as the user types
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <h1 className="text-3xl font-bold mb-6">
          {selectedCategory === "all"
            ? "All Products"
            : categories.find((c) => c.id === selectedCategory)?.name || "Products"}
        </h1>

        {/* Category Navigation */}
        <CategoryNav activeCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

        {/* Search and sort bar - visible on all devices */}
        <div className="flex flex-col sm:flex-row gap-4 my-6">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <div className="flex gap-2">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden sm:flex border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === "grid" ? "bg-gray-100" : ""}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === "list" ? "bg-gray-100" : ""}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="hidden md:block md:w-1/4 bg-white p-4 rounded-lg shadow h-fit sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Filter className="mr-2 h-5 w-5" /> Filters
              </h2>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 5000]}
                    max={5000}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>₦{priceRange[0].toLocaleString()}</span>
                    <span>₦{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium mb-2">Availability</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox id="in-stock" checked={inStock} onCheckedChange={(checked) => setInStock(checked)} />
                  <label
                    htmlFor="in-stock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    In Stock
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="on-sale" checked={onSale} onCheckedChange={(checked) => setOnSale(checked)} />
                  <label
                    htmlFor="on-sale"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    On Sale
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Mobile */}
          <div className="md:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your product search</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="price">
                      <AccordionTrigger>Price Range</AccordionTrigger>
                      <AccordionContent>
                        <div className="px-2">
                          <Slider
                            defaultValue={[0, 5000]}
                            max={5000}
                            step={100}
                            value={priceRange}
                            onValueChange={setPriceRange}
                          />
                          <div className="flex justify-between mt-2 text-sm text-gray-500">
                            <span>₦{priceRange[0].toLocaleString()}</span>
                            <span>₦{priceRange[1].toLocaleString()}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="availability">
                      <AccordionTrigger>Availability</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="mobile-in-stock"
                              checked={inStock}
                              onCheckedChange={(checked) => setInStock(checked)}
                            />
                            <label
                              htmlFor="mobile-in-stock"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              In Stock
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="mobile-on-sale"
                              checked={onSale}
                              onCheckedChange={(checked) => setOnSale(checked)}
                            />
                            <label
                              htmlFor="mobile-on-sale"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              On Sale
                            </label>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <div className="flex gap-4 mt-auto">
                  <Button variant="outline" className="flex-1" onClick={resetFilters}>
                    Reset
                  </Button>
                  <SheetTrigger asChild>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">Apply Filters</Button>
                  </SheetTrigger>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{sortedProducts.length} products</p>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                {searchTerm ? (
                  <p className="text-gray-500 mb-4">
                    No results found for "{searchTerm}". Try different keywords or adjust your filters.
                  </p>
                ) : (
                  <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                )}
                <Button onClick={resetFilters} className="bg-green-600 hover:bg-green-700">
                  Reset Filters
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="sm:w-1/4 relative">
                      <div className="aspect-square relative">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.is_new && <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>}
                        {product.discount && (
                          <Badge className="bg-red-500 hover:bg-red-600">{product.discount}% OFF</Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div>
                        <div className="text-sm text-gray-500 mb-1 capitalize">{product.category}</div>
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-lg mb-2 hover:text-green-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Rating */}
                        <div className="mb-2">
                          <StarRating rating={4.5} size="sm" showValue />
                        </div>

                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{product.description}</p>
                      </div>

                      <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          {product.discount ? (
                            <div className="flex items-center">
                              <p className="text-green-600 font-bold">
                                ₦{(product.price * (1 - product.discount / 100)).toLocaleString()}
                              </p>
                              <p className="text-gray-400 line-through ml-2 text-sm">
                                ₦{product.price.toLocaleString()}
                              </p>
                            </div>
                          ) : (
                            <p className="text-green-600 font-bold">₦{product.price.toLocaleString()}</p>
                          )}
                          <p className="text-sm mt-1">
                            <span
                              className={product.stock && product.stock > 10 ? "text-green-600" : "text-orange-500"}
                            >
                              {product.stock && product.stock > 10 ? "In Stock" : "Low Stock"}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              // Add to cart logic
                            }}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href={`/products/${product.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <BackToTop />
    </>
  )
}
