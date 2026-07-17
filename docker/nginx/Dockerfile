# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine
COPY --from=frontend-build /app/dist /var/www/frontend
COPY Backend/public /var/www/backend/public
COPY docker/nginx/conf.d/prod.conf /etc/nginx/conf.d/default.conf