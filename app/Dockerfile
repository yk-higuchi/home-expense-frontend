FROM node:24 AS deps

WORKDIR /repo

RUN npm i -g pnpm@9

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY app/package.json ./app/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile --filter home-expense-frontend-new...

FROM deps AS builder

COPY . .
RUN pnpm --filter home-expense-frontend-new build

FROM gcr.io/distroless/nodejs24-debian12:nonroot AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --chown=nonroot:nonroot --from=builder /repo/app/.next/standalone ./
COPY --chown=nonroot:nonroot --from=builder /repo/app/.next/static ./app/.next/static

EXPOSE 3000
USER nonroot

ENV PORT 3000

CMD [ "app/server.js" ]
