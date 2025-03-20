"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import ProductCard from "@/components/product-card"
import type { Machine } from "@/lib/data"

interface ProductGridProps {
    machine: Machine
    onAddToCart: (productId: string) => void
}

export default function ProductGrid({ machine, onAddToCart }: ProductGridProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredProducts = machine.products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No products found. Try a different search term.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                    ))}
                </div>
            )}
        </div>
    )
}

