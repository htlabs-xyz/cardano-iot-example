import { Skeleton } from "@/components/ui/skeleton"
import VendingMachineUI from "@/components/vending-machine-ui"
import { Suspense } from "react"

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <VendingMachineUI />
    </Suspense>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex ">
      <div className="flex-1 p-4">
        <Skeleton className="h-10 w-full max-w-xs mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="w-80 lg:w-96 border-l">
        <Skeleton className="h-16 w-full" />
        <div className="p-4 space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex gap-4 pb-4 border-b">
                <Skeleton className="h-16 w-16 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-7" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-7 w-7" />
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="p-4 border-t mt-auto">
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}

