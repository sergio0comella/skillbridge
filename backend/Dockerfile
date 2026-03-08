FROM node:20-alpine AS base
WORKDIR /app

# OpenSSL required by Prisma on Alpine
RUN apk add --no-cache openssl

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client (targets linux-musl-openssl-3.0.x on Alpine node:20)
RUN npx prisma generate

# Development
FROM base AS development
EXPOSE 4000
CMD ["npm", "run", "dev"]

# Build
FROM base AS builder
RUN npm run build

# Production
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/server.js"]
