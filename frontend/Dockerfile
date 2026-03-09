FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Development
FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Build
FROM base AS builder
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production (serve with nginx)
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
