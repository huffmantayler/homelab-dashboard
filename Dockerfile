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

# Set environment variables during build
ENV VITE_BESZEL_URL=$VITE_BESZEL_URL
ENV VITE_BESZEL_EMAIL=$VITE_BESZEL_EMAIL
ENV VITE_BESZEL_PASSWORD=$VITE_BESZEL_PASSWORD

RUN npm run build

# Stage 2: Production
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
