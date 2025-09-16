import { productsAPI } from "@/lib/api"
import { ProductCarousel } from "@/components/product-carousel"

export async function CleaningProductsSection() {
  const items = await productsAPI.getAll("household-items")
  const cleaningProducts = items.filter((product: any) => {
    const name = String(product.name || "").toLowerCase()
    return name.includes("detergent") || name.includes("cleaner") || name.includes("bleach") || name.includes("washing")
  })

  return <ProductCarousel title="Cleaning Essentials" products={cleaningProducts} viewAllHref="/categories/household-items" />
}
