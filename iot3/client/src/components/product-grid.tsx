"use client"

import { Search } from "lucide-react"
import { useEffect, useState } from "react"

import ProductCard from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Product } from "../types/product.type"

interface ProductGridProps {
    products: Product[]
    onAddToCart: (productId: number) => void
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])


    useEffect(() => {
        const filterList = products.filter((product) =>
            product.product_name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setFilteredProducts(filterList);
    }, [products, searchQuery])

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
                        <ProductCard key={product.product_id} product={product} onAddToCart={onAddToCart} />
                    ))}
                </div>
            )}
        </div>
    )
}

