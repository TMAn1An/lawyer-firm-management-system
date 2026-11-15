# Contributing

Thank you for helping people understand their rights.

## Ways to help (no coding needed)

- **Lawyers / paralegals:** review a guide in `src/content/guides.ts`, fix errors, and add your name in `reviewedBy` when you have checked the whole text.
- **Local knowledge:** add or correct services in `src/content/providers.json`. Only organisations (government, non-profit, helplines): **never individual lawyers or firms**, and no paid placement. Set `verified: true` only after you have confirmed the details by phone or visit.
- **Translators / plain-language editors:** improve `src/lib/i18n/bn.ts` and `en.ts`. Aim for simple wording.

## Ground rules

1. **No advertising.** Do not add anything that promotes a lawyer or firm, ranks providers, or takes payment for listing.
2. **Privacy first.** Collect the minimum. No analytics or third-party trackers.
3. **Not legal advice.** Guides explain general rights; they must not advise on a specific case.
4. Every user-facing string must exist in **both** Bangla and English (the type checker enforces this).

## Development

```bash
npm install && cp .env.example .env && npm run db:migrate && npm run db:seed && npm run dev
npm run typecheck && npm test
```

Put business rules (scheduling, status changes) in `src/lib/rules.ts` with tests, not inside pages. Open a pull request describing what changed and why.
