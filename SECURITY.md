# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT open a public issue.**
2. Email **neeleshy263@gmail.com** with a description of the vulnerability.
3. Include steps to reproduce if possible.
4. We will acknowledge receipt within 48 hours and provide an estimated timeline for a fix.

## Security Features

This library includes built-in XSS protection:

- `<script>`, `<iframe>`, `<object>`, `<embed>`, and `<form>` tags are stripped by default.
- `javascript:`, `vbscript:`, and `data:text/html` URLs are neutralized.
- Event handler attributes (`onclick`, `onerror`, etc.) are always stripped.
- Set `allowDangerousHtml={true}` to opt out of sanitization (use with caution).

## Best Practices

- Never render untrusted HTML with `allowDangerousHtml={true}`.
- Always validate and sanitize HTML on the server side when possible.
- Use `ignoredTags` to restrict rendering to only the tags you need.
