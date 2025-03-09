# your node version
FROM node:20-alpine AS deps-prod

WORKDIR /app

COPY ./package*.json .
COPY ./credentials.json . 

RUN npm install --omit=dev

FROM deps-prod AS build

RUN npm install --include=dev

COPY . .

RUN npm run build

FROM node:20-alpine AS prod

WORKDIR /app

COPY --from=build /app/package*.json .
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=deps-prod /app/credentials.json .