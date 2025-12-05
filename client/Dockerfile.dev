FROM node:22

WORKDIR /app

COPY package*.json ./
# Make sure postinstall scripts run so lightningcss can download its binary
RUN npm config set ignore-scripts false \
  && npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
