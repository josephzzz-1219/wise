\# Feature: Keyword Fallback for Store Redirect (Week1/Week2)



\## Problem

Platform search may return no results due to naming differences (language, spec, pack form).



\## User interaction

On the redirect card (evidence/checkout card), show:

\- Primary: "Search in store"

\- Secondary: "No results? Try another keyword"



When user clicks the secondary button, open the same store with fallback keyword.



\## Data requirement

We keep two keywords per product:

\- keyword\_primary: default "Brand + Product Name"

\- keyword\_fallback: optional, used when primary fails



For Week1, fallback keywords are manually curated and documented in docs/keyword\_check\_day2.md.



\## API suggestion (backend)

GET /store\_redirect?product\_code=...\&platform=...\&mode=primary|fallback

Return:

\- url: string

\- keyword\_used: string

\- mode: primary|fallback



Frontend behavior:

\- Clicking the primary button calls mode=primary

\- Clicking "Try another keyword" calls mode=fallback



\## Acceptance criteria

\- For products marked WARN in Day2, fallback button should open a search page with better results.

\- No changes required for price engine in Week1.



