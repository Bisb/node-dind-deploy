FROM node:18-alpine

# Install Docker CLI and Docker-in-Docker
RUN apk add --no-cache \
    docker-cli \
    docker-cli-compose

# Create a working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

ENV PORT=3000

COPY . .

CMD ["node", "index.js"]
