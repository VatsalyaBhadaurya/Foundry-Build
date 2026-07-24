# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (main) | Yes |

## Reporting a Vulnerability

If you discover a security vulnerability, **do not open a public GitHub issue**.

Email: **vatbhadaurya@gmail.com**

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

You will receive a response within 72 hours. If the issue is confirmed, a fix will be released as soon as possible and you will be credited (unless you prefer to remain anonymous).

## Scope

In scope:
- API key exposure or leakage
- Authentication/authorization bypasses
- Injection vulnerabilities (prompt injection, SQL injection, etc.)
- Data exposure through the API
- CORS misconfigurations

Out of scope:
- Rate limiting abuse
- Social engineering
- Issues in third-party dependencies (report those upstream)

## Security Practices

- API keys are loaded from environment variables, never hardcoded
- `.env` files are blocked by `.gitignore`
- The repo contains only `.env.example` with placeholder values
- CORS origins are explicitly allowlisted in the backend
