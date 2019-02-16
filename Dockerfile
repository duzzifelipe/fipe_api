FROM debian:jessie
WORKDIR /usr/src/app
COPY . .
RUN apt-get update -y
RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs
VOLUME ./output /usr/src/output
CMD ["node", "test.js"]