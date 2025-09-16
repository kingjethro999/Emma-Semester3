import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CategoryList } from "@/components/category-list"
import { NewArrivalsSection } from "@/components/new-arrivals-section"
import { CannedFoodsSection } from "@/components/canned-foods-section"
import { BeveragesSection } from "@/components/beverages-section"
import { HouseholdItemsSection } from "@/components/household-items-section"
// Import the new CleaningProductsSection component
import { CleaningProductsSection } from "@/components/cleaning-products-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-green-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Fresh Groceries Delivered to Your Door</h1>
                <p className="text-lg mb-6">
                  Shop our wide selection of groceries, snacks, and beverages at affordable prices.
                </p>
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Link href="/products">Shop Now</Link>
                </Button>
              </div>
              <div className="md:w-1/2">
                <Image
                  src="/images/store-front.png"
                  alt="Store shelves with various products"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
            <CategoryList />
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <NewArrivalsSection />
          </div>
        </section>

        {/* Beverages Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <BeveragesSection />
          </div>
        </section>

        {/* Canned Foods Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <CannedFoodsSection />
          </div>
        </section>

        {/* Household Items Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <HouseholdItemsSection />
          </div>
        </section>

        {/* Cleaning Products Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <CleaningProductsSection />
          </div>
        </section>
      </main>

      <footer className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Nwigwe Loveth Ginikiwa</h3>
              <p>Your one-stop shop for all grocery needs.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:underline">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:underline">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p>Email: nwigweloveth55.com</p>
              <p>Phone: +234 8083417458</p>
            </div>
          </div>
          <div className="border-t border-green-700 mt-8 pt-4 text-center">
            <p>&copy; {new Date().getFullYear()} Nwigwe Loveth Ginikiwa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
