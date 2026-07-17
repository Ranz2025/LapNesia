FROM node:20-alpine AS build

WORKDIR /app
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

# We will just use the artifacts in nginx container via a volume or multistage copy.
# But actually it's easier to create a production Nginx image that INCLUDES the built frontend!
