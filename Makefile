WRANGLER_VERSION := 3.114.15
CLOUDFLARE_PROJECT := kraftwerk-training
CLOUDFLARE_BRANCH := main

.PHONY: help cloudflare-login cloudflare-status cloudflare-build cloudflare-deploy

help:
	@echo "Cloudflare Pages"
	@echo "  make cloudflare-login   Einmalig bei Cloudflare anmelden"
	@echo "  make cloudflare-status  Aktive Cloudflare-Anmeldung prüfen"
	@echo "  make cloudflare-build   Statischen Produktions-Build erzeugen"
	@echo "  make cloudflare-deploy  Build erzeugen und auf Pages veröffentlichen"

cloudflare-login:
	npx --yes wrangler@$(WRANGLER_VERSION) login

cloudflare-status:
	npx --yes wrangler@$(WRANGLER_VERSION) whoami

cloudflare-build:
	npm run build:cloudflare

cloudflare-deploy: cloudflare-build
	npx --yes wrangler@$(WRANGLER_VERSION) pages deploy out --project-name $(CLOUDFLARE_PROJECT) --branch $(CLOUDFLARE_BRANCH)
