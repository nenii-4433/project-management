FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Move into the server folder
WORKDIR /app/server

# Install dependencies and start the server
RUN npm install
CMD ["node", "index.js"]
