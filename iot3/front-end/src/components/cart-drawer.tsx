"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import type { Machine } from "@/lib/data"

interface CartDrawerProps {
    open: boolean
    onClose: () => void
    cart: { id: string; quantity: number }[]
    machine: Machine
    onUpdateQuantity: (productId: string, quantity: number) => void
    onRemoveItem: (productId: string) => void
    onCheckout: () => void
}

export default function CartDrawer({
    open,
    onClose,
    cart,
    machine,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
}: CartDrawerProps) {
    const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)

    const cartItems = cart
        .map((item) => {
            const product = machine.products.find((p) => p.id === item.id)
            return {
                ...item,
                product,
            }
        })
        .filter((item) => item.product !== undefined)

    const totalPrice = cartItems.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity
    }, 0)

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast("Empty cart", {
                description: "Your cart is empty. Add some products before checking out."
            })
            return
        }

        setCheckoutDialogOpen(true)
    }

    const handleConfirmCheckout = () => {
        // Handle checkout logic here
        setCheckoutDialogOpen(false)
        onCheckout()
    }

    const handleIncreaseQuantity = (productId: string, currentQuantity: number) => {
        // Check if we have stock available without showing notification
        const product = machine.products.find((p) => p.id === productId)
        if (product && product.stock <= 0) {
            return // Silently fail if no stock
        }

        onUpdateQuantity(productId, currentQuantity + 1)
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onClose}>
                <SheetContent className="w-full sm:max-w-md flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="flex items-center">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Your Cart
                        </SheetTitle>
                    </SheetHeader>

                    {cartItems.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="font-medium text-lg">Your cart is empty</h3>
                            <p className="text-muted-foreground mt-1">Add some products to your cart to see them here.</p>
                            <Button variant="outline" className="mt-6" onClick={onClose}>
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-grow overflow-auto py-4">
                                <ul className="space-y-4">
                                    {cartItems.map((item) => (
                                        <li key={item.id} className="flex gap-4 border-b pb-4">
                                            <div className="relative h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
                                                <Image
                                                    src={
                                                        item.product?.image ||
                                                        `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(item.product?.name || "")}`
                                                    }
                                                    alt={item.product?.name || ""}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-medium truncate">{item.product?.name}</h4>
                                                <p className="text-primary font-bold">${item.product?.price.toFixed(2)}</p>
                                                <div className="flex items-center mt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="mx-2 min-w-8 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                                                        disabled={item.product?.stock === 0}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 flex-shrink-0 self-start"
                                                onClick={() => onRemoveItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <SheetFooter className="border-t pt-4">
                                <div className="w-full space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Total:</span>
                                        <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <Button className="w-full" onClick={handleCheckout}>
                                        Checkout
                                    </Button>
                                </div>
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Order</DialogTitle>
                        <DialogDescription>Please review your order before confirming.</DialogDescription>
                    </DialogHeader>

                    <div className="py-4 max-h-[60vh] overflow-auto">
                        <ul className="space-y-4">
                            {cartItems.map((item) => (
                                <li key={item.id} className="flex gap-4">
                                    <div className="relative h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
                                        <Image
                                            src={
                                                item.product?.image ||
                                                `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(item.product?.name || "")}`
                                            }
                                            alt={item.product?.name || ""}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-medium">{item.product?.name}</h4>
                                        <div className="flex justify-between">
                                            <p>
                                                ${item.product?.price.toFixed(2)} × {item.quantity}
                                            </p>
                                            <p className="font-bold">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between items-center mt-6 pt-4 border-t">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmCheckout}>Confirm Order</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

