"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await authAPI.login(email, password)
      if (res?.token && res?.user) {
        localStorage.setItem("auth_token", res.token)
        localStorage.setItem("auth_user", JSON.stringify(res.user))
        // Also set cookie for middleware
        document.cookie = `auth_token=${res.token}; path=/; max-age=${60 * 60 * 24 * 7}`
        router.push("/")
      } else {
        setError("Invalid response from server")
      }
    } catch (err: any) {
      setError(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  )
}


