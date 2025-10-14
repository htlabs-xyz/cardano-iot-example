# Sử dụng image chính thức của Bun
FROM oven/bun:1

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json
COPY package*.json ./

# Cài đặt dependencies với Bun
RUN bun install

# Sao chép toàn bộ mã nguồn
COPY . .

# Tạo Prisma client
RUN bunx prisma generate

# Build ứng dụng Next.js
RUN bun run build

# Mở port 3005
EXPOSE 3005

# Lệnh khởi động ứng dụng với Bun
CMD ["bun", "run", "start"]