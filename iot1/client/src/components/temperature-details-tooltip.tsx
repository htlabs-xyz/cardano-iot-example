interface TooltipProps {
    active?: boolean
    payload?: Array<{
        value: number
        dataKey: string
        color: string
        payload: any
    }>
    label?: string
}

export default function TemperateDetailsTooltip({ active, payload, label }: TooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">{new Date(label || "").toLocaleDateString()}</p>
                <div className="space-y-1">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-sm text-gray-600 capitalize">{entry.dataKey}:</span>
                            <span className="text-sm font-medium text-gray-900">
                                {entry.dataKey === "temperature" ? `${entry.value}°C` : `${entry.value}%`}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return null
}
