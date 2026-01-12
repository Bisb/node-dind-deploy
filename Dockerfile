FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm clean-install --omit=dev

FROM node:22-alpine

# Install Docker CLI and Docker-in-Docker
RUN apk add --no-cache \
    docker-cli \
    docker-cli-compose

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY index.js ./
COPY package.json ./

EXPOSE 3000

CMD ["node", "index.js"]
