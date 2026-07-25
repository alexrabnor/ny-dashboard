FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY server.ts tsconfig.json ./
# server.ts importerar applistorna för hälsokontrollen /api/app-status
COPY src/constants.ts src/types.ts ./src/
COPY downloads ./downloads
EXPOSE ${PORT:-3000}
ENV NODE_ENV=production
CMD ["npm", "start"]
