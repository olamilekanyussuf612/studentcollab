# Student Collab

A study community for secondary school students. Ask questions, share notes,
run polls, and study smarter with AI-powered summaries, flashcards and quizzes.

## Stack

- **Frontend:** React 18 + Vite, plain CSS, Firebase (compat SDK)
- **Backend:** Node + Express, JSON file storage (`server/db.json`)
- **AI:** Google Gemini (`gemini-flash-latest` with automatic fallback)
- **Auth:** Firebase Authentication (email/password + Google)

## Features

- Firebase auth (email + Google)
- Class feed with 4 post types: Message, Image (URL), Poll, Question
- Upvotes, answers, poll voting
- 4 tools:
  - **Notepad** — auto-saving, PDF export via print
  - **Calculator** — keyboard support, history
  - **AI Assistant** — chat with Gemini
  - **Study** — paste notes → summary → auto flashcards → quiz
- Profile page with stats and recent activity

## Project structure
