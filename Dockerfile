# multi-stage Dockerfile for NestJS app
FROM node:18-alpine AS builder
WORKDIR /app

# Install build-time dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies in the final image
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev

# Copy build artifacts
COPY --from=builder /app/dist ./dist

# Use a non-root user for better security
RUN addgroup -S app && adduser -S app -G app || true
USER app

EXPOSE 3000
CMD ["node", "dist/main.js"]
