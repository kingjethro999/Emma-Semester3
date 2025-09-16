"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Star } from "lucide-react"
import { reviewsAPI } from "@/lib/api"

interface ReviewFormProps {
  productId: number
  onReviewSubmitted: () => void
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [name, setName] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting your review.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await reviewsAPI.create({
        productId,
        userName: name,
        rating,
        comment,
      })

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback! Your review has been submitted.",
      })

      // Reset form
      setRating(0)
      setName("")
      setComment("")

      // Notify parent component to refresh
      onReviewSubmitted()
    } catch (err: any) {
      console.error("Failed to submit review", err)
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`h-6 w-6 ${
                  (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Your Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Your Review
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          required
        />
      </div>

      <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}
