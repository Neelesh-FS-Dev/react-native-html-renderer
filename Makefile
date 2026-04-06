.PHONY: test lint typecheck build clean prepare example publish

## Run Jest tests
test:
	yarn test

## Run ESLint
lint:
	yarn lint

## Run ESLint with auto-fix
lint-fix:
	yarn lint --fix

## Run TypeScript type checker
typecheck:
	yarn typecheck

## Build the library
build: prepare

## Build with bob
prepare:
	yarn prepare

## Clean build artifacts
clean:
	yarn clean

## Start the example app (Metro bundler)
example:
	yarn example start

## Run example on iOS
example-ios:
	yarn example ios

## Run example on Android
example-android:
	yarn example android

## Run all checks (lint + typecheck + test + build)
check: lint typecheck test build
	@echo "All checks passed!"

## Publish to npm (use with caution)
publish:
	yarn release
