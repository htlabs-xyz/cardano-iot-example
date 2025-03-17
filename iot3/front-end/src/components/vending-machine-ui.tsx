"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ProductGrid from "@/components/product-grid"
import CartDrawer from "@/components/cart-drawer"
import { machines as initialMachines, type Machine, type Product } from "@/lib/data"
import { toast } from "sonner"

export default function VendingMachineUI() {
    // Create a deep copy of machines to allow modifying stock
    const [machines, setMachines] = useState<Machine[]>(JSON.parse(JSON.stringify(initialMachines)))
    const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0].id)
    const [cart, setCart] = useState<{ id: string; quantity: number }[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)

    // Get the currently selected machine
    const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0]

    // Function to get available stock (accounting for cart quantities)
    const getAvailableStock = (productId: string) => {
        const product = selectedMachine.products.find((p) => p.id === productId)
        if (!product) return 0
        return product.stock
    }

    const addToCart = (productId: string) => {
        const product = selectedMachine.products.find((p) => p.id === productId)
        if (!product) return

        if (product.stock <= 0) {
            return // The notification is now handled in the product card
        }

        // Update the product stock
        setMachines((prevMachines) => {
            const newMachines = JSON.parse(JSON.stringify(prevMachines))
            const machine = newMachines.find((m: Machine) => m.id === selectedMachineId)
            if (machine) {
                const productToUpdate = machine.products.find((p: Product) => p.id === productId)
                if (productToUpdate) {
                    productToUpdate.stock -= 1
                }
            }
            return newMachines
        })

        // Update the cart
        setCart((prev) => {
            const existingItem = prev.find((item) => item.id === productId)
            if (existingItem) {
                return prev.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
            } else {
                return [...prev, { id: productId, quantity: 1 }]
            }
        })
    }

    const removeFromCart = (productId: string) => {
        // Get the quantity being removed
        const itemToRemove = cart.find((item) => item.id === productId)
        if (!itemToRemove) return

        // Return the stock to the machine
        setMachines((prevMachines) => {
            const newMachines = JSON.parse(JSON.stringify(prevMachines))
            const machine = newMachines.find((m: Machine) => m.id === selectedMachineId)
            if (machine) {
                const productToUpdate = machine.products.find((p: Product) => p.id === productId)
                if (productToUpdate) {
                    productToUpdate.stock += itemToRemove.quantity
                }
            }
            return newMachines
        })

        // Remove from cart
        setCart((prev) => prev.filter((item) => item.id !== productId))
    }

    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId)
            return
        }

        const currentItem = cart.find((item) => item.id === productId)
        if (!currentItem) return

        const product = selectedMachine.products.find((p) => p.id === productId)
        if (!product) return

        const currentQuantity = currentItem.quantity
        const quantityDifference = newQuantity - currentQuantity

        // Check if we have enough stock to increase
        if (quantityDifference > 0) {
            const availableStock = getAvailableStock(productId)

            if (availableStock < quantityDifference) {
                // Silently fail if not enough stock - disable the button instead
                return
            }

            // Decrease the stock by the difference
            setMachines((prevMachines) => {
                const newMachines = JSON.parse(JSON.stringify(prevMachines))
                const machine = newMachines.find((m: Machine) => m.id === selectedMachineId)
                if (machine) {
                    const productToUpdate = machine.products.find((p: Product) => p.id === productId)
                    if (productToUpdate) {
                        productToUpdate.stock -= quantityDifference
                    }
                }
                return newMachines
            })
        } else if (quantityDifference < 0) {
            // Increase the stock by the absolute difference
            setMachines((prevMachines) => {
                const newMachines = JSON.parse(JSON.stringify(prevMachines))
                const machine = newMachines.find((m: Machine) => m.id === selectedMachineId)
                if (machine) {
                    const productToUpdate = machine.products.find((p: Product) => p.id === productId)
                    if (productToUpdate) {
                        productToUpdate.stock += Math.abs(quantityDifference)
                    }
                }
                return newMachines
            })
        }

        // Update cart quantity
        setCart((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
    }

    // Handle machine change - return all cart items to stock
    const handleMachineChange = (machineId: string) => {
        // Return all cart items to their respective machines
        setMachines((prevMachines) => {
            const newMachines = JSON.parse(JSON.stringify(prevMachines))

            // Find the current machine and return items to stock
            const currentMachine = newMachines.find((m: Machine) => m.id === selectedMachineId)
            if (currentMachine) {
                cart.forEach((item) => {
                    const productToUpdate = currentMachine.products.find((p: Product) => p.id === item.id)
                    if (productToUpdate) {
                        productToUpdate.stock += item.quantity
                    }
                })
            }

            return newMachines
        })

        // Clear the cart and update selected machine
        setCart([])
        setSelectedMachineId(machineId)

        const newMachine = machines.find((m) => m.id === machineId)
        if (newMachine) {
            toast("Machine changed", {
                description: `Switched to ${newMachine.name} at ${newMachine.location}.`
            })
        }
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    // Handle checkout - remove items from stock permanently
    const handleCheckout = () => {
        // Clear the cart but don't return items to stock
        setCart([])
        setIsCartOpen(false)

        toast("Purchase complete", {
            description: "Thank you for your purchase!"
        })
    }

    return (
        <div className="space-y-6 min-h-screen pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto">
                    <Select value={selectedMachineId} onValueChange={handleMachineChange}>
                        <SelectTrigger className="w-full sm:w-[300px]">
                            <SelectValue placeholder="Select a machine" />
                        </SelectTrigger>
                        <SelectContent>
                            {machines.map((machine) => (
                                <SelectItem key={machine.id} value={machine.id}>
                                    {machine.name} - {machine.location}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart
                    {totalItems > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {totalItems}
                        </Badge>
                    )}
                </Button>
            </div>

            <ProductGrid machine={selectedMachine} onAddToCart={addToCart} />

            <div className="fixed bottom-0 left-0 right-0 z-10">
                <div className="bg-background border-t p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? "s" : ""} in cart`}
                        </span>
                    </div>
                    <Button onClick={() => setIsCartOpen(true)} disabled={totalItems === 0}>
                        View Cart
                    </Button>
                </div>
            </div>

            <CartDrawer
                open={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                machine={selectedMachine}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
            />
        </div>
    )
}

