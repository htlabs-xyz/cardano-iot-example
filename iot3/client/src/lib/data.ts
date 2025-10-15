export interface Product {
    id: string
    name: string
    price: number
    stock: number
    image?: string
}

export interface Machine {
    id: string
    name: string
    location: string
    products: Product[]
}

export const machines: Machine[] = [
    {
        id: "machine-1",
        name: "Snack Station",
        location: "Main Lobby",
        products: [
            {
                id: "product-1",
                name: "Potato Chips",
                price: 1.5,
                stock: 15,
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1iuYu-dW_WSYGZTxR5zdwdD-dVPFg_coExQ&s",
            },
            {
                id: "product-2",
                name: "Chocolate Bar",
                price: 2.0,
                stock: 10,
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4uDHblkcnYMfBpg0zeU3gm6H4jpg7K-6iMw&s",
            },
            {
                id: "product-3",
                name: "Granola Bar",
                price: 1.75,
                stock: 8,
                image: "https://product.hstatic.net/1000282430/product/granola-bar-chocolate-jsims-30g_6143f96e0000438fb0987e96a5fce3d7_master.jpg",
            },
            {
                id: "product-4",
                name: "Trail Mix",
                price: 2.5,
                stock: 5,
                image: "https://m.media-amazon.com/images/I/61MYSKUL-BL._SL1200_.jpg",
            },
            {
                id: "product-5",
                name: "Pretzels",
                price: 1.25,
                stock: 12,
                image: "https://m.media-amazon.com/images/I/61Ia1dC7m7L._SL1080_.jpg",
            },
            {
                id: "product-6",
                name: "Cookies",
                price: 1.75,
                stock: 0,
                image: "https://maytudong.com.vn/wp-content/uploads/may-dong-goi-banh-quy-single-cookie-packaging.jpg",
            },
        ],
    },
    {
        id: "machine-2",
        name: "Drink Depot",
        location: "2nd Floor",
        products: [
            {
                id: "product-7",
                name: "Water Bottle",
                price: 1.0,
                stock: 20,
                image: "https://product.hstatic.net/1000282430/product/nuoc-suoi-lavie-500ml_d1a208860a124bea80ca6c1e20b4994f_7b105e5ad2604285888fae69160e45d6_master.jpg",
            },
            {
                id: "product-8",
                name: "Cola",
                price: 1.5,
                stock: 15,
                image: "https://www.lottemart.vn/media/catalog/product/cache/0x0/8/9/8935049501404-2.jpg.webp",
            },
            {
                id: "product-9",
                name: "Orange Juice",
                price: 2.0,
                stock: 8,
                image: "https://img.websosanh.vn/v2/users/root_product/images/nuoc-cam-co-tep-teppy-minute-m/VErIxTPVk7l_.jpg",
            },
            {
                id: "product-10",
                name: "Energy Drink",
                price: 2.75,
                stock: 6,
                image: "https://hongphatfood.com/wp-content/uploads/2020/02/red-bull-drink-soft-250ml1.jpg",
            },
            {
                id: "product-11",
                name: "Iced Tea",
                price: 1.75,
                stock: 10,
                image: "https://product.hstatic.net/200000559893/product/lipton_chanh_hoa_tan-2_fe3aa044293a4e55b7ad35fe5aa568c2.jpg",
            },
            {
                id: "product-12",
                name: "Sparkling Water",
                price: 1.5,
                stock: 0,
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRtXUdO6_4vLMNcLuym9FIYP6fUeS1YVEvJQ&s",
            },
        ],
    },
    {
        id: "machine-3",
        name: "Fresh Eats",
        location: "Cafeteria",
        products: [
            {
                id: "product-13",
                name: "Sandwich",
                price: 4.5,
                stock: 5,
                image: "https://www.ministop.vn/img/product/62b2c199387b1_1b4b46a732d80c0d549b9fc9e40e9a1a.jpg",
            },
            {
                id: "product-14",
                name: "Salad",
                price: 5.0,
                stock: 3,
                image: "https://gofoodmarket.vn/wp-content/uploads/2023/04/sot-salad-voi-kem-chua.jpg",
            },
            {
                id: "product-15",
                name: "Fruit Cup",
                price: 3.0,
                stock: 7,
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThpYusoLXtK7QwIEyghbCibmLpRF8aTI6CLg&s",
            },
            {
                id: "product-16",
                name: "Yogurt",
                price: 2.0,
                stock: 8,
                image: "https://sieuthihoaba.com.vn/wp-content/uploads/2020/10/1559123457703_4991356.jpg",
            },
        ],
    },
]

