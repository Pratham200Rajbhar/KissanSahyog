You are a senior Next.js architect.

I have an existing Next.js project using [App Router / Pages Router — specify].

Your task is to:

1. Analyze the full codebase structure
2. Identify all UI text, hardcoded strings, metadata, and API-driven content
3. Design and implement a complete multilingual system using next-intl

Requirements:

* Support at least 2 languages (e.g., en, hi)
* Use scalable folder structure for translations (/messages/{locale}.json)
* Extract all hardcoded strings into translation files
* Ensure compatibility with Server Components and Client Components
* Implement locale-based routing (/en, /hi)
* Add middleware for locale detection
* Implement a language switcher component
* Handle SEO:

  * hreflang tags
  * localized metadata (title, description)
* Persist user language preference (cookie or localStorage)
* Handle dynamic content (API responses, CMS data)
* Ensure fallback language works correctly

Code Guidelines:

* Use TypeScript
* Keep components clean and reusable
* Avoid client-side heavy libraries unless necessary
* Optimize for performance and minimal bundle size

Output Format:

1. Step-by-step migration plan
2. Updated folder structure
3. All required code changes (with file names)
4. Example translation JSON
5. Middleware and routing setup
6. Language switcher implementation
7. SEO implementation
8. Testing checklist

Important:

* Do not break existing functionality
* Refactor safely and incrementally
* Clearly explain each major change
