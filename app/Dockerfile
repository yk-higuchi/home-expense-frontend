# syntax=docker/dockerfile:1.29.0

FROM node:26.13.1-trixie-slim@sha256:e6bedef217677b276c591795e169840edd9096dbf13f29df8ef8d1856b8820bc AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install --global pnpm@12.21.0
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY app/package.json ./app/
COPY packages/ui/package.json ./packages/ui/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store --filter home-expense-frontend-new...

FROM deps AS builder
COPY . .
RUN pnpm --filter home-expense-frontend-new build

FROM gcr.io/distroless/nodejs26-debian13:nonroot@sha256:1d736cf8b5716c07a245301f92717143215d248fd55771ee1936ef4b3302e531 AS runner
ARG VERSION=unspecified
ARG GIT_SHA=unspecified
LABEL org.opencontainers.image.title="home-expense-frontend" \
      org.opencontainers.image.description="Home expense management web app (Next.js)" \
      org.opencontainers.image.source="https://github.com/yk-higuchi/home-expense-frontend" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}"
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=builder --chown=nonroot:nonroot /repo/app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /repo/app/.next/static ./app/.next/static
USER nonroot
EXPOSE 3000
CMD ["app/server.js"]
