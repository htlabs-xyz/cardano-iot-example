"use client"

import { useEffect, useState } from "react"

import CartPanel from "@/components/cart-panel"
import ProductGrid from "@/components/product-grid"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import deviceApiRequest from "../api/device.api"
import productApiRequest from "../api/product.api"
import { Device } from "../types/device.type"
import { ProductOrderDetails } from "../types/order.type"
import { Product } from "../types/product.type"
import { SidebarInset, SidebarProvider } from "./ui/sidebar"

export default function VendingMachineUI() {
    // Create a deep copy of machines to allow modifying stock
    const [vendingDevices, setVendingDevices] = useState<Device[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<Device | undefined>(undefined);
    const [productData, setProductData] = useState<Product[]>([]);

    const [cart, setCart] = useState<ProductOrderDetails[]>([])


    useEffect(() => {
        const fetchDevices = async () => {
            try {
                //setIsLoadingDevices(true);
                const response = await deviceApiRequest.getList();
                const devices = response.data ?? [];
                setVendingDevices(devices);
                if (devices.length > 0 && !selectedDevice) {
                    setSelectedDevice(devices[0]); // Set default sensor
                }
                if (devices.length === 0) { throw new Error(); }
            } catch {
                toast("Error fetching data", {
                    description: "Cannot get devices info",
                    action: {
                        label: "Retry",
                        onClick: () => fetchDevices(),
                    },
                });
            }
        };
        fetchDevices();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!vendingDevices.length || !selectedDevice) return;
        const fetchData = async () => {
            try {
                const device = vendingDevices.find((s) => s.device_id === selectedDevice.device_id) || vendingDevices[0];
                const dataApi = await productApiRequest.getListProductByDevice(device.device_id);
                if (!dataApi || !dataApi.data || !dataApi.data.products) throw new Error();
                const productList = dataApi.data.products;
                setProductData(productList);

            } catch (error) {
                console.error("Failed to fetch temperature data:", error);
                toast("Error", { description: "Failed to load temperature data" });
            }
        }
        fetchData()
    }, [vendingDevices, selectedDevice])

    const addToCart = (productId: number) => {
        const product = productData.find((p) => p.product_id === productId)
        if (!product) return

        if (product.product_quantity <= 0) {
            return // The notification is handled in the product card
        }

        // Update the product stock
        setProductData((prevProducts) => {
            return prevProducts.map(product => {
                if (product.product_id === productId) {
                    return {
                        ...product,
                        product_quantity: product.product_quantity - 1
                    }
                }
                return product
            })
        })

        // Update the cart
        setCart((prev) => {
            const existingItem = prev.find((item) => item.product_id === productId)
            if (existingItem) {
                return prev.map((item) => (item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item))
            } else {
                return [...prev, { product_id: productId, quantity: 1 }]
            }
        })
    }

    const removeFromCart = (productId: number) => {
        // Get the quantity being removed
        const itemToRemove = cart.find((item) => item.product_id === productId)
        if (!itemToRemove) return

        // Return the stock to the product data
        setProductData((prevProducts) => {
            return prevProducts.map(product => {
                if (product.product_id === productId) {
                    return {
                        ...product,
                        product_quantity: product.product_quantity + itemToRemove.quantity
                    }
                }
                return product
            })
        })

        // Remove from cart
        setCart((prev) => prev.filter((item) => item.product_id !== productId))
    }

    const updateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId)
            return
        }

        const currentItem = cart.find((item) => item.product_id === productId)
        if (!currentItem) return

        const product = productData.find((p) => p.product_id === productId)
        if (!product) return

        const currentQuantity = currentItem.quantity
        const quantityDifference = newQuantity - currentQuantity

        // Check if we have enough stock to increase
        if (quantityDifference > 0) {
            if (product.product_quantity < quantityDifference) {
                // Silently fail if not enough stock - disable the button instead
                return
            }

            // Decrease the stock by the difference
            setProductData((prevProducts) => {
                return prevProducts.map(p => {
                    if (p.product_id === productId) {
                        return {
                            ...p,
                            product_quantity: p.product_quantity - quantityDifference
                        }
                    }
                    return p
                })
            })
        } else if (quantityDifference < 0) {
            // Increase the stock by the absolute difference
            setProductData((prevProducts) => {
                return prevProducts.map(p => {
                    if (p.product_id === productId) {
                        return {
                            ...p,
                            product_quantity: p.product_quantity + Math.abs(quantityDifference)
                        }
                    }
                    return p
                })
            })
        }

        // Update cart quantity
        setCart((prev) => prev.map((item) => (item.product_id === productId ? { ...item, quantity: newQuantity } : item)))
    }

    // Handle device change - return all cart items to stock
    const handleDeviceChange = (deviceIdString: string) => {
        const deviceId = Number.parseInt(deviceIdString)

        // Clear the cart and update selected device
        setCart([])
        const newDevice = vendingDevices.find((d) => d.device_id === deviceId)
        setSelectedDevice(newDevice)

        if (newDevice) {
            toast("Device changed", {
                description: `Switched to ${newDevice.device_name} at ${newDevice.device_location}.`
            })
        }
    }

    // Handle checkout - remove items from stock permanently
    const handleCheckout = () => {
        if (cart.length === 0) {
            toast("Empty cart", {
                description: "Your cart is empty. Add some products before checking out.",
            })
            return
        }

        // Clear the cart but don't return items to stock
        setCart([])
        toast("Purchase complete", {
            description: "Thank you for your purchase!",
        })
    }

    return (
        <SidebarProvider>
            <SidebarInset>
                <div className="p-4 border-b sticky top-0 bg-background z-10">
                    <h2 className="text-lg font-semibold flex items-center">
                        IOT3 - Vending Machine
                    </h2>
                </div>
                <div className="p-4">
                    <Select value={selectedDevice?.device_id.toString()} onValueChange={handleDeviceChange}>
                        <SelectTrigger className="w-full max-w-md mb-3">
                            <SelectValue placeholder="Select a machine" />
                        </SelectTrigger>
                        <SelectContent>
                            {vendingDevices.map((machine) => (
                                <SelectItem key={machine.device_id} value={machine.device_id.toString()}>
                                    {machine.device_name} - {machine.device_location}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <ProductGrid products={productData} onAddToCart={addToCart} />
                </div>
            </SidebarInset>
            <CartPanel
                cart={cart}
                device={selectedDevice}
                products={productData}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
            />
        </SidebarProvider>
    )
}

