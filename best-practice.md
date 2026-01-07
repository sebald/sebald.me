# Best Practices: Preparing Blog Content for LLMs

Creating a single context file for Large Language Models requires strict attention to structure and metadata. Follow these guidelines to ensure the model understands the semantic boundaries and temporal context of your writing.

## 1. File Format

- **Use Markdown (.md):** This is the native language of most LLMs. It consumes fewer tokens than JSON/XML while preserving hierarchy (headers, lists, and code blocks).

## 2. Structural Delimiters

You must prevent the model from merging separate articles into one context. XML-style tags are the most robust method for this.

- **Wrapper:** Wrap each post in `<article>` tags.
- **IDs:** Optionally add an ID to the tag for referencing, e.g., `<article id="post-slug">`.

## 3. Critical Metadata

Inject a metadata block at the very top of every entry. This allows the LLM to understand _when_ something was written (crucial for technical obsolescence) and _where_ it comes from.

**Required Fields:**

- **Title:** The clear header of the post.
- **Date:** ISO Format (YYYY-MM-DD). This is vital for temporal reasoning.
- **URL:** Enables the model to cite the specific source link.
- **Topics:** Helps with thematic grouping.

## 4. Content Cleaning Rules

Maximize the "signal-to-noise" ratio to save context window space.

- **Strip Boilerplate:** Remove headers, footers, navbars, and script topics.
- **Flatten HTML:** Convert HTML tables or divs into standard Markdown.
- **Remove Media:** Delete base64 strings or complex `<img>` topics. Replace them with simple alt text like `[Image: Diagram of Architecture]`.
- **Preserve Code:** Ensure code blocks utilize proper fences (\`\`\`) as this is high-value data.

## 5. Ideal Output Structure

Your final file should follow this pattern:

```markdown
# Blog Archive

<article>
Title: How to Configure TypeScript
Date: 2026-01-01
URL: [https://yourblog.com/typescript-config](https://yourblog.com/typescript-config)
Topics: Dev, TypeScript

## Introduction

Here is the content of the first post...

</article>

<article>
Title: Tailwind CSS 4 Guide
Date: 2025-12-17
URL: [https://yourblog.com/tailwind-4](https://yourblog.com/tailwind-4)
Topics: CSS

## Overview

Here is the content of the second post...

</article>
```
