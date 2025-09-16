// API configuration (PHP backend at http://localhost/emmaapi/v1/api.php)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost/emmaapi/v1/api.php"

// Helper function for API requests
function buildPhpApiUrl(endpoint: string): string {
  const [path, query] = endpoint.split("?")
  const url = new URL(API_BASE)
  url.searchParams.set("endpoint", path)
  if (query) {
    const params = new URLSearchParams(query)
    params.forEach((value, key) => {
      url.searchParams.append(key, value)
    })
  }
  return url.toString()
}

function normalizeProduct(raw: any) {
  if (!raw) return raw
  return {
    ...raw,
    isNew: raw.isNew ?? raw.is_new ?? false,
    price: typeof raw.price === "string" ? Number.parseFloat(raw.price) : raw.price,
    stock: typeof raw.stock === "string" ? Number.parseInt(raw.stock) : raw.stock,
    discount: raw.discount == null ? null : typeof raw.discount === "string" ? Number.parseFloat(raw.discount) : raw.discount,
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = buildPhpApiUrl(endpoint)

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  }
  // Only set Content-Type when sending a body and it's not already set
  if (options.body && !("Content-Type" in headers)) {
    const isForm = typeof FormData !== "undefined" && options.body instanceof FormData
    if (!isForm) headers["Content-Type"] = "application/json"
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Dev-only logging for request/response
  if (process.env.NODE_ENV !== "production") {
    try {
      // Log after we get a response to capture status and content-type
      console.debug("[API]", {
        url: url.toString(),
        method: options.method || "GET",
        status: response.status,
        contentType: response.headers.get("content-type"),
      })
    } catch {}
  }

  if (!response.ok) {
    // Handle error responses (support non-JSON like HTML error pages)
    let message = `HTTP ${response.status} ${response.statusText}`
    const contentType = response.headers.get("content-type") || ""
    try {
      if (contentType.includes("application/json")) {
        const error = await response.json()
        message = (error && (error.message || error.error)) || message
      } else {
        const text = await response.text()
        message = `${message} - ${text.slice(0, 300)}`
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    const text = await response.text()
    throw new Error(`Expected JSON but received ${contentType || "unknown"}: ${text.slice(0, 300)}`)
  }

  return await response.json()
}

// Small helper to inject Authorization header
function withAuth(options: RequestInit = {}, token?: string): RequestInit {
  if (!token) return options
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${token}`,
  }
  return { ...options, headers }
}

// Products API
export const productsAPI = {
  getAll: async (category?: string) => {
    const endpoint = category && category !== "all" ? `products?category=${category}` : "products"
    const data = await fetchAPI(endpoint)
    return Array.isArray(data) ? data.map(normalizeProduct) : []
  },

  getById: async (id: number) => {
    const data = await fetchAPI(`products/${id}`)
    return normalizeProduct(data)
  },

  create: async (productData: any) => {
    return fetchAPI("products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  },

  update: async (id: number, productData: any) => {
    return fetchAPI(`products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  },

  delete: async (id: number) => {
    return fetchAPI(`products/${id}`, {
      method: "DELETE",
    })
  },
}

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    return fetchAPI("categories")
  },

  getById: async (id: string) => {
    return fetchAPI(`categories/${id}`)
  },
}

// Orders API
export const ordersAPI = {
  getAll: async () => {
    return fetchAPI("orders")
  },

  getById: async (id: string) => {
    return fetchAPI(`orders/${id}`)
  },

  create: async (orderData: any) => {
    return fetchAPI("orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  },

  updateStatus: async (id: string, status: string) => {
    return fetchAPI(`orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  },
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchAPI("auth", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (userData: any) => {
    return fetchAPI("auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  me: async (token: string) => {
    return fetchAPI("auth/me", withAuth({}, token))
  },
}

// Reviews API
export const reviewsAPI = {
  getByProduct: async (productId: number) => {
    return fetchAPI(`reviews?productId=${productId}`)
  },
  create: async (reviewData: any) => {
    return fetchAPI("reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  },
  markHelpful: async (id: number) => {
    return fetchAPI(`reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify({ action: "helpful" }),
    })
  },
}

// Cart API (auth required)
export const cartAPI = {
  get: async (token: string) => {
    return fetchAPI("cart", withAuth({}, token))
  },
  add: async (productId: number, quantity: number, token: string) => {
    return fetchAPI("cart", withAuth({
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }, token))
  },
  update: async (productId: number, quantity: number, token: string) => {
    return fetchAPI("cart", withAuth({
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    }, token))
  },
  remove: async (productId: number, token: string) => {
    // Backend supports DELETE with productId via query string
    return fetchAPI(`cart?productId=${productId}`, withAuth({
      method: "DELETE",
    }, token))
  },
  clear: async (token: string) => {
    return fetchAPI("cart", withAuth({ method: "DELETE" }, token))
  },
}

// Checkout API (auth required)
export const checkoutAPI = {
  createFromCart: async (token: string) => {
    return fetchAPI("checkout", withAuth({ method: "POST" }, token))
  },
}

// Payment Receipts API
export const receiptsAPI = {
  list: async (token: string, opts?: { orderId?: string }) => {
    const q = opts?.orderId ? `?orderId=${encodeURIComponent(opts.orderId)}` : ""
    return fetchAPI(`receipts${q}`, withAuth({}, token))
  },
  getById: async (id: number, token: string) => {
    return fetchAPI(`receipts/${id}`, withAuth({}, token))
  },
  upload: async (orderId: string, file: File | Blob, token: string) => {
    const form = new FormData()
    form.append("orderId", orderId)
    form.append("file", file as any)
    return fetchAPI("receipts", withAuth({ method: "POST", body: form }, token))
  },
  adminUpdateStatus: async (id: number, status: "approved" | "rejected", notes: string | null, token: string) => {
    return fetchAPI(`receipts/${id}`, withAuth({
      method: "PUT",
      body: JSON.stringify({ status, notes }),
    }, token))
  },
}

// Users API (admin only where applicable)
export const usersAPI = {
  list: async (token: string) => {
    return fetchAPI("users", withAuth({}, token))
  },
  updateRole: async (id: number, role: "customer" | "admin", token: string) => {
    return fetchAPI(`users/${id}`, withAuth({
      method: "PUT",
      body: JSON.stringify({ role }),
    }, token))
  },
}
