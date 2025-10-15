"use client"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { toast } from "sonner"
import { Product } from "../types/product.type"

interface ProductCardProps {
    product: Product
    onAddToCart: (productId: number) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const isOutOfStock = product.product_quantity === 0

    const handleAddToCart = () => {
        if (isOutOfStock) {
            toast("Out of stock", {
                description: `Sorry, "${product.product_quantity}" is currently out of stock.`,
            })
            return
        }

        onAddToCart(product.product_id)
        // No notification when adding to cart
    }

    return (
        <>
            <Card className="h-full flex flex-col">
                <CardHeader className="p-4 pb-0">
                    <div className="relative aspect-square w-full overflow-hidden rounded-md">
                        <Image
                            src={product.product_image || `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(product.product_name)}`}
                            alt={product.product_name}
                            fill
                            className="object-cover"
                        />
                        {isOutOfStock && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <p className="text-lg font-bold text-destructive">Out of Stock</p>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                    <h3 className="font-semibold text-lg">{product.product_name}</h3>
                    <p className="text-primary font-semibold">Price:  {product.product_price} (₳)</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isOutOfStock ? "Currently unavailable" : `${product.product_quantity} available`}
                    </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Button variant="default" className="w-full" onClick={handleAddToCart} disabled={isOutOfStock}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}

