import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center">About Nwigwe Loveth Ginikiwa</h1>

      <div className="mb-4 flex justify-start">
        <Button variant="outline" asChild className="flex items-center">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Breadcrumb
        items={[
          { label: "Home", href: "/", active: false },
          { label: "About", href: "/about", active: true },
        ]}
        className="mb-8"
      />

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <Image
            src="/images/store-front.png"
            alt="Nwigwe Loveth Ginikiwa Store"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="mb-4">
            Nwigwe Loveth Ginikiwa was established in 2023 with a simple mission: to provide high-quality groceries and
            household items at affordable prices to our community.
          </p>
          <p className="mb-4">
            What started as a small family business has grown into a trusted neighborhood store that serves hundreds of
            customers daily. We take pride in our carefully selected products and our commitment to customer
            satisfaction.
          </p>
          <p className="mb-4">
            Our store offers a wide range of products including beverages, snacks, packaged foods, and household
            essentials. We work directly with suppliers to ensure the freshest products at the best prices.
          </p>
        </div>
      </div>

      <div className="bg-green-50 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Quality</h3>
            <p>
              We carefully select every product in our store to ensure we offer only the best quality items to our
              customers. We regularly review our inventory and work with trusted suppliers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Community</h3>
            <p>
              We're proud to be part of this community and strive to give back whenever possible. We support local
              initiatives and create a welcoming environment for all our customers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Service</h3>
            <p>
              Customer satisfaction is our top priority. Our friendly staff is always ready to assist you and make your
              shopping experience pleasant and convenient.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Visit Our Store Today</h2>
        <p className="mb-6">
          We invite you to visit our store and experience our quality products and friendly service firsthand.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/products">Shop Now</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
