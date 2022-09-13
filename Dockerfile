FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /srv
ADD package.json package-lock.json tsconfig.json ./
RUN npm install
ADD src src
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
