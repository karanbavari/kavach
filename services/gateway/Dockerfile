FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json tsconfig.json package-lock.json ./

# Copy packages
COPY packages/core ./packages/core
COPY services/gateway ./services/gateway

# Install dependencies
RUN npm ci

# Build all workspaces
RUN npm run build

# Remove devDependencies
RUN npm prune --production

FROM node:20-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/package.json
COPY --from=builder /app/services/gateway/dist ./services/gateway/dist
COPY --from=builder /app/services/gateway/package.json ./services/gateway/package.json

# Copy server node_modules specifically if needed or rely on hoisted root node_modules
# (In a monorepo, dependencies are usually at the root)

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "services/gateway/dist/server.js"]
