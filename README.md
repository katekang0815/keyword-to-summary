# YouTube Scraper with AI Summaries project

## Project info

**URL**: [https://lovable.dev/projects/a24ceb18-a38c-4a69-8f04-41606a1439b6](https://keyword-to-summary.lovable.app/)

## Overcoming YouTube Transcript API Limitation:

💡 Approach: Apify Actor + Workflow Integration
 • Transcript Fetching: Successfully integrated Apify Actor to fetch YouTube transcripts.
 • Workflow Automation: Connected the process into an n8n workflow for seamless automation.
 • AI-Powered Summarization: Leveraged LangChain to generate customized video summaries.
 • Relevant Video Discovery: Used an AI agent and SerpAPI to extract related videos from Google Search.
 • Frontend Integration: Set up a webhook to receive URLs from the frontend and return results via n8n.
 
➡️  Next Steps
 • Handle Longer Videos: Currently, the workflow processes videos up to ~20 minutes. Planning to extend this limit.
 • Upgrade Audio Quality: Improve AI-generated audio to sound more human-like.
 • Multiple API Options: Develop multi-API support for authenticated users.
 • Improve uploading time (currently too long)

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

