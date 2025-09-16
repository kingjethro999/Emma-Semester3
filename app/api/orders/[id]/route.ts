import { NextResponse } from "next/server"

// Import the orders data
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const order = orders.find((o) => o.id === id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error(`Error fetching order ${params.id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const orderIndex = orders.findIndex((o) => o.id === id)

    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // In a real app, you would update the database here
    // For this example, we'll just return the updated order
    const updatedOrder = {
      ...orders[orderIndex],
      ...body,
      id: id, // Ensure ID doesn't change
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error(`Error updating order ${params.id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const orderIndex = orders.findIndex((o) => o.id === id)

    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // In a real app, you would delete from the database here

    return NextResponse.json({ success: true, message: `Order ${id} deleted successfully` })
  } catch (error) {
    console.error(`Error deleting order ${params.id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
