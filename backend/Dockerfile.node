# Node.js Express Backend Dockerfile
FROM node:18-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5002

# Command to run the application
CMD ["node", "server.js"]
