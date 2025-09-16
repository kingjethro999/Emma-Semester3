import { productsAPI } from "@/lib/api"
import { ProductCarousel } from "@/components/product-carousel"

export async function BeveragesSection() {
  const beverages = await productsAPI.getAll("beverages")

  return <ProductCarousel title="Beverages" products={beverages} viewAllHref="/products?category=beverages" />
}
