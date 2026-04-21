.PHONY: install dev build preview docker-up docker-down docker-build clean

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview: build
	npm run preview

ezup:
	docker compose up

ezdown:
	docker compose down

ezbuild:
	docker compose up --build

clean:
	rm -rf dist node_modules
