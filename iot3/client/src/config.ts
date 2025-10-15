import { z } from 'zod'

const configSchema = z.object({
    NEXT_PUBLIC_API_ENDPOINT: z.string(),
    NEXT_PUBLIC_WEBSOCKET: z.string(),
    NEXT_PUBLIC_PAYMENT_DURATION_SECONDS: z.string().transform(val => parseInt(val, 10)).default('120'),
    NEXT_PUBLIC_PAYMENT_CHECK_INTERVAL_SECONDS: z.string().transform(val => parseInt(val, 10)).default('6')
})

const configProject = configSchema.safeParse({
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
    NEXT_PUBLIC_WEBSOCKET: process.env.NEXT_PUBLIC_WEBSOCKET,
    NEXT_PUBLIC_PAYMENT_DURATION_SECONDS: process.env.NEXT_PUBLIC_PAYMENT_DURATION_SECONDS,
    NEXT_PUBLIC_PAYMENT_CHECK_INTERVAL_SECONDS: process.env.NEXT_PUBLIC_PAYMENT_CHECK_INTERVAL_SECONDS,
})
if (!configProject.success) {
    console.error(configProject.error.issues)
    throw new Error('Các giá trị khai báo trong file .env không hợp lệ')
}

const envConfig = configProject.data
export default envConfig