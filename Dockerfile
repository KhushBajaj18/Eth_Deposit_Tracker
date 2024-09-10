# Use an official Node runtime as the parent image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create a .env file from .env.example if it exists
RUN if [ -f .env.example ]; then cp .env.example .env; fi

# Make port 3000 available outside the container (if your app uses a port)
# EXPOSE 3000

# Define the command to run the app
CMD [ "node", "index.js" ]