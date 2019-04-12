FROM node:8

#creates app directory..? 
WORKDIR /usr/go/src/github.com/quilt/mean-a/DockerImage

#install app dependencies
COPY package*.json ./

#might have to change to run npm ci --only=production
RUN npm install

#bundle app source
COPY . .

EXPOSE 8080
CMD ["npm", "start"]
