# HealthPulse

**Chronic Care, Simplified** &mdash; A WCAG 2.1 AA compliant, mobile-first chronic-care platform for patients managing hypertension and type 2 diabetes.

> **Scope note:** HealthPulse is a demo-grade platform for UX validation purposes. No real patient data, clinical decisions, or personally identifiable information is processed in the current build.

---

## Table of Contents

- [Overview](#overview)
- [Design Philosophy](#design-philosophy)
- [Architecture](#architecture)
- [Dual Design System](#dual-design-system)
- [OOUX/ORCA Object Model](#ouxorca-object-model)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Design Tokens](#design-tokens)
- [Accessibility](#accessibility)
- [UX Guardrails](#ux-guardrails)
- [Sprint Roadmap](#sprint-roadmap)
- [Research Foundation](#research-foundation)
- [References](#references)

---

## Overview

HealthPulse is a **behavioral support system** for patients navigating the daily cognitive, emotional, and practical demands of living with one or more chronic conditions. Every design decision is anchored in evidence from peer-reviewed research in human-computer interaction, health informatics, behavioral science, and clinical psychology.

Approximately 60% of US adults live with at least one chronic condition, and 40% manage two or more (CDC, 2023). HealthPulse addresses five documented dimensions of the management burden:

1. **Cognitive Load** &mdash; Multiple medications, readings, and appointments overwhelm working memory
2. **Emotional Labor** &mdash; Chronic illness management generates anxiety, depression, and illness-identity conflict
3. **Health Literacy Gaps** &mdash; Low health literacy affects ~36% of US adults
4. **Fragmented Care** &mdash; Patients navigate disconnected clinical systems
5. **Adherence Decay** &mdash; Medication adherence drops below 50% within the first year of treatment

---

## Design Philosophy

### Seven Research-Derived Principles

| # | Principle | Evidence Base |
|---|-----------|---------------|
| 1 | **Minimum Necessary Interaction** &mdash; Fewest possible taps per task | Torous et al. (2019); Park et al. (2020) |
| 2 | **Contextual Interpretation over Raw Data** &mdash; Never show a number without a frame | Park et al. (2020); Dehling et al. (2015) |
| 3 | **Cognitive Sparing Design** &mdash; Progressive disclosure, low density, generous spacing | Niessen et al. (2022); Biessels et al. (2006) |
| 4 | **Trust-First Privacy** &mdash; Sensitive data is visually protected; security is perceptible | Grundy et al. (2019) |
| 5 | **Illness-Stage Awareness** &mdash; Newly diagnosed need education; stable need efficiency | Holtz & Whitten (2009) |
| 6 | **Accessible by Default** &mdash; Grade 6-8 reading level, 56px touch targets, 1.6 line-height | Kutner et al. (2006); Niessen et al. (2022) |
| 7 | **Emotional Safety** &mdash; Never present a reading without emotional context | Hagger et al. (2017); Park et al. (2020) |

### Visual Identity: "Muted Healing Palette"

Warmth, trust, calm authority. No aggressive alerts, no clinical coldness. The UI feels like a supportive conversation, not a medical report. Colors are deliberately desaturated to reduce visual stress for chronic-care patients.

| Token | Hex | Role |
|-------|-----|------|
| Primary (Muted Sage) | `#8EAF9D` | CTAs, progress fills, active states |
| Alert (Pale Ochre) | `#D4A373` | Warnings, missed doses, low-refill |
| Success (Desaturated Mint) | `#B5C99A` | Confirmations, completed logs |
| Background (Soft Alabaster) | `#FBFBFB` | Primary surface (no high-glare white) |
| Text (Slate 900) | `#1E293B` | Primary text (12.6:1 contrast, AAA) |

---

## Architecture

### Three-Tier Architecture

```
Frontend (React + Tailwind) --> Server (Hono on Supabase Edge) --> Database (Supabase KV Store)
```

- **Frontend:** React 18 with React Router (Data mode), Tailwind CSS v4, Montserrat typography
- **Server:** Hono web server on Supabase Edge Functions with 35+ REST endpoints across 16 entity types
- **Database:** Supabase KV-backed storage with typed DTOs and hydration functions
- **Auth:** PIN-based biometric gate for Lab Vault (demo PIN: `2026`); app login password: `pulse2026`

### Data Flow

```
API Client (api.ts) --> Query Hooks (useHealthData.ts) --> Hydration (helpers.ts) --> Components
                   --> Mutation Hooks                  --> Optimistic UI + Toast Feedback
```

- **20+ query hooks** for all ORCA entities
- **5+ mutation hooks** (`useLogDose`, `useLogObservation`, `useToggleTask`, `useTogglePrepItem`, `useSaveHealthProfile`)
- **DashboardContext** provides a single API call for the home dashboard aggregation

---

## Dual Design System

HealthPulse operates two fully isolated design systems side by side. This architecture serves two distinct audiences without compromising either experience.

### System 1: HealthPulse (Patient-Facing)

| Property | Value |
|----------|-------|
| **Purpose** | Patient-facing chronic care platform |
| **Breakpoint** | 375px (iPhone SE), mobile-first up to 767px |
| **Palette** | Muted Healing &mdash; warm, desaturated, calming |
| **Typography** | Montserrat, static scale (10px&ndash;26px) |
| **Grid** | 8px base grid |
| **Touch Targets** | 56px minimum |
| **Token Source** | `/src/app/design/tokens.ts` |

### System 2: MediFlow (Professional/Desktop)

| Property | Value |
|----------|-------|
| **Purpose** | Desktop navigation, provider-facing features, design showcase |
| **Breakpoint** | 6-point fluid scale (320px&ndash;1440px+) |
| **Palette** | Cooler green, neutral authority |
| **Typography** | Montserrat with `clamp()` fluid sizing |
| **Spacing** | Fluid `clamp()` values |
| **Token Sources** | `/src/app/design/mediflow.ts`, `/src/app/design/fluidSystem.ts` |

### Isolation Rules

1. **Token namespacing:** HealthPulse: `C.`, `T.`, `L.` &mdash; MediFlow: `MF_C.`, `MF_T.`, `FL_C.`, `FL_T.`, `FL_S.`
2. **No cross-import:** Patient-facing pages must not import MediFlow tokens and vice versa
3. **Exception:** SideNav bridges both systems as it wraps patient-facing content
4. **No `!important` overrides** across system boundaries
5. **Shared:** Both systems use Montserrat (font import in `fonts.css` is shared)

---

## OOUX/ORCA Object Model

The UI is structured around five anchored domain objects:

### Patient

The identity object. Attributes: name, MRN, DOB/age, gender, conditions, allergies, emergency contact, primary provider. CTAs: Edit Profile, View Full History.

### Medication

Attributes: name, generic name, dosage, frequency, next dose, refill date, adherence rate, instructions, category. CTAs: **Log Dose (1-tap, primary)**, Set Reminder, Request Refill, View Detail.

Adherence color rules: >=90% Success | 70-89% Alert | <70% Critical.

### Observation

Vitals and lab results. Types: BP, Glucose, Weight, SpO2, Heart Rate. Each reading has a plain-language interpretation via `ReadingContext`. Status display: In Range (affirming copy), Elevated (discuss with doctor), High/Low (escalation CTA). CTAs: **Log New Reading**, View Trend (30-day), Share with Provider.

### Task

Care tasks with priority levels (High/Medium/Low) and status tracking (Pending/Complete/Overdue/Snoozed). CTAs: **Mark Complete (1-tap)**, Snooze, View Detail.

### Appointment

Scheduled visits with provider, modality (In-Person/Telehealth/Lab), preparation checklists, and countdown timers. CTAs: Add to Calendar, Get Directions, Prepare, Reschedule.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 |
| Routing | React Router 7 (Data Mode) |
| Styling | Tailwind CSS v4 |
| Typography | Montserrat (Google Fonts) |
| Icons | Lucide React |
| Animation | Motion (Framer Motion successor) |
| Charts | Recharts |
| Forms | React Hook Form |
| Toasts | Sonner |
| OTP Input | input-otp |
| Backend | Hono (Supabase Edge Functions) |
| Database | Supabase (KV Store) |
| Build | Vite |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Demo Credentials

- **App Password:** `pulse2026`
- **Lab Vault PIN:** `2026`

---

## Project Structure

```
/src
  /app
    /design
      tokens.ts              # HealthPulse: C, T, L, BRAND_NAME
      mediflow.ts            # MediFlow: MF_C, MF_T
      fluidSystem.ts         # MediFlow Fluid: FL_C, FL_T, FL_S, FL_BP
    /components
      /home                  # Dashboard cards
        PatientHeader.tsx
        ActiveStateCard.tsx
        MedicationsDueCard.tsx
        LatestVitalCard.tsx
        TodaysSummary.tsx
        RecentActivity.tsx
        RemindersSection.tsx
        CorrelationInsightCard.tsx
        AdherenceStreakCard.tsx
      /layout                # Structural layout (bridges both systems)
        RootLayout.tsx
        BottomNav.tsx         # Mobile nav (HealthPulse tokens)
        SideNav.tsx           # Desktop nav (MediFlow FL tokens)
      /shared                # Shared utility components
        ErrorBoundary.tsx
        StatusBadge.tsx
        ReadingContext.tsx
        GuidanceBadge.tsx
        PillVisualizer.tsx
        Sparkline.tsx
        LoadingSkeleton.tsx
      /medications           # Medication-specific components
        PillEditor.tsx
      /labs                  # Lab-specific components
        BloodPressureMonitor.tsx
        SugarLevelTracker.tsx
      /smart-dose            # Smart dose reminder system
      /ui                    # Generic UI primitives (shadcn/ui)
    /pages                   # Route-level page components
      Home.tsx
      MedicationsList.tsx
      MedicationDetail.tsx
      ObservationsList.tsx
      TasksList.tsx
      AppointmentsList.tsx
      LabVault.tsx
      ProfileView.tsx
      OnboardingWizard.tsx
      HealthProfileWizard.tsx
      MediFlowHub.tsx
      MediFlowVault.tsx
      DesignSystemPage.tsx
    /data
      api.ts                 # Typed frontend API client
      helpers.ts             # Hydration functions, formatters, domain types
      mockData.ts            # Mock data (only used by MediFlowVault)
    /hooks
      useHealthData.ts       # 20+ query hooks, 5+ mutation hooks
      DashboardContext.tsx   # Single-fetch dashboard provider
      useBreakpoint.ts       # Responsive breakpoint hook
    routes.ts                # React Router data mode configuration
    App.tsx                  # RouterProvider entry point
  /styles
    fonts.css                # Google Fonts import (Montserrat) - ONLY @import location
    theme.css                # CSS custom properties, base resets
/supabase
  /functions
    /server
      index.tsx              # Hono server with 35+ REST endpoints
      kv_store.tsx           # KV storage utility (protected)
```

---

## Design Tokens

### Typography Scale (Montserrat)

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `T.h1` | 26px | Bold 700 | Page titles |
| `T.h2` | 22px | Bold 700 | Section headers |
| `T.h3` | 19px | SemiBold 600 | Card titles |
| `T.body` | 18px | Regular 400 | Patient-facing content |
| `T.bodyMd` | 15px | SemiBold 600 | Card subtitles |
| `T.bodySm` | 13px | Regular 400 | Secondary text |
| `T.caption` | 14px | Medium 500 | Timestamps, labels |
| `T.micro` | 11px | Medium 500 | Metadata |
| `T.nano` | 10px | Bold 700 | Status chips |
| `T.pill` | 9px | Bold 700 | Tags (uppercase only) |

**Line height:** 1.6 body, 1.25 headings, 1.0 badges. **Reading level target:** Grade 6-8 Flesch-Kincaid.

### Spacing (8px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `L.touch` | 56px | Minimum touch target (WCAG 2.1) |
| `L.s1`-`L.s6` | 8-48px | Grid multiples |
| `L.rSm`-`L.rFull` | 8px-9999px | Border radius scale |

### Layer Styles

**Frosted Glass** (primary overlay surface):
```css
background: rgba(251, 251, 251, 0.06);
backdrop-filter: blur(20px);
border: 1px solid rgba(142, 175, 157, 0.18);
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.32);
border-radius: 20px;
```

**Card Surface** (secondary):
```css
background: #FBFBFB;
border: 1px solid rgba(142, 175, 157, 0.15);
border-radius: 16px;
box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
```

---

## Accessibility

HealthPulse treats accessibility as clinical necessity, not legal compliance.

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| Touch targets | >= 56px (mobile) | `L.touch` token enforced on all buttons |
| Color contrast | WCAG 2.1 AA (4.5:1 normal, 3:1 large text) | All tokens validated at design time |
| Color independence | Status NEVER by color alone | Triple signal: color + icon + text label |
| Focus indicators | Visible outline on keyboard focus | `:focus-visible` ring, 2px solid primary |
| Screen reader | All interactive elements have `aria-label` | Enforced in all components |
| Semantic HTML | `<nav>`, `<main>`, `<section>` with `aria-labelledby` | All page components |
| Live regions | `aria-live="polite"` on dynamic content | Dashboard cards, mutation feedback |
| Reading level | Grade 6-8 (Flesch-Kincaid) | Copywriting guideline |
| Line height | Minimum 1.5 body, 1.25 heading | Typography scale enforced |
| Motion | `prefers-reduced-motion` respected | Animation tokens have reduced variants |
| Keyboard nav | All elements reachable via Tab, activatable via Enter/Space | Full keyboard support |

### Accessibility KPIs

| Metric | Target |
|--------|--------|
| WCAG 2.1 AA contrast (all text) | 100% pass |
| Touch target >= 56px (mobile) | 100% compliance |
| Screen reader task completion | >= 80% success |
| Reading level (patient copy) | Grade 6-8 |
| Keyboard navigability | 100% |

---

## UX Guardrails

The following 14 guardrails are codified in the [UX & Design Guardrails](https://www.notion.so/31caf6f9db6e8122946fd038ad392a98) document and must be verified before every merge:

1. **Minimized Cognitive Load** &mdash; Progressive disclosure by default; max 3-5 cards per section; one primary CTA per card
2. **Visual Indication: Never Color Alone** &mdash; Every status uses color + icon + text label together via `StatusBadge`
3. **56px Minimum Touch Targets** &mdash; All interactive elements meet `L.touch` (56px)
4. **Meaningful Feedback Loops** &mdash; Every action produces immediate, contextual feedback; no generic toasts
5. **Frosted Glass Layer Style** &mdash; Modals and overlays use `C.frostedBg` + `C.frostedBlur`
6. **8px Grid System** &mdash; All spacing follows 8px base grid
7. **Montserrat Typography Scale** &mdash; No ad-hoc font sizes; all text from `T.*` tokens
8. **Muted Healing Palette** &mdash; No new hex values; all colors from `tokens.ts`
9. **WCAG 2.1 AA Compliance** &mdash; Contrast, ARIA, focus states, keyboard nav
10. **OOUX/ORCA Object Model** &mdash; Five anchored objects with typed data flow
11. **Contextual Guidance** &mdash; `ReadingContext` below every biometric; Grade 6-8 reading level
12. **Dark Shell + Light Content** &mdash; Dark frames/headers, light content cards for figure-ground separation
13. **Dual Design System Awareness** &mdash; Zero cross-system token contamination
14. **Token-Driven Development** &mdash; No hardcoded hex, font sizes, or spacing in components

### Pre-Merge Checklist

- [ ] Every status uses color + icon + text (never color alone)
- [ ] All touch targets >= 56px
- [ ] Cognitive load minimized (progressive disclosure, clear hierarchy)
- [ ] Every action produces meaningful feedback
- [ ] All colors from `tokens.ts` (no hardcoded hex)
- [ ] Text at correct scale from `T.*`
- [ ] Spacing on 8px grid
- [ ] All interactive elements have ARIA attributes
- [ ] Reading level Grade 6-8 for patient-facing text
- [ ] Loading states use skeletons (no blank screens)

---

## Sprint Roadmap

### Sprint 1 &mdash; Foundation (COMPLETE)

**Theme:** *"I can see my health in one place."*

Patient Dashboard, Medication List + Detail, Observations List, Tasks List, Appointments List, Lab Vault, Health Profile Wizard, Fluid Design System, WCAG 2.1 AA compliance.

### Sprint 2 &mdash; Meaningful Feedback Loops (COMPLETE)

**Theme:** *"My data tells me something useful."*

Biometric reading contextualization, 30-day trend sparklines, medication adherence streak tracker, plain-language lab interpretation, reading-level audit, appointment prep checklists.

### Sprint 3 &mdash; Behavioral Scaffolding (IN PROGRESS)

**Theme:** *"My app supports the habits that keep me healthy."*

All mutation hooks wired to UI, LabVault PIN-unlock restored, hardcoded hex audit, ErrorBoundary, Sonner toasts, Log Vitals quick-entry modal, aria-live regions, WCAG contrast audit.

### Sprint 4 &mdash; Personalization & Adaptivity (PLANNED)

**Theme:** *"My app knows where I am in my health journey."*

Illness-stage detection, personalized dashboard ordering, medication knowledge base, Spanish language support, dark mode, care team contacts.

### Sprint 5 &mdash; Care Coordination Expansion (PLANNED)

**Theme:** *"My app helps me and my care team work together."*

Health summary PDF export, caregiver access mode, secure messaging, referral management, emergency escalation.

### Sprint 6 &mdash; Predictive Intelligence (CONDITIONAL)

**Theme:** *"My app helps me prevent problems before they happen."*

BP/glucose trend prediction, refill prediction, appointment gap detection, CDS Hooks integration. Requires 90-day data and clinical safety review.

---

## Research Foundation

HealthPulse uses a mixed-methods, longitudinal UX research framework:

| Phase | Methods | Outputs |
|-------|---------|---------|
| Generative | Semi-structured interviews, diary studies, shadowing | Problem statements, personas, journey maps |
| Evaluative | Usability tests, cognitive walkthroughs | Severity-ranked issues, fix list |
| Longitudinal | Engagement analytics, experience sampling, 6-week diary | Retention patterns, habit formation data |

### Key Research Instruments

- **eHEALS** (Norman & Skinner, 2006) &mdash; eHealth literacy baseline
- **PAM-13** (Hibbard et al., 2004) &mdash; Patient activation measure
- **SUS** (Brooke, 1996) &mdash; Usability benchmark (target: >= 80)
- **NASA-TLX** (Hart & Staveland, 1988) &mdash; Cognitive load measurement

### Success Metrics

| Metric | Target |
|--------|--------|
| System Usability Scale | >= 80 ("Good") |
| Task Success Rate | >= 90% |
| Time-on-Task (log dose) | <= 8 seconds |
| Error Rate (medication log) | < 5% |
| NASA-TLX Mental Demand | < 50/100 |
| BP Status Comprehension | >= 80% correct |
| 30-day Retention | >= 65% |
| PAM-13 Score Change | +5 points |

---

## References

Key academic sources underpinning HealthPulse design decisions:

- ADA (2024). *Standards of Medical Care in Diabetes.*
- Arnhold, M. et al. (2014). Mobile applications for diabetics. *JMIR, 16*(1).
- Bandura, A. (1997). *Self-Efficacy: The Exercise of Control.* W.H. Freeman.
- Biessels, G.J. et al. (2006). Risk of dementia in diabetes mellitus. *Lancet Neurology, 5*(1).
- Bodenheimer, T. et al. (2002). Patient self-management of chronic disease. *JAMA, 288*(19).
- Cramer, J.A. et al. (2008). Medication compliance and persistence. *Value in Health, 11*(1).
- Graetz, I. et al. (2020). Patient-facing portal for hypertension care. *JAMIA Open, 3*(1).
- Grundy, Q. et al. (2019). Data sharing practices of medicines apps. *BMJ, 364*.
- Hagger, M.S. et al. (2017). Illness representations in Type 2 diabetes. *Psychology & Health, 32*(8).
- Hou, C. et al. (2016). Mobile phone interventions for type 2 diabetes. *Can. J. Diabetes, 40*(2).
- Klasnja, P. & Pratt, W. (2012). Healthcare in the pocket. *J. Biomedical Informatics, 45*(1).
- Kutner, M. et al. (2006). *The Health Literacy of America's Adults.* NCES.
- Mira, J.J. et al. (2015). Medication errors in chronic illness. *Patient Preference and Adherence.*
- Niessen, L.W. et al. (2022). Digital health fatigue in chronic disease. *JMIR.*
- Park, S. et al. (2020). Self-monitoring practices in mobile health apps. *JMIR.*
- Thakkar, J. et al. (2016). Text messaging for medication adherence. *JAMA Internal Medicine, 176*(3).
- Torous, J. et al. (2019). Consensus for digital mental health apps. *World Psychiatry, 18*(1).
- WHO (2003). *Adherence to Long-Term Therapies: Evidence for Action.*

---

## Documentation

Comprehensive project documentation is maintained in Notion:

- [UX Research Roadmap](https://www.notion.so/31baf6f9db6e81989795fe8e26fccb35) &mdash; Evidence-based patient needs and design strategy
- [Dual Design System Reference](https://www.notion.so/31baf6f9db6e819ca00bc93c0383c376) &mdash; HealthPulse + MediFlow token specification
- [UX & Design Guardrails](https://www.notion.so/31caf6f9db6e8122946fd038ad392a98) &mdash; 14 guardrails + pre-merge checklist
- [Frontend Guardrail Audit](https://www.notion.so/31caf6f9db6e81b59292cc24539e154d) &mdash; Sprint 3 priority areas with file paths and line numbers

---

*Built with care for people managing chronic conditions.*
