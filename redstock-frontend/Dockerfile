# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json and install dependencies separately to leverage cache
# Using --legacy-peer-deps to avoid ng2-charts / Angular 18 conflicts
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Service (Nginx)
FROM nginx:alpine

# Copy build artifacts from the build stage
COPY --from=build /app/dist/redstock-frontend/browser /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
