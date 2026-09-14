# Security policy

## Scope

This repository contains a static website with direct email contact links. It does not contain the neural accelerator implementation or an IP license service. The maintained website source is on the repository's main branch; no historical version support matrix is claimed.

## Reporting an issue

Use GitHub private vulnerability reporting if the repository has it enabled. Otherwise contact the repository owner privately through an established channel. If no private channel is available, request one without including vulnerability details. Do not post credentials, visitor messages, personal data or exploit details in a public issue.

The owner should establish a monitored security contact before production launch. No response-time guarantee is currently published.

## Deployment responsibilities

The current site has no contact backend. Email links open the visitor's email app; the visitor sends the message through their email provider. No website form submission or database write is involved. Historical Firebase configuration and data were not changed or deleted; any existing backend remains the owner's responsibility. Review the deployment notes in README.md before publishing.

Keep service-account files, private keys, AMD license files, model weights and owner IP archives out of this repository and its deployment directory.
