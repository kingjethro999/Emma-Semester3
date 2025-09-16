"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth_token") || ""
    const raw = localStorage.getItem("auth_user")
    if (!token || !raw) {
      router.push("/login")
      return
    }
    try {
      const u = JSON.parse(raw)
      // prevent viewing others profile client-side
      const requested = String(params?.id || "")
      if (requested && String(u.id) !== requested) {
        router.replace(`/profile/${u.id}`)
        return
      }
      setUser(u)
    } catch {}
    setLoading(false)
  }, [params, router])

  if (loading) return null
  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="space-y-2">
        <div><span className="font-medium">Name:</span> {user.name}</div>
        <div><span className="font-medium">Email:</span> {user.email}</div>
        <div><span className="font-medium">Role:</span> {user.role}</div>
      </div>
    </div>
  )
}


