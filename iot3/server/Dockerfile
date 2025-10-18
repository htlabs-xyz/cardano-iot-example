FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY .env .env
RUN npm run build
EXPOSE 8003
CMD ["npm", "run", "start:prod"]