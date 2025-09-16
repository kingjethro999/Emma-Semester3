import { productsAPI } from "@/lib/api"
import { ProductCarousel } from "@/components/product-carousel"

export async function NewArrivalsSection() {
  const items = await productsAPI.getAll("all")
  const newProducts = (items || []).filter((p: any) => p.isNew)
  return <ProductCarousel title="New Arrivals" products={newProducts} viewAllHref="/products?category=all" />
}
