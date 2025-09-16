import { productsAPI } from "@/lib/api"
import { ProductCarousel } from "@/components/product-carousel"

export async function CannedFoodsSection() {
  const cannedFoods = await productsAPI.getAll("canned-foods")
  return <ProductCarousel title="Canned Foods" products={cannedFoods} viewAllHref="/products?category=canned-foods" />
}
