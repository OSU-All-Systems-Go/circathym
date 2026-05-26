FROM docker.io/node:lts-slim

WORKDIR /app

COPY apps/timer/dist .

RUN npm --omit=dev -f install
EXPOSE 3001

ENV AWS_REGION="us-east-2"
ENV HOST="localhost"
ENV PORT=3001
ENV LOCAL="true"

CMD [ "node", "main.js" ]
