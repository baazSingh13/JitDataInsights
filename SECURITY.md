# Security policy

## Scope

This repository contains a static website and a Firebase contact-form client. It does not contain the neural accelerator implementation or an IP license service. The maintained website source is on the repository's main branch; no historical version support matrix is claimed.

## Reporting an issue

Use GitHub private vulnerability reporting if the repository has it enabled. Otherwise contact the repository owner privately through an established channel. If no private channel is available, request one without including vulnerability details. Do not post credentials, visitor messages, personal data or exploit details in a public issue.

The owner should establish a monitored security contact before production launch. No response-time guarantee is currently published.

## Deployment responsibilities

Firebase Security Rules and abuse controls must protect the live contact database. Browser-side validation and a public Firebase project key do not establish authorization. Review the deployment notes in README.md before publishing. Contact-service writes and live rules were not tested against production during this local review.

Keep service-account files, private keys, AMD license files, model weights and owner IP archives out of this repository and its deployment directory.
