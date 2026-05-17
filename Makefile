.DEFAULT_GOAL := help

OLLAMA_MODEL ?= qwen2.5:14b
OFFERLY_LANG ?= en

.PHONY: help install dev dev-cli run smoke clean ollama-pull web frontend frontend-install \
        docker-build docker-up docker-down docker-logs docker-pull-model docker-ps docker-clean

help: ## List available targets
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install Python deps with uv (creates .venv)
	uv sync

ollama-pull: ## Download the Ollama model
	ollama pull $(OLLAMA_MODEL)

frontend-install: ## Install Node deps for the Next.js frontend
	cd frontend && npm install

web: ## Start the FastAPI backend on :8000 (with auto-reload)
	OFFERLY_WEB_RELOAD=1 uv run offerly-web

frontend: ## Start the Next.js dev server on :3000
	cd frontend && npm run dev

dev: install ## Start Ollama (if needed) + backend (FastAPI :8000) + frontend (Next.js :3000)
	@if [ ! -d frontend/node_modules ]; then \
		echo "==> Installing frontend deps (first run)..."; \
		cd frontend && npm install; \
	fi
	@# Kill any zombie offerly-web / next dev processes from a previous run.
	@PIDS="$$(pgrep -f 'offerly-web' 2>/dev/null) $$(lsof -ti :8000 2>/dev/null) $$(lsof -ti :3000 2>/dev/null)"; \
	if [ -n "$$(echo $$PIDS | tr -d ' ')" ]; then \
		echo "==> Cleaning up previous instances on :8000 / :3000..."; \
		kill -9 $$PIDS 2>/dev/null || true; \
		sleep 1; \
	fi
	@# Ensure Ollama is reachable on :11434. If not, start it in background.
	@if curl -s -o /dev/null -m 2 http://localhost:11434/api/tags; then \
		echo "==> Ollama already running"; \
	else \
		if ! command -v ollama >/dev/null 2>&1; then \
			echo "ERROR: Ollama is not installed. Install it from https://ollama.com and retry."; \
			exit 1; \
		fi; \
		echo "==> Starting Ollama daemon in background..."; \
		nohup ollama serve > /tmp/offerly-ollama.log 2>&1 & \
		for i in 1 2 3 4 5 6 7 8 9 10; do \
			sleep 1; \
			if curl -s -o /dev/null -m 2 http://localhost:11434/api/tags; then \
				echo "    Ollama ready (logs: /tmp/offerly-ollama.log)"; \
				break; \
			fi; \
			if [ $$i -eq 10 ]; then \
				echo "ERROR: Ollama did not start within 10s. Check /tmp/offerly-ollama.log"; \
				exit 1; \
			fi; \
		done; \
	fi
	@# Ensure the configured model is available locally. Pull it if missing.
	@if ! ollama list 2>/dev/null | awk 'NR>1 {print $$1}' | grep -qx "$(OLLAMA_MODEL)"; then \
		echo "==> Model '$(OLLAMA_MODEL)' not found locally — pulling now (this may take several minutes)..."; \
		ollama pull $(OLLAMA_MODEL); \
	fi
	@echo ""
	@echo "==> Starting Offerly platform"
	@echo "    Backend:  http://localhost:8000"
	@echo "    Frontend: http://localhost:3000"
	@echo "    Ollama:   http://localhost:11434 ($(OLLAMA_MODEL))"
	@echo "    Ctrl-C to stop the platform (Ollama keeps running)"
	@echo ""
	@trap 'echo ""; echo "==> Shutting down platform..."; kill 0' INT TERM EXIT; \
	( OFFERLY_WEB_RELOAD=1 OLLAMA_MODEL=$(OLLAMA_MODEL) uv run offerly-web 2>&1 | sed -u "s/^/[backend] /" ) & \
	( cd frontend && npm run dev 2>&1 | sed -u "s/^/[frontend] /" ) & \
	wait

dev-cli: install ## Start the legacy conversational CLI (no web UI)
	@echo "==> Check that Ollama is running: http://localhost:11434"
	OLLAMA_MODEL=ollama/$(OLLAMA_MODEL) OFFERLY_LANG=$(OFFERLY_LANG) uv run offerly

run: ## Shortcut: launch the CLI without reinstalling
	OLLAMA_MODEL=ollama/$(OLLAMA_MODEL) OFFERLY_LANG=$(OFFERLY_LANG) uv run offerly

smoke: ## Smoke test of pure logic (no LLM)
	uv run python -c "from offerly.tools.campaign import UpdateCampaignTool, ExportCampaignTool, current, reset; \
from offerly.tools.demand import SimulateDemandTool; \
from offerly.tools.policies import ValidatePoliciesTool; import json; \
reset(lang='$(OFFERLY_LANG)'); \
UpdateCampaignTool()._run(json.dumps({'merchant_name':'Spa Aurora','category':'spa_beauty','pricing':{'pvp_eur':70.0,'variable_cost_eur':18.0,'offerly_price_eur':35.0,'commission_pct':40.0},'stock':80,'voucher_validity_days':120,'weekly_slots':['Tue','Wed','Thu'],'weekly_capacity':40,'title':'60-min massage in Soho','description':'Enjoy a 60-minute relaxing massage in the heart of Soho. Swedish techniques and aromatherapy included. Easy online booking. Ideal to unwind after work. Private cabins and natural oils.','fine_print':['Prior booking','Not stackable','No holidays']})); \
print(SimulateDemandTool()._run(impressions=20000, runs=2000, seed=42)); \
print(ValidatePoliciesTool()._run()); \
print(ExportCampaignTool()._run(out_dir='out'))"

clean: ## Remove venv, build artifacts, node_modules
	rm -rf .venv out __pycache__ .uv_cache frontend/node_modules frontend/.next
	find . -name "__pycache__" -type d -exec rm -rf {} +

# ---------------------------------------------------------------------------
# Docker — full stack (Ollama + backend + frontend) with one command.
# ---------------------------------------------------------------------------

docker-build: ## Build the backend + frontend images
	OLLAMA_MODEL=$(OLLAMA_MODEL) docker compose build

docker-up: ## Start the full stack (Ollama + backend :8000 + frontend :3000)
	@echo "==> Starting Offerly stack via Docker Compose"
	@echo "    Backend:  http://localhost:8000"
	@echo "    Frontend: http://localhost:3000"
	@echo "    Ollama:   http://localhost:11434 ($(OLLAMA_MODEL))"
	@echo ""
	@echo "    First run? Pull the model afterwards:  make docker-pull-model"
	@echo ""
	OLLAMA_MODEL=$(OLLAMA_MODEL) docker compose up -d --build
	@echo ""
	@echo "==> Stack is up. Tail logs with:  make docker-logs"

docker-pull-model: ## Download the configured Ollama model into the stack volume
	@echo "==> Pulling $(OLLAMA_MODEL) into the ollama_data volume (this can take a while)"
	OLLAMA_MODEL=$(OLLAMA_MODEL) docker compose --profile pull run --rm ollama-pull

docker-logs: ## Tail logs from all services
	docker compose logs -f --tail=100

docker-ps: ## Show the status of every service
	docker compose ps

docker-down: ## Stop the stack (keep volumes + images)
	docker compose down

docker-clean: ## Stop the stack AND drop the Ollama model volume (frees disk)
	docker compose down -v
