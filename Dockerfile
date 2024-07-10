FROM oven/bun:latest

WORKDIR /app

COPY package.json .
COPY bun.lockb .
RUN bun install

COPY . .
COPY .env .env

RUN bunx prisma generate

EXPOSE 3001

RUN bun add nodemon

CMD ["bun", "nodemon", "--watch", "src", "--exec", "bun run index.ts"]