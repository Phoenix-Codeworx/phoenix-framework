# Use the official Node.js image as a base
FROM node:18

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
ENV PATH="/root/.bun/bin:$PATH"

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy the package.json and bun.lockb files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Specify the command to run the app
CMD ["bun", "run", "start"]

# Expose the port the app runs on
EXPOSE 4000
