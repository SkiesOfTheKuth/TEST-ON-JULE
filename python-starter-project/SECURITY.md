# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| main    | ✅ |

## Reporting a Vulnerability

Please email **security@example.com** with the following details:
- Description of the vulnerability and potential impact
- Steps to reproduce (proof-of-concept preferred)
- Suggested remediation or workaround, if known

We aim to acknowledge reports within 48 hours and provide a remediation plan within 5 business days. If you have not
received a response, please follow up using the same thread.

## Disclosure Process

1. Reporter notifies maintainers through the contact above.
2. Maintainers acknowledge receipt and establish a secure communication channel.
3. A fix is developed and tested in a private branch.
4. CVE identifiers and release notes are prepared when applicable.
5. A coordinated disclosure is made with patched releases and attribution (if requested).

## Security Best Practices

- Never commit secrets. Use the provided `.env.example` and secret management tools.
- Rotate credentials at least every 90 days and immediately after suspected compromise.
- Enable multi-factor authentication on all services linked to deployments.

## Hardening Checklist

- [ ] CI passes security scanning jobs before deployment.
- [ ] Docker images are rebuilt regularly to receive OS security updates.
- [ ] Dependencies are reviewed and updated monthly.
- [ ] Observability alerts for anomalous behavior are in place.

## Responsible Disclosure Pledge

We will never pursue legal action against researchers who report vulnerabilities following this policy and act in good faith.
