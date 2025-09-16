import { NextResponse } from "next/server"

// This would typically connect to a database
const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john@example.com",
    items: [
      { productId: 1, name: "Bottled Water (Pack of 6)", price: 4.99, quantity: 2 },
      { productId: 3, name: "Assorted Snacks", price: 3.49, quantity: 3 },
    ],
    date: "2023-05-12",
    status: "Delivered",
    total: 24.97,
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    email: "jane@example.com",
    items: [{ productId: 2, name: "Amstel Beer (6-pack)", price: 9.99, quantity: 4 }],
    date: "2023-05-11",
    status: "Processing",
    total: 39.98,
  },
  {
    id: "ORD-003",
    customer: "Robert Johnson",
    email: "robert@example.com",
    items: [
      { productId: 4, name: "Pasta Packages", price: 2.99, quantity: 2 },
      { productId: 5, name: "Soft Drinks (Pack of 6)", price: 5.99, quantity: 1 },
      { productId: 3, name: "Assorted Snacks", price: 3.49, quantity: 1 },
    ],
    date: "2023-05-10",
    status: "Shipped",
    total: 15.96,
  },
]

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    // Return a specific order by ID
    if (id) {
      const order = orders.find((o) => o.id === id)
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      return NextResponse.json(order)
    }

    // Return all orders
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error in GET /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.customer || !body.email || !body.items || !body.items.length) {
      return NextResponse.json({ error: "Missing required fields: customer, email, items" }, { status: 400 })
    }

    // Calculate total
    const total = body.items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0,
    )

    // Generate order ID
    const orderId = `ORD-${(orders.length + 1).toString().padStart(3, "0")}`

    // Create new order
    const newOrder = {
      id: orderId,
      ...body,
      date: new Date().toISOString().split("T")[0],
      status: "Processing",
      total: Number.parseFloat(total.toFixed(2)),
    }

    // In a real app, you would save to a database here

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/orders:", error)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
