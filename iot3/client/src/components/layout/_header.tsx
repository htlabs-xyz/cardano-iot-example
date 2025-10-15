import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import Image from "next/image"
import Link from "next/link"
export default function Header() {
    return (
        <div className="sticky inset-0  w-full border-b-2  shadow-sm py-3 px-10 bg-white z-10">
            <div className="max-w-6xl flex justify-between items-center mx-auto">
                <div className="font-semibold text-2xl">
                    <Link href={"/"}>
                        IOT03 - Vending Machine
                    </Link>
                </div>
                <div className="flex items-center space-x-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="rounded-3xl">Connect wallet</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Available wallets</DialogTitle>
                            </DialogHeader>
                            <div>
                                <Button className="w-full flex items-center justify-start" >
                                    <Image src={"https://play-lh.googleusercontent.com/BzpWa8LHTBzJq3bxOUjl-Bp7ixh2VOV_5zk6hZjrk57wRp7sc_kvrf3HCrjdKHL_BtbG"}
                                        width={32} height={32} alt="eternal" />
                                    <span>Eternal</span>
                                </Button>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">
                                        Close
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Link href={""}>
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>HT</AvatarFallback>
                        </Avatar>
                    </Link>

                </div>
            </div>
        </div>
    )
}
