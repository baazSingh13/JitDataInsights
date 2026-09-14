# Security policy

## Scope

This repository contains a static website with a contact form using the FormSubmit email relay. It does not contain the neural accelerator implementation or an IP license service. The maintained website source is on the repository's main branch; no historical version support matrix is claimed.

## Reporting an issue

Use GitHub private vulnerability reporting if the repository has it enabled. Otherwise contact the repository owner privately through an established channel. If no private channel is available, request one without including vulnerability details. Do not post credentials, visitor messages, personal data or exploit details in a public issue.

The owner should establish a monitored security contact before production launch. No response-time guarantee is currently published.

## Deployment responsibilities

The contact form posts visitor names, email addresses and messages to FormSubmit for delivery to the configured owner address. Default provider reCAPTCHA is retained; the browser also checks required fields and email syntax. Browser validation is usability protection, not server authorization. Do not disable provider abuse controls or add arbitrary recipients. The page discloses the external relay. Review FormSubmit retention and verify actual delivery after activation using README.md. Historical Firebase services and stored messages were not changed or deleted.

Keep service-account files, private keys, AMD license files, model weights and owner IP archives out of this repository and its deployment directory.
