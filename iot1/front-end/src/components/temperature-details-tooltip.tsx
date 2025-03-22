import { Circle, ExternalLink } from 'lucide-react'

export default function TemperateDetailsTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
        const data = payload[0].payload

        // Format the value based on its magnitude
        const formattedValue =
            data.value >= 1000000
                ? `${(data.value / 1000000).toFixed(2)}M`
                : data.value >= 1000
                    ? `${(data.value / 1000).toFixed(2)}K`
                    : data.value.toString()

        return (
            <div className="bg-white rounded-md shadow-lg p-3 min-w-[200px] border border-gray-100">
                <div className="flex justify-between items-center font-medium text-gray-700 mb-2">
                    <span>{data.formattedDate}</span>
                    <span className="text-blue-500">{data.formattedTime}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <Circle className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                    <span className="text-gray-600">Value:</span>
                    <span className="font-semibold">{formattedValue}</span>
                </div>

                <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">TX Ref:</span>
                    <a
                        href={data.tx_ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate max-w-[120px] inline-block"
                    >
                        {data.tx_ref.split("/").pop()?.substring(0, 8)}...
                    </a>
                </div>
            </div>
        )
    }
    return null
}