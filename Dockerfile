# configure the proxy first!

# to build, run the command: docker build -t 2based2wait . # or replace docker with podman

FROM node:alpine

LABEL maintainer="Enchoseon"
LABEL name="2based2wait"

# copy application

WORKDIR "/srv/app"

COPY . "/srv/app"

# install requirements
RUN npm install -g pnpm && pnpm install --prod

#exposing 25566 (mc proxy)
EXPOSE 25565/tcp

# run container
CMD pnpm start
