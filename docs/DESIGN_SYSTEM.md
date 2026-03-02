# BeChad — Design System & Frontend Guidelines

This document outlines the visual identity, tone, and user interface specifications for the BeChad frontend. This will guide the development of the chat interface and branding (logo).

## 1. Brand Identity & Tone

**Name:** BeChad  
**Tagline:** Level Up in Life, Women, and Work.  
**Persona:** The ultimate masculine mentor — direct, grounded, unapologetic, and highly disciplined.

### The Voice (BeChad's Tone)

- **Direct & Confident:** No fluff, no hesitation. Straight to the point.
- **Action-Oriented:** Focuses on what to _do_, not just how to feel.
- **Mentor Figure:** Firm but supportive. Not condescending, but expects excellence.
- **Unapologetic:** Grounded in core masculine principles without watering them down.

---

## 2. Visual Aesthetics

The app must look **premium, modern, and serious**. It should avoid playful or overly colorful palettes. The design should evoke strength, clarity, and focus.

### Color Palette

| Usage               | Color Name    | Hex Code  | Description                                                                  |
| ------------------- | ------------- | --------- | ---------------------------------------------------------------------------- |
| **Primary Base**    | Deep Obsidian | `#0F172A` | Background color — sleek, dark mode default.                                 |
| **Surface Subdued** | Slate Gray    | `#1E293B` | Chat bubbles (user), secondary containers.                                   |
| **Accent / Action** | Chad Gold     | `#EAB308` | Primary buttons, active states, key highlights. Evokes value and excellence. |
| **Accent Alt**      | Crimson Red   | `#DC2626` | Warnings, aggressive highlights (use sparingly).                             |
| **Text Primary**    | Frost White   | `#F8FAFC` | Main reading text. Crisp and clear.                                          |
| **Text Muted**      | Silver        | `#94A3B8` | Timestamps, secondary text, placeholders.                                    |

### Typography

- **Headings / Display:** `Outfit` or `Inter` (Bold, uppercase where suitable). Strong, geometric, modern.
- **Body / Chat Text:** `Roboto` or `Inter` (Regular/Medium). Highly legible for long-form advice.

> **UI Feel:** Glassmorphism on dark backgrounds. Sharp borders or very subtle rounding (e.g., `rounded-md` instead of `rounded-full` for structural elements), giving it a more disciplined, structured feel.

---

## 3. Logo Requirements

The logo should be a simple, striking emblem that represents the brand.

**Concepts to explore:**

1. A stylized, minimalist Spartan or gladiator helmet (evoking discipline and battle-readiness).

**Color:** Primarily "Chad Gold" (#EAB308) on a "Deep Obsidian" background (#0F172A), or stark white/monochrome.

---

## 4. Frontend Component Specifications

The frontend will be built using **HTML5 + Tailwind CSS v4 + Vanilla JS**. It must be a single-page chat interface that works flawlessly on mobile and desktop.

### 4.1 Layout Structure

- **Header:** Sticky top bar. Contains the BeChad logo (left), and perhaps a minimalist settings/about icon (right).
- **Chat Container:** Scrollable main area. Background is Deep Obsidian (`bg-slate-900`).
- **Input Area:** Sticky bottom bar. Contains a textarea (auto-expanding) and a "Send" button.

### 4.2 Message Bubbles

**User Message:**

- Placement: Right-aligned
- Background: Slate Gray (`bg-slate-800`)
- Text: Frost White (`text-slate-50`)
- Border: Subtle top-right corner sharp, other corners rounded (`rounded-l-lg rounded-br-lg`).

**BeChad Message:**

- Placement: Left-aligned
- Background: Unboxed (transparent) or extremely subtle gradient. The focus is on the _words_.
- Avatar: Small BeChad logo next to the message.
- Text: Frost White (`text-slate-50`), with markdown rendering for bold/italic/lists.
- Accent: A left border in Chad Gold (`border-l-4 border-yellow-500 pl-4`) to denote the mentor's voice.

### 4.3 Interactive states

- **Typing Indicator:** A pulsing "BeChad is thinking..." or three subtle dots (`animate-pulse`).
- **Send Button:** Chad Gold background. On hover, slightly brightens. On click, subtle scale-down.
- **Input Focus:** When the user clicks the textarea, the border glows subtly with Chad Gold.

---

## 5. Technical Frontend Requirements

1. **API Integration:** Connects to `POST /api/chat` (Phase 2 backend).
2. **Markdown Parsing:** The response from OpenAI will contain markdown (bolding, numbered lists). The frontend must parse and render this cleanly (e.g., using `marked.js` and `DOMPurify`).
3. **Auto-Scroll:** The chat container must automatically scroll to the bottom when a new message arrives.
4. **State Management:** Keep the session history in memory so the user can scroll up and read past advice. Note: _We only send the current query to the backend currently, but the UI should visually retain the history._
5. **Responsiveness:** Tailwind classes must handle the transition from mobile (100% width, tight padding) to desktop (central constrained column, e.g., `max-w-3xl mx-auto`).
