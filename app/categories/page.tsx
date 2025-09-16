"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { categoriesAPI } from "@/lib/api"

export default function CategoriesPage() {
  const [displayCategories, setDisplayCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await categoriesAPI.getAll()
        const arr = Array.isArray(data) ? data : []
        setDisplayCategories(arr.filter((c: any) => c.id !== "all"))
      } catch (e: any) {
        console.error(e)
        setError("Failed to load categories")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Map of category images
  const categoryImages: Record<string, string> = {
    "household-items":
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-05-19%20at%202.30.07%20AM-1BRhT4jEWsbsiGV6FON2alHouGuKsY.jpeg",
    beverages:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-05-19%20at%202.30.04%20AM-XfHoFEwVUG1iKlHTSeWlpPSXpjwozV.jpeg",
    "cooking-oils":
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-05-19%20at%202.30.05%20AM-bQPVBrCeC8V6cj6teR5nivmhFFaZcT.jpeg",
    "packaged-foods":
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-05-19%20at%202.30.06%20AM%20%281%29-eWnGZO9wjuHYyjiC2NwZDoRDcQ5TgD.jpeg",
    "personal-care":
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-05-19%20at%202.30.05%20AM%20%281%29-38DGizfwWyyYb4dZU8NbHFmtM8aefI.jpeg",
    "canned-foods":
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-05-17%20at%2011.37.53%20PM-zJlcJ1ebuo5R70lVX6sZFbuazLvjO6.jpeg",
    seasonings: "/images/maggi-seasoning.png",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex justify-start">
        <Button variant="outline" asChild className="flex items-center">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Breadcrumb
        items={[
          { label: "Home", href: "/", active: false },
          { label: "Categories", href: "/categories", active: true },
        ]}
        className="mb-6"
      />

      <h1 className="text-3xl font-bold mb-6">Product Categories</h1>
      <p className="text-gray-600 mb-8">Browse our wide range of products by category.</p>

      {loading && <p className="text-center text-gray-500">Loading categories...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCategories.map((category) => (
          <Link key={category.id} href={`/categories/${category.id}`}>
            <Card className="hover:shadow-lg transition-all h-full border-2 hover:border-green-500">
              <CardContent className="p-4 flex flex-col items-center text-center h-full">
                <div className="w-full aspect-square relative mb-4 overflow-hidden rounded-md">
                  <Image
                    src={categoryImages[category.id] || "/placeholder.svg?height=200&width=200"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                <Button className="mt-4 bg-green-600 hover:bg-green-700">Browse Products</Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
