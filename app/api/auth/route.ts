import { NextResponse } from "next/server"

// This would typically connect to a database
const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123", // In a real app, this would be hashed
    role: "admin",
  },
  {
    id: 2,
    name: "Customer User",
    email: "customer@example.com",
    password: "customer123", // In a real app, this would be hashed
    role: "customer",
  },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = users.find((u) => u.email === body.email)

    // Check if user exists and password matches
    if (!user || user.password !== body.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // In a real app, you would generate a JWT token here
    const token = "sample-jwt-token"

    // Return user info (excluding password) and token
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
