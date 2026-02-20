.PHONY: help install install-backend install-frontend dev-backend dev-frontend dev

# ── Colours ──────────────────────────────────────────────────────────────────
RESET  := \033[0m
BOLD   := \033[1m
CYAN   := \033[36m
YELLOW := \033[33m

help: ## Show this help
	@printf "$(BOLD)BTC Allocation Lab 2.0$(RESET)\n\n"
	@printf "$(CYAN)%-22s$(RESET) %s\n" "Target" "Description"
	@printf "%-22s %s\n" "------" "-----------"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN{FS=":.*?## "}{printf "$(CYAN)%-22s$(RESET) %s\n", $$1, $$2}'

# ── Install ───────────────────────────────────────────────────────────────────
install-backend: ## Create venv and install Python deps
	cd backend && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt

install-frontend: ## Install Node deps (legacy peer deps for recharts/react-19)
	cd frontend && npm install --legacy-peer-deps

install: install-backend install-frontend ## Install all dependencies

# ── Dev servers ───────────────────────────────────────────────────────────────
dev-backend: ## Start FastAPI on :8000 (hot-reload)
	cd backend && . venv/bin/activate && uvicorn app.main:app --reload --port 8000

dev-frontend: ## Start Next.js on :3000
	cd frontend && npm run dev

dev: ## Start both servers concurrently (requires: npm i -g concurrently)
	@command -v concurrently >/dev/null 2>&1 || \
		(echo "$(YELLOW)Installing concurrently globally…$(RESET)" && npm install -g concurrently)
	concurrently \
		--names "API,NEXT" \
		--prefix-colors "yellow,cyan" \
		"cd backend && . venv/bin/activate && uvicorn app.main:app --reload --port 8000" \
		"cd frontend && npm run dev"
