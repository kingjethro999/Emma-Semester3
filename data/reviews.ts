export interface Review {
  id: number
  productId: number
  userName: string
  rating: number
  comment: string
  date: string
  helpful: number
  verified: boolean
}

export const reviews: Review[] = [
  {
    id: 1,
    productId: 1,
    userName: "Chioma A.",
    rating: 5,
    comment: "The Golden Penny Macaroni is excellent quality. Cooks perfectly every time and tastes great!",
    date: "2025-05-10",
    helpful: 12,
    verified: true,
  },
  {
    id: 2,
    productId: 1,
    userName: "Emmanuel O.",
    rating: 4,
    comment: "Good product, but I wish the packaging was resealable. Otherwise, great taste and value.",
    date: "2025-05-05",
    helpful: 8,
    verified: true,
  },
  {
    id: 3,
    productId: 1,
    userName: "Blessing I.",
    rating: 5,
    comment: "My family loves this macaroni. It's now our regular brand for Sunday dinner.",
    date: "2025-04-28",
    helpful: 5,
    verified: true,
  },
  {
    id: 4,
    productId: 2,
    userName: "Tunde F.",
    rating: 4,
    comment: "Mai Kwabo pasta is good quality for the price. Cooks well and doesn't get too soft.",
    date: "2025-05-12",
    helpful: 3,
    verified: true,
  },
  {
    id: 5,
    productId: 2,
    userName: "Amina B.",
    rating: 3,
    comment: "Average pasta. Nothing special but does the job. I prefer Golden Penny.",
    date: "2025-05-01",
    helpful: 1,
    verified: false,
  },
  {
    id: 6,
    productId: 6,
    userName: "Oluwaseun D.",
    rating: 5,
    comment: "Milo is always a winner! These sachets are so convenient for my kids' breakfast.",
    date: "2025-05-08",
    helpful: 15,
    verified: true,
  },
  {
    id: 7,
    productId: 6,
    userName: "Ngozi E.",
    rating: 5,
    comment: "Perfect size for travel. I always carry a few sachets when I'm on the go.",
    date: "2025-04-25",
    helpful: 7,
    verified: true,
  },
  {
    id: 8,
    productId: 3,
    userName: "Ibrahim M.",
    rating: 4,
    comment: "Maggi Star seasoning adds great flavor to my soups. Good value for the quantity.",
    date: "2025-05-11",
    helpful: 9,
    verified: true,
  },
]

// Function to get reviews for a specific product
export function getProductReviews(productId: number): Review[] {
  return reviews.filter((review) => review.productId === productId)
}

// Function to calculate average rating for a product
export function getAverageRating(productId: number): number {
  const productReviews = getProductReviews(productId)
  if (productReviews.length === 0) return 0

  const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
  return Number.parseFloat((totalRating / productReviews.length).toFixed(1))
}

// Function to get rating distribution for a product
export function getRatingDistribution(productId: number): Record<number, number> {
  const productReviews = getProductReviews(productId)
  const distribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }

  productReviews.forEach((review) => {
    distribution[review.rating]++
  })

  return distribution
}
