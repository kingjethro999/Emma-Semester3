"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Check, Truck, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product-card"
import { StarRating } from "@/components/ui/star-rating"
import { ProductReviews } from "@/components/product-reviews"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { BackToTop } from "@/components/back-to-top"
import { toast } from "@/hooks/use-toast"
import { productsAPI, reviewsAPI } from "@/lib/api"

export default function ProductPage({ params }: { params: { id: string } }) {
  const productId = Number.parseInt(params.id)
  const [product, setProduct] = useState<any | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const p = await productsAPI.getById(productId)
        setProduct(p)
        const r = await reviewsAPI.getByProduct(productId)
        setReviews(Array.isArray(r) ? r : [])
        // Load related products by same category if available
        if (p?.category) {
          const sameCat = await productsAPI.getAll(p.category)
          setRelatedProducts((sameCat || []).filter((x: any) => Number(x.id) !== productId).slice(0, 8))
        } else {
          setRelatedProducts([])
        }
        setError("")
      } catch (e: any) {
        console.error(e)
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId])

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Loading product...</h1>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    )
  }

  // Rating stats from fetched reviews
  const reviewCount = reviews.length
  const averageRating = reviewCount
    ? Math.round(((reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / reviewCount) + Number.EPSILON) * 10) / 10
    : 0

  // Calculate discount price if applicable
  const discountedPrice = product.discount ? product.price - (product.price * product.discount) / 100 : null

  const handleAddToCart = () => {
    setIsAdding(true)

    // Simulate adding to cart
    setTimeout(() => {
      setIsAdding(false)
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
      })
    }, 600)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product.stock || 10)) {
      setQuantity(newQuantity)
    }
  }

  // Get breadcrumb items
  const breadcrumbItems = [{ label: "Products", href: "/products", active: false }]
  if (product.category) {
    breadcrumbItems.push({
      label: String(product.category),
      href: `/products?category=${product.category}`,
      active: false,
    })
  }

  breadcrumbItems.push({
    label: product.name,
    href: `/products/${product.id}`,
    active: true,
  })

  // Product images (for demo, we'll use the same image multiple times)
  const productImages = [
    product.image,
    product.image, // In a real app, these would be different images
    product.image,
  ]

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Sticky product navigation */}
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 transition-transform duration-300 ${
            isScrolled ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 relative mr-3">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-green-600 font-bold text-sm">
                    {discountedPrice ? `₦${discountedPrice.toLocaleString()}` : `₦${product.price.toLocaleString()}`}
                  </p>
                </div>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700"
                size="sm"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? "Added" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            {/* Main product image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md mb-4">
              <div className="relative aspect-square">
                <Image
                  src={productImages[activeImage] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />

                {/* Product badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>}
                  {product.discount && <Badge className="bg-red-500 hover:bg-red-600">{product.discount}% OFF</Badge>}
                </div>

                {/* Image navigation arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail images */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                      activeImage === index ? "border-green-600" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-sm text-gray-500 uppercase">{product.category}</span>
            </div>

            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={averageRating} size="sm" />
              <span className="text-sm text-gray-500">
                {reviewCount > 0 ? `${reviewCount} reviews` : "No reviews yet"}
              </span>
            </div>

            <div className="mb-4">
              {discountedPrice ? (
                <div className="flex items-center">
                  <p className="text-2xl text-green-600 font-bold">₦{discountedPrice.toLocaleString()}</p>
                  <p className="text-lg text-gray-400 line-through ml-2">₦{product.price.toLocaleString()}</p>
                  <Badge className="ml-2 bg-red-500">{product.discount}% OFF</Badge>
                </div>
              ) : (
                <p className="text-2xl text-green-600 font-bold">₦{product.price.toLocaleString()}</p>
              )}
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">{product.description}</p>
              <p className="text-sm flex items-center">
                <span className={product.stock && product.stock > 10 ? "text-green-600" : "text-orange-500"}>
                  {product.stock && product.stock > 10 ? "In Stock" : "Low Stock"} ({product.stock} available)
                </span>
              </p>
            </div>

            <div className="grid gap-4 mb-6">
              <div>
                <label htmlFor="quantity" className="font-medium block mb-2">
                  Quantity:
                </label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="rounded-r-none"
                  >
                    -
                  </Button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.stock || 10}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                    className="w-16 h-10 text-center border-y"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (product.stock || 10)}
                    className="rounded-l-none"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Product benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="h-4 w-4 mr-2 text-green-600" />
                <span>Free delivery</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                <span>Quality guarantee</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <RefreshCw className="h-4 w-4 mr-2 text-green-600" />
                <span>Easy returns</span>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <Button
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <Check className="mr-2 h-5 w-5" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`px-4 ${isWishlisted ? "text-red-500 border-red-500" : ""}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Previous/Next navigation removed (requires full product list) */}

        <Tabs defaultValue="details" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <p className="mb-4">{product.description}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1)}</li>
              <li>SKU: PRD-{product.id.toString().padStart(4, "0")}</li>
              <li>Storage: Keep in a cool, dry place</li>
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="bg-white p-6 rounded-lg shadow-sm">
            <ProductReviews productId={productId} />
          </TabsContent>
          <TabsContent value="shipping" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Shipping & Returns</h2>
            <p className="mb-4">
              We offer fast and reliable shipping options to ensure your groceries arrive fresh and on time.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Standard Delivery: 1-3 business days</li>
              <li>Express Delivery: Same day delivery for orders placed before 12pm</li>
              <li>Free shipping on orders over ₦20,000</li>
              <li>Returns accepted within 7 days for non-perishable items</li>
            </ul>
          </TabsContent>
        </Tabs>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Back to top button */}
      <BackToTop />
    </>
  )
}
