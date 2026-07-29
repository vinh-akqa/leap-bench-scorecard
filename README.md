# Bench Scorecard Prototype

AKQA-branded interactive intake form for the Leap Bench Allocation Framework.

**Demo for:** Rich + Ian (Thu 30 Jul)  
**Status:** Prototype only. Scoring weights provisional.

## Open locally

```bash
cd projects/akqa-leap-bench/prototype/bench-scorecard
python3 -m http.server 8765
```

Then open [http://localhost:8765](http://localhost:8765)

## What it demos

- One question at a time (8 steps) with a single progress bar
- Part A → vectors → logistics, then traffic light result
- Live Green / Amber / Red from Yes/No answers

## Scoring (MVP rules)

| Result | Rule |
| --- | --- |
| Green | Individual text + department Yes + AKQA Yes |
| Amber | Individual text + AKQA Yes (department No) |
| Red | AKQA No (or individual-only path) |
