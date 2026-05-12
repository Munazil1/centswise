# centswise

> Multi-currency personal finance tracker with rent splits, budget analytics, and transaction management — live at centswise.vercel.app

**[Live Demo → centswise.vercel.app](https://centswise.vercel.app)** · TypeScript · React · FastAPI · PostgreSQL

---

## What it does

A personal finance SaaS that tracks income and expenses across multiple currencies, splits rent between housemates, categorises transactions, and visualises spending patterns. Users get a real-time dashboard showing budget vs actuals, category breakdowns, and distribution analytics — deployed to production with 29 deployments and counting.

## Why it's interesting

Most finance apps ignore multi-currency households or treat splitting as an afterthought. CentsWise builds rent splitting and AED/INR currency support into the core data model, not as a plugin. The FastAPI backend handles concurrent transaction creation with proper async patterns; the React frontend uses TypeScript throughout for type safety across the full stack.

---

## Architecture

```mermaid
flowchart TD
    A[React + TypeScript Frontend<br/>Vercel] --> B[FastAPI Backend<br/>REST API]
    B --> C[PostgreSQL<br/>Transactions · Users · Budgets]
    B --> D[Auth Layer<br/>JWT tokens]
    A --> E[Dashboard<br/>Budget vs Actuals · Category breakdown]
    A --> F[Rent Splitter<br/>Housemate distribution]
    A --> G[Transaction Manager<br/>Add · Edit · Delete · Filter]
    B --> H[Currency Layer<br/>AED · INR multi-currency]
```

---

## Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## Results / Metrics

| Metric | Value |
|---|---|
| Production deployments | 29 |
| Contributors | 3 |
| Currency support | AED, INR (multi-currency) |
| Core features | Expense tracking · Rent split · Budget analytics · Category management |
| Frontend | React + TypeScript (Vercel) |
| Backend | FastAPI + PostgreSQL |

---

## Setup (local)

```bash
git clone https://github.com/Munazil1/centswise.git
cd centswise
```

Copy environment variables:

```bash
cp .env.example .env
# Fill in DATABASE_URL, SECRET_KEY
```

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

---

## Future Work

- Add bank statement import (PDF → transactions via OCR)
- Build a savings goal tracker with milestone notifications
- Add shared expense groups beyond rent (trips, utilities)

---

## License

MIT © Munazil V — [munazilv1@gmail.com](mailto:munazilv1@gmail.com) · [LinkedIn](https://linkedin.com/in/munazil-v-a9643a316)
