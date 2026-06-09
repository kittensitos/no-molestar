FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /app/dist ./dist

RUN npm install -g serve

EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
