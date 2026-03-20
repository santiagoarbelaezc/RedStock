# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

# Stage 2: Development (with nodemon)
FROM base AS development
RUN npm install
COPY . .
# nodemon is usually in devDependencies, so we ensure it's installed
RUN npm install -g nodemon
CMD ["npm", "run", "dev"]

# Stage 3: Production (clean and minimal)
FROM base AS production
RUN npm install --production
COPY . .
CMD ["node", "src/app.js"]
