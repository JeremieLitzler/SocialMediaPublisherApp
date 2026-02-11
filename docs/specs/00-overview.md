# Project Overview: Social Media Sharing Assistant

## Vision

Streamline the process of sharing blog articles across multiple social media platforms (X, LinkedIn, Medium, Substack) by automating content extraction and formatting.

## Problem Statement

Currently, sharing a blog article requires:

- Navigating back and forth between blog and social platforms
- Copying the same information multiple times
- Manual formatting for each platform
- Significant time spent on Medium and Substack (longest processes)

## Goals

- Reduce time spent sharing articles to social media
- Ensure consistent formatting across platforms
- Automate UTM tag generation
- Provide one-click copy-to-clipboard functionality

## Target Users

- Blog author managing 2 blogs (English and French)
- Publishing to: X, LinkedIn, Medium, Substack

## Constraints

- Medium and Substack have no public API (manual complex posting required)
- X and LinkedIn have APIs but content is simple enough for copy/paste approach
- Blog is Hugo-generated static site hosted on Netlify
- Articles follow consistent HTML structure

## Success Criteria

- Two inputs (article URL + target social media) generates all platform-specific content
- Copy-to-clipboard functionality for all outputs
- Proper UTM tracking for each platform
- Handles bilingual content (EN/FR)
