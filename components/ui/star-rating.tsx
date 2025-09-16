import { Star, StarHalf } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  max?: number
  size?: "sm" | "md" | "lg"
  className?: string
  showValue?: boolean
}

export function StarRating({ rating, max = 5, size = "md", className, showValue = false }: StarRatingProps) {
  // Calculate full and half stars
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  // Determine star size
  const starSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex">
        {[...Array(max)].map((_, i) => {
          if (i < fullStars) {
            // Full star
            return <Star key={i} className={cn("fill-yellow-400 text-yellow-400", starSize[size])} />
          } else if (i === fullStars && hasHalfStar) {
            // Half star
            return <StarHalf key={i} className={cn("fill-yellow-400 text-yellow-400", starSize[size])} />
          } else {
            // Empty star
            return <Star key={i} className={cn("text-gray-300", starSize[size])} />
          }
        })}
      </div>

      {showValue && <span className="ml-2 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>}
    </div>
  )
}
