# stage - 1
FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# stage - 2

# FROM node:22-alpine 

# WORKDIR /build

# COPY --from=builder /app/dist /dist

EXPOSE 4173

CMD ["npm","run","preview","--","--host",""]

