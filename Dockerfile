# Stage 1: Build
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build arguments for environment variables
ARG VITE_BESZEL_URL
ARG VITE_BESZEL_EMAIL
ARG VITE_BESZEL_PASSWORD
# VITE_PIHOLE_URL is needed at runtime for Nginx, but also build time if used in code
ARG VITE_PIHOLE_URL
ARG VITE_PIHOLE_API_KEY
ARG VITE_HA_URL
ARG VITE_HA_TOKEN
ARG VITE_UPTIME_KUMA_URL
ARG VITE_UPTIME_KUMA_USERNAME
ARG VITE_UPTIME_KUMA_PASSWORD
ARG VITE_UPTIME_KUMA_TOKEN

# Set environment variables during build
ENV VITE_BESZEL_URL=$VITE_BESZEL_URL
ENV VITE_BESZEL_EMAIL=$VITE_BESZEL_EMAIL
ENV VITE_BESZEL_PASSWORD=$VITE_BESZEL_PASSWORD
ENV VITE_PIHOLE_URL=$VITE_PIHOLE_URL
ENV VITE_PIHOLE_API_KEY=$VITE_PIHOLE_API_KEY
ENV VITE_HA_URL=$VITE_HA_URL
ENV VITE_HA_TOKEN=$VITE_HA_TOKEN
ENV VITE_UPTIME_KUMA_URL=$VITE_UPTIME_KUMA_URL
ENV VITE_UPTIME_KUMA_USERNAME=$VITE_UPTIME_KUMA_USERNAME
ENV VITE_UPTIME_KUMA_PASSWORD=$VITE_UPTIME_KUMA_PASSWORD
ENV VITE_UPTIME_KUMA_TOKEN=$VITE_UPTIME_KUMA_TOKEN

RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

EXPOSE 80

# Substitute environment variables in nginx config and start nginx
CMD ["/bin/sh", "-c", "envsubst '${VITE_PIHOLE_URL} ${VITE_HA_URL} ${VITE_UPTIME_KUMA_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
