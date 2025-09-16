import { productsAPI } from "@/lib/api"
import { ProductCarousel } from "@/components/product-carousel"

export async function HouseholdItemsSection() {
  const householdItems = await productsAPI.getAll("household-items")
  return <ProductCarousel title="Household Items" products={householdItems} viewAllHref="/products?category=household-items" />
}
