"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useQRCode } from 'next-qrcode';
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import orderApiRequest from "../api/order.api";
import { copyToClipboard, truncateText } from "../lib/utils";
import { Device } from "../types/device.type";
import { ProductOrder, ProductOrderDetails } from "../types/order.type";
import { Product } from "../types/product.type";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Sidebar, SidebarContent } from "./ui/sidebar";
import envConfig from "@/config";

interface CartPanelProps extends React.ComponentProps<typeof Sidebar> {
    cart: ProductOrderDetails[]
    products: Product[],
    device: Device | undefined,
    onUpdateQuantity: (productId: number, quantity: number) => void
    onRemoveItem: (productId: number) => void
    onCheckout: () => void
}
const durationInSeconds = envConfig.NEXT_PUBLIC_PAYMENT_DURATION_SECONDS;
const perSecondToCallAPI = envConfig.NEXT_PUBLIC_PAYMENT_CHECK_INTERVAL_SECONDS;
export default function CartPanel({ cart, products, device, onUpdateQuantity, onRemoveItem, onCheckout }: CartPanelProps) {
    const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [checkTXDialogOpen, setCheckTXDialogOpen] = useState(false)
    const [remainingSeconds, setRemainingSeconds] = useState(durationInSeconds);
    const cartItems = cart
        .map((item) => {
            const product = products.find((p) => p.product_id === item.product_id)
            return {
                ...item,
                product,
            }
        })
        .filter((item) => item.product !== undefined)

    const totalPrice = cartItems.reduce((sum, item) => {
        return sum + (item.product?.product_price || 0) * item.quantity
    }, 0)
    const { Image: QRImage } = useQRCode();

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        let apiInterval: NodeJS.Timeout | undefined;
        if (checkTXDialogOpen) {
            setRemainingSeconds(durationInSeconds);
            interval = setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setCheckTXDialogOpen(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            const order: ProductOrder = {
                device_id: device?.device_id ?? 0,
                order_product: cart
            }
            apiInterval = setInterval(async () => {
                try {
                    const response = await orderApiRequest.orderProduct(order);
                    const isLastInterval = remainingSeconds <= perSecondToCallAPI;
                    if (isLastInterval && response.status === false) {
                        setCheckTXDialogOpen(false);
                        toast("Can not find the transaction", {
                            description: `Please try to check again!`,
                        })
                    }
                    else if (response.status === true) {
                        setCheckTXDialogOpen(false);
                        toast("Transaction finished", {
                            description: `Thanks you`,
                        });
                        onCheckout()
                    }
                } catch (error) {
                    console.error('API fetch error:', error);
                }
            }, perSecondToCallAPI * 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
            if (apiInterval) clearInterval(apiInterval);
        };
    }, [checkTXDialogOpen]);

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast("Empty cart", {
                description: "Your cart is empty. Add some products before checking out.",
            })
            return
        }

        setCheckoutDialogOpen(true)
    }

    const handleConfirmCheckout = () => {
        // Close checkout dialog and open payment dialog
        setCheckoutDialogOpen(false)
        setPaymentDialogOpen(true)
    }

    const handlePaymentComplete = () => {
        // Close payment dialog and complete checkout
        setPaymentDialogOpen(false)
        setCheckTXDialogOpen(true);
        //onCheckout()
    }

    const handleIncreaseQuantity = (productId: number, currentQuantity: number) => {
        // Check if we have stock available without showing notification
        const product = products.find((p) => p.product_id === productId)
        if (product && product.product_quantity <= 0) {
            return // Silently fail if no stock
        }

        onUpdateQuantity(productId, currentQuantity + 1)
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Sidebar collapsible="none"
            className="sticky hidden lg:flex top-0 h-svh border-l md:w-80 lg:w-96 ">
            <div className="flex flex-col h-full">
                <div className="p-4 border-b sticky top-0 bg-background z-10">
                    <h2 className="text-lg font-semibold flex items-center">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Your Cart
                    </h2>
                </div>
                <SidebarContent>
                    <div className="flex-1 overflow-auto">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center h-full p-4">
                                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="font-medium text-lg">Your cart is empty</h3>
                                <p className="text-muted-foreground mt-1">Add some products to your cart to see them here.</p>
                            </div>
                        ) : (
                            <ul className="p-4 space-y-4">
                                {cartItems.map((item) => (
                                    <li key={item.product_id} className="flex gap-4 border-b pb-4">
                                        <div className="relative h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
                                            <Image
                                                src={
                                                    item.product?.product_image ||
                                                    `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(item.product?.product_name || "")}`
                                                }
                                                alt={item.product?.product_name || ""}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-medium truncate">{item.product?.product_name}</h4>
                                            <p className="text-primary font-bold">${item.product?.product_price.toFixed(2)}</p>
                                            <div className="flex items-center mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="mx-2 min-w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => handleIncreaseQuantity(item.product_id, item.quantity)}
                                                    disabled={item.product?.product_quantity === 0}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 flex-shrink-0 self-start"
                                            onClick={() => onRemoveItem(item.product_id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </SidebarContent>
                <div className="p-4 border-t sticky bottom-0 bg-background z-10">
                    <Card className="mb-4 bg-muted/50">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Subtotal:</span>
                                <span className="font-medium"> (₳){totalPrice}</span>
                            </div>
                            <div className="border-t mt-2 pt-2 flex justify-between items-center">
                                <span className="font-semibold">Total:</span>
                                <span className="font-bold text-lg text-primary">{totalPrice} (₳)</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="w-full" onClick={handleCheckout} disabled={cartItems.length === 0}>
                            Review Order
                        </Button>
                        <Button className="w-full" onClick={() => setPaymentDialogOpen(true)} disabled={cartItems.length === 0}>
                            Pay Now
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Order</DialogTitle>
                        <DialogDescription>Please review your order before confirming.</DialogDescription>
                    </DialogHeader>

                    <div className="py-4 max-h-[60vh] overflow-auto">
                        <ul className="space-y-4">
                            {cartItems.map((item) => (
                                <li key={item.product_id} className="flex gap-4">
                                    <div className="relative h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
                                        <Image
                                            src={
                                                item.product?.product_image ||
                                                `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(item.product?.product_name || "")}`
                                            }
                                            alt={item.product?.product_name ?? ""}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-medium">{item.product?.product_name}</h4>
                                        <div className="flex justify-between">
                                            <p>
                                                (₳){item.product?.product_price} × {item.quantity}
                                            </p>
                                            <p className="font-bold"> (₳){((item.product?.product_price || 0) * item.quantity)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 pt-4 border-t space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Subtotal:</span>
                                <span className="font-medium">{totalPrice} (₳)</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t mt-2">
                                <span className="font-medium">Total:</span>
                                <span className="font-bold text-lg">{totalPrice}  (₳)</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmCheckout}>Proceed to Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Payment</DialogTitle>
                        <DialogDescription>Scan the QR code to complete your payment</DialogDescription>
                    </DialogHeader>

                    <div className="py-6 flex flex-col items-center justify-center">
                        <div className="bg-white p-4 rounded-lg mb-4">
                            <QRImage
                                text={device?.wallet_address ?? ""}
                                options={{
                                    type: 'image/jpeg',
                                    quality: 1,
                                    errorCorrectionLevel: 'M',
                                    margin: 3,
                                    scale: 5,
                                    width: 200,
                                    color: {
                                        dark: '#000000',
                                        light: '#f9f9f9',
                                    },
                                }}
                            />
                            <span className="font-medium flex items-center gap-2">
                                {truncateText(device?.wallet_address ?? "", 8, 12)}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => copyToClipboard(device?.wallet_address ?? "")}
                                    title="Copy device address"
                                >
                                    <Copy className="h-3 w-3" />
                                    <span className="sr-only">Copy address</span>
                                </Button>
                            </span>
                        </div>

                        <div className="text-center mb-4">
                            <p className="text-muted-foreground mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-primary"> {totalPrice} (₳)</p>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            <p>Scan with your mobile payment app such as Yoroi</p>
                            <p>The machine will dispense your items after payment is confirmed</p>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handlePaymentComplete}>I have Completed Payment</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={checkTXDialogOpen} onOpenChange={setCheckTXDialogOpen} >
                <AlertDialogContent className="bg-transparent [&>button]:hidden border-0 shadow-none" >
                    <AlertDialogHeader>
                        <AlertDialogTitle></AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="text-center">
                        <div role="status">
                            <svg aria-hidden="true" className="inline w-24 h-24 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                        </div>
                        <div className="text-white mt-6 text-2xl">Checking transaction....</div>
                        <div className="text-white mt-2 text-xl">
                            Time remaining: {formatTime(remainingSeconds)}
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </Sidebar>
    )
}

