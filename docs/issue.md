# Issue: Automatic Scrolling Fails on Fast API Responses

## Description

When the user is scrolled to the absolute bottom of the chat container and asks a question that results in a rapid "not found" response from the backend (e.g., "I couldn't find relevant information..."), the bot's newly appended response does not scroll into view. The message remains hidden below the viewable area or behind the input container until the user manually scrolls or sends another message, which correctly forces a scroll update.

## Steps to Reproduce

1. Open the BeChad interface and populate the chat with enough messages to make the container scrollable.
2. Scroll to the absolute bottom of the chat area.
3. Send a question that the knowledge base cannot answer (e.g., "How do I become more disciplined?").
4. Wait for the response to load.
5. Notice that the chat viewport remains stuck at the user's question, and the user must manually scroll down to see the bot's response.

## Root Cause Analysis

The chat container utilizes a `MutationObserver` to automatically scroll (`behavior: "smooth"`) to the bottom whenever new content is appended.
When the user sends a message, a loading indicator is appended, which immediately triggers the observer to start a smooth scroll animation. Smooth scrolling typically takes ~400ms. If the backend API responds almost instantaneously (as it often does for fallback "not found" responses), the client script quickly removes the loading indicator and appends the final bot message. This immediately triggers a _second_ `MutationObserver` scroll event while the first smooth scroll animation is still in progress. The browser resolves these overlapping smooth scroll commands by aborting the animation entirely, leaving the chat container stranded at its old scroll position.

