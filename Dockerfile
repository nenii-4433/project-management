FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the server package.json files first
COPY server/package*.json ./server/

# Change to server directory and install dependencies
WORKDIR /app/server
RUN npm install --production

# Copy the rest of the backend source code
COPY server/ .

# Start the node server directly
CMD ["node", "index.js"]
