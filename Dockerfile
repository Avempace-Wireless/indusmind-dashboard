# Use Node.js 22 alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose Vite default port
EXPOSE 5173

# Run the dev server with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host"]
