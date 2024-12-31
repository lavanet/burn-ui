localbe_run:
	@export NEXT_PUBLIC_JSINFOBE_REST_URL=http://localhost:8081 && \
	export PORT=5200 && \
	pnpm dev

run:
	@export NEXT_PUBLIC_JSINFOBE_REST_URL=https://jsinfo.mainnet.lavanet.xyz/ && \
	export PORT=5200 && \
	pnpm dev

build:
	@export NEXT_PUBLIC_JSINFOBE_REST_URL=https://jsinfo.mainnet.lavanet.xyz/ && \
	pnpm build

install:
	pnpm install

macos_kill:
	lsof -ti:5200 | xargs kill -9