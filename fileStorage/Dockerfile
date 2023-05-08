FROM node:14

WORKDIR /fileStorage

COPY package.json yarn.lock ./

RUN yarn

COPY . ./

EXPOSE 3010

CMD yarn start