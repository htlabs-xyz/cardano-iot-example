"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import type { Product } from "@/lib/data"
import { toast } from "sonner"

interface ProductCardProps {
    product: Product
    onAddToCart: (productId: string) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [showBuyDialog, setShowBuyDialog] = useState(false)
    const isOutOfStock = product.stock === 0

    const handleAddToCart = () => {
        if (isOutOfStock) {
            toast("Out of stock", {
                description: `Sorry, "${product.name}" is currently out of stock.`
            })
            return
        }

        onAddToCart(product.id)
        // No notification when adding to cart
    }

    const handleBuyNow = () => {
        if (isOutOfStock) {
            toast("Out of stock", {
                description: `Sorry, "${product.name}" is currently out of stock.`
            })
            return
        }

        setShowBuyDialog(true)
    }

    return (
        <>
            <Card className="h-full flex flex-col">
                <CardHeader className="p-4 pb-0">
                    <div className="relative aspect-square w-full overflow-hidden rounded-md">
                        <Image
                            src={product.image || `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(product.name)}`}
                            alt={product.name}
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
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isOutOfStock ? "Currently unavailable" : `${product.stock} available`}
                    </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 gap-2">
                    <Button variant="outline" className="w-1/2" onClick={handleAddToCart} disabled={isOutOfStock}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                    </Button>
                    <Button className="w-1/2" onClick={handleBuyNow} disabled={isOutOfStock}>
                        Buy Now
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Purchase</DialogTitle>
                        <DialogDescription>You are about to purchase:</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-4 py-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-md">
                            <Image
                                src={product.image || `/placeholder.svg?height=80&width=80&text=${encodeURIComponent(product.name)}`}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Quantity: 1</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                // Handle purchase logic here
                                setShowBuyDialog(false)
                                toast("Purchase complete", {
                                    description: `You have purchased "${product.name}".`
                                })
                            }}
                        >
                            Confirm Purchase
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

