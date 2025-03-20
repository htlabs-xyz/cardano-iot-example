import Link from 'next/link'
import React from 'react'

export default function Footer() {
    return (
        <div className="flex justify-center items-center py-3 px-10 border-t-2 shadow-sm  bg-white">
            <Link className='text-sm text-slate-600' href={"/"}>© All rights reserved HTLab</Link>
        </div>
    )
}
