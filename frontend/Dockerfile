FROM node:20-alpine AS builder
WORKDIR /app

# Copy only package.json first — layer cache for npm install
COPY package.json package-lock.json* ./
RUN npm install --prefer-offline --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
