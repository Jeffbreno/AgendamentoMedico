# Estágio 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Produção (ou desenvolvimento)
FROM node:18
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm", "run", "dev"] 