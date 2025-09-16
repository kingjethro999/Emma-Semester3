import { NextResponse } from "next/server"

// This would typically connect to a database
const products = [
  {
    id: 1,
    name: "Bottled Water (Pack of 6)",
    price: 4.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "beverages",
    description: "A pack of 6 refreshing bottled water. Perfect for staying hydrated throughout the day.",
    stock: 24,
  },
  {
    id: 2,
    name: "Amstel Beer (6-pack)",
    price: 9.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "beverages",
    description: "Premium quality Amstel beer in a convenient 6-pack. Perfect for gatherings and celebrations.",
    stock: 18,
  },
  {
    id: 3,
    name: "Assorted Snacks",
    price: 3.49,
    image: "/placeholder.svg?height=300&width=300",
    category: "snacks",
    description: "A variety of delicious snacks to satisfy your cravings. Great for parties or personal enjoyment.",
    stock: 35,
  },
  {
    id: 4,
    name: "Pasta Packages",
    price: 2.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "packaged-foods",
    description: "High-quality pasta packages for quick and easy meal preparation. Various shapes available.",
    stock: 42,
  },
  {
    id: 5,
    name: "Soft Drinks (Pack of 6)",
    price: 5.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "beverages",
    description: "Refreshing soft drinks in a variety of flavors. Perfect for any occasion.",
    stock: 30,
  },
]

export async function GET(request: Request) {
  // Get URL parameters
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const id = searchParams.get("id")

  // Return a specific product by ID
  if (id) {
    const product = products.find((p) => p.id === Number.parseInt(id))
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  }

  // Filter by category if provided
  if (category) {
    const filteredProducts = products.filter((p) => p.category === category)
    return NextResponse.json(filteredProducts)
  }

  // Return all products
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: "Missing required fields: name, price, category" }, { status: 400 })
    }

    // In a real app, you would save to a database here
    // For this example, we'll just return the data with an ID
    const newProduct = {
      id: products.length + 1,
      ...body,
      stock: body.stock || 0,
    }

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
