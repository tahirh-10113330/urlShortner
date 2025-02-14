# Use an official Node.js runtime as base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 4000 (or whatever your app runs on)
EXPOSE 4000

# Command to start the app
CMD ["npm", "start"]
