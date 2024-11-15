FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json .

RUN npm install
COPY . .
RUN npm run build
FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json .
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
