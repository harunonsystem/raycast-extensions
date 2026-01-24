# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Raycast extension for calculating leave time based on arrival time. Supports Japanese/English localization and night shift (cross-midnight) calculations.

## Commands

```bash
bun run dev        # Development mode (Raycast extension)
bun run build      # Build for production
bun run test       # Run tests with vitest
bun run check      # Lint & format check (Biome)
bun run format     # Auto-format with Biome
```

## Architecture

- `src/calculate-leave-time.tsx` - Main command component (Raycast List view)
- `src/lib/time-utils.ts` - Time calculation logic (leave time, remaining time, night shift handling)
- `src/lib/translations.ts` - i18n support (ja/en)
- `src/lib/storage.ts` - Raycast LocalStorage wrapper for persisting today's start time
- `src/lib/types.ts` - TypeScript type definitions
- `tests/` - vitest tests

## Key Dependencies

- `@raycast/api` - Raycast extension framework
- `vitest` - Test runner (not bun test)
- `@biomejs/biome` - Linting and formatting

## Development Guidelines

- Use `bun install` instead of npm/yarn/pnpm
- Use `bun run <script>` instead of npm run
- Use `bunx <package>` instead of npx

## Notes

- Preferences are defined in package.json under `commands[].preferences`
- Time calculations handle cross-midnight shifts (e.g., 22:00 start -> 07:00 leave next day)
- Tests use `vi.useFakeTimers()` for time-dependent logic
