# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
# Copy the build output to the Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Create a custom nginx configuration to listen on the PORT environment variable
# Cloud Run sets the PORT environment variable (usually 8080)
RUN echo 'server { \
    listen 8080; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# We use 8080 as the default because Cloud Run expects it, but Nginx will use this config.
# To make it truly dynamic, we would use envsubst, but for Cloud Run 8080 is standard.
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
