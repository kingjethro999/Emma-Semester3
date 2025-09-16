import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    id: 1,
    name: "Beverages",
    image: "/placeholder.svg?height=200&width=200",
    slug: "beverages",
    count: 24,
    description: "Water, soft drinks, beer, and more",
  },
  {
    id: 2,
    name: "Snacks",
    image: "/placeholder.svg?height=200&width=200",
    slug: "snacks",
    count: 18,
    description: "Chips, chocolates, biscuits, and candies",
  },
  {
    id: 3,
    name: "Packaged Foods",
    image: "/placeholder.svg?height=200&width=200",
    slug: "packaged-foods",
    count: 32,
    description: "Pasta, rice, noodles, and canned goods",
  },
  {
    id: 4,
    name: "Household Items",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-05-19%20at%202.30.07%20AM-1BRhT4jEWsbsiGV6FON2alHouGuKsY.jpeg",
    slug: "household-items",
    count: 27,
    description: "WAW detergent, cleaning supplies and everyday essentials",
  },
]

export function CategoryList() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/categories/${category.slug}`} className="block">
          <Card className="hover:shadow-lg transition-all h-full border-2 hover:border-green-500">
            <CardContent className="p-4 flex flex-col items-center text-center h-full">
              <div className="w-full aspect-square relative mb-4 overflow-hidden rounded-md">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
              <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{category.description}</p>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{category.count} items</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
