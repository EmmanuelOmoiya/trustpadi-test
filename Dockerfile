# ---------- Builder Stage ----------
FROM node:latest AS builder

WORKDIR /app

RUN npm i -g pnpm@10.13.1

# Copy source files
COPY . .

RUN pnpm install

# Install dependencies
COPY package*.json ./

# Build the NestJS project
RUN pnpm run build


# ---------- Runner Stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy built app and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pm2.config.js ./pm2.config.js

# Expose port
EXPOSE 4000

# Use PM2 to start the app
CMD ["pm2-runtime", "pm2.config.js"]
