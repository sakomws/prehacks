# Event Management Platform - Development Makefile

.PHONY: help setup install-backend install-frontend test-structure docker-up docker-down clean

help: ## Show this help message
	@echo "Event Management Platform - Development Commands"
	@echo "================================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Set up the development environment
	@echo "🚀 Setting up Event Management Platform..."
	@chmod +x scripts/dev-setup.sh
	@./scripts/dev-setup.sh

install-backend: ## Install backend dependencies
	@echo "📦 Installing backend dependencies..."
	@cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

install-frontend: ## Install frontend dependencies
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install

test-structure: ## Test project structure
	@echo "🔍 Testing project structure..."
	@cd backend && python test_structure.py

docker-up: ## Start Docker services
	@echo "🐳 Starting Docker services..."
	@docker-compose up -d

docker-down: ## Stop Docker services
	@echo "🛑 Stopping Docker services..."
	@docker-compose down

docker-logs: ## Show Docker logs
	@docker-compose logs -f

health-check: ## Check service health
	@chmod +x scripts/health-check.sh
	@./scripts/health-check.sh

clean: ## Clean up development environment
	@echo "🧹 Cleaning up..."
	@docker-compose down -v
	@docker system prune -f
	@rm -rf backend/venv
	@rm -rf frontend/node_modules
	@rm -rf frontend/.next

dev-backend: ## Start backend development server
	@echo "🚀 Starting backend development server..."
	@cd backend && source venv/bin/activate && uvicorn main:app --reload

dev-frontend: ## Start frontend development server
	@echo "🚀 Starting frontend development server..."
	@cd frontend && npm run dev

migrate: ## Run database migrations
	@echo "🗄️  Running database migrations..."
	@cd backend && source venv/bin/activate && alembic upgrade head

create-migration: ## Create a new database migration
	@echo "📝 Creating new migration..."
	@cd backend && source venv/bin/activate && alembic revision --autogenerate -m "$(MSG)"