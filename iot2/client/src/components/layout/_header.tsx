"use client";

import Link from "next/link";
import { CardanoWallet } from "../cardano-wallet";
export default function Header() {
    return (
        <div className="sticky inset-0  w-full border-b-2  shadow-sm py-3 px-10 bg-white z-100">
            <div className="max-w-6xl flex justify-between items-center mx-auto">
                <div className="font-semibold text-2xl">
                    <Link href={"/"}>
                        IOT02 - Electric Locker
                    </Link>
                </div>
                <div className="flex items-center space-x-2">
                    <CardanoWallet persist={true} />
                </div>
            </div>
        </div>
    )
}
