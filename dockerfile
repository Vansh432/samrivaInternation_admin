# stage - 1
FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# stage - 2

 FROM node:22-alpine 

 WORKDIR /build

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules


EXPOSE 4173

CMD ["npm","run","preview"]

