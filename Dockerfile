FROM node:15.12.0-alpine

RUN apk add openjdk11 ffmpeg git tar zip curl

RUN --mount=type=bind,source=.,target=/src,rw \
    set -x && \
    mkdir -p /opt/extract && \
    cd /src/scripts/extract && \
    NODE_PATH=/opt/extract/node_modules npm i && \
    NODE_PATH=/opt/extract/node_modules node extract.mjs 2>&1 | tee /opt/extract/build.log && \
    cd /src && \
    tar czf /opt/extract/0_static_files_from_extractor.tar.gz \
      --exclude=src/static/media/webvtt \
      --exclude=src/static/sfx/index.ts \
      --exclude=src/static/css \
      --exclude=src/static/font \
      src/static/ && \
    cp -f scripts/extract/discs/*.tar.gz /opt/extract/ && \
    cp -f scripts/extract/*.log /opt/extract/ && \
    rm -rf /tmp/*

