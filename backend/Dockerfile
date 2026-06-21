FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 38306
CMD ["node", "dist/main.js"]
