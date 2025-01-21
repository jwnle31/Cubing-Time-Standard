FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN VITE_API_URL=${VITE_API_URL} npm run build

FROM caddy:2-alpine AS production
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=development /app/dist /srv
