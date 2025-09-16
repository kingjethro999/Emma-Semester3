"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/ui/star-rating"
import { ReviewForm } from "@/components/review-form"
import { ThumbsUp, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { reviewsAPI } from "@/lib/api"

interface ProductReviewsProps {
  productId: number
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "highest" | "lowest">("recent")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  interface Review {
    id: number
    productId: number
    userName: string
    rating: number
    comment: string
    date: string
    helpful: number
    verified?: boolean
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewsAPI.getByProduct(productId)
      // Normalize fields if backend uses different casing
      const normalized = (Array.isArray(data) ? data : []).map((r: any) => ({
        id: Number(r.id),
        productId: Number(r.productId ?? r.product_id ?? productId),
        userName: r.userName ?? r.user_name ?? "Anonymous",
        rating: Number(r.rating ?? 0),
        comment: r.comment ?? "",
        date: r.date ?? new Date().toISOString().split("T")[0],
        helpful: Number(r.helpful ?? 0),
        verified: Boolean(r.verified ?? false),
      }))
      setReviews(normalized)
      setError("")
    } catch (err: any) {
      console.error("Failed to fetch reviews", err)
      setError("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const totalReviews = reviews.length
  const averageRating = totalReviews
    ? Math.round(((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews) + Number.EPSILON) * 10) / 10
    : 0
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach((r) => {
    const key = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5
    ratingDistribution[key] = (ratingDistribution[key] || 0) + 1
  })

  const handleHelpful = (reviewId: number) => {
    if (helpfulReviews.includes(reviewId)) return

    setHelpfulReviews([...helpfulReviews, reviewId])

    // Optimistic UI update
    setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review)))

    reviewsAPI
      .markHelpful(reviewId)
      .then(() => {
        toast({ title: "Thank you!", description: "You marked this review as helpful." })
      })
      .catch((err) => {
        console.error("Failed to mark helpful", err)
        // Revert optimistic update
        setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, helpful: Math.max(0, review.helpful - 1) } : review)))
        setHelpfulReviews(helpfulReviews.filter((id) => id !== reviewId))
        toast({ title: "Action failed", description: "Please try again later.", variant: "destructive" })
      })
  }

  const handleReviewSubmitted = () => {
    setShowReviewForm(false)
    // Refresh reviews from server
    fetchReviews()
  }

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case "helpful":
        return b.helpful - a.helpful
      case "highest":
        return b.rating - a.rating
      case "lowest":
        return a.rating - b.rating
      default:
        return 0
    }
  })

  if (loading) {
    return <div className="text-center py-6">Loading reviews...</div>
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Rating Summary */}
        <div>
          <div className="flex items=end gap-4 mb-4">
            <div className="text-center">
              <div className="text-5xl font-bold">{averageRating}</div>
              <StarRating rating={averageRating} size="lg" className="mt-2" />
              <div className="text-sm text-gray-500 mt-1">{totalReviews} reviews</div>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star]
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1 w-12">
                      <span>{star}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="w-8 text-xs text-gray-500">{count}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <Button onClick={() => setShowReviewForm(!showReviewForm)} className="w-full bg-green-600 hover:bg-green-700">
            {showReviewForm ? "Cancel" : "Write a Review"}
          </Button>
        </div>

        {/* Review Form */}
        <div>{showReviewForm && <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />}</div>
      </div>

      {/* Reviews List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              className="text-sm border rounded p-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        </div>

        {sortedReviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="font-medium">{review.userName}</span>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(review.date).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-gray-700">{review.comment}</p>

                <div className="mt-3 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => handleHelpful(review.id)}
                    disabled={helpfulReviews.includes(review.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {helpfulReviews.includes(review.id) ? "Marked as helpful" : "Helpful"}
                    <span className="ml-1">({review.helpful})</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper component for the star icon
function Star({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

