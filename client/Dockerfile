# client/Dockerfile
FROM node:18

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Add build argument for cache busting
ARG CACHEBUST=1

# Build the application
RUN REACT_APP_CACHEBUST=$CACHEBUST npm run build

# Install serve
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Serve the application
CMD ["serve", "-s", "build", "-l", "3000"]
