FROM node:18-alpine

# Inform Node that we are running in production
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /app

# Copy ONLY backend package files first (better caching)
COPY server/package*.json ./

# Install dependencies (ignoring devDependencies)
RUN npm install --production

# Copy the rest of the backend files directly into /app
COPY server/ .

# Explicitly tell Back4App which port we expect to use
EXPOSE 5000

# Start the Node Express backend
CMD ["node", "index.js"]
