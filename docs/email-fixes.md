# Email fixes and deployment

## Google Workspace setup

Contact submissions follow this route:

`Contact modal -> API Gateway -> contact-form-handler -> AWS SES -> mail@raj.kr (Google Workspace)`

SES continues sending notifications from `mail@raj.kr`. The recipient is now
`mail@raj.kr`, and Reply-To is the visitor's validated email address, so replying
in Gmail reaches the visitor. No Gmail password or SMTP credentials are needed.
The existing frontend API endpoint and contact modal need no changes.

Keep Google's MX records for incoming mail. Keep the SES domain verification
and DKIM DNS records alongside Google's DKIM records: the website still sends
through SES. With DMARC enabled, SES mail must pass an aligned DKIM or SPF check;
adding SES to the root SPF record alone does not guarantee alignment when using
SES's default MAIL FROM domain. See [SES DMARC authentication](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dmarc.html).

The old SES/S3 `email-processor` forwarder is no longer part of the normal
deployment. Do not rerun the legacy forwarding setup scripts or replace Google's
MX records with SES receiving records. Existing AWS resources and stored emails
are retained; after verifying Workspace delivery and DNS propagation, the old
receipt rules and forwarding triggers can be retired separately.

Both Lambda services now use the AWS SDK for JavaScript v3. Deployment scripts
create and update functions on Node.js 22, preserve unrelated environment
variables, remove the reserved `AWS_REGION` entry and obsolete `REPLY_TO_EMAIL`
override, and wait for Lambda updates to complete. Lambda supplies its own region.

## Changed behavior

- Contact replies always go to the validated visitor address, even if an old
  deployment still has `REPLY_TO_EMAIL` set.
- Fields must be strings, nonblank after trimming, and within the limits: name
  100 characters, email 254, message 5,000. JSON bodies are limited to 32 KiB.
- Email HTML escapes visitor input. Logs contain operation/request/message IDs
  instead of full submissions, addresses, headers, or provider error details.
- A hidden `website` field discards basic bot submissions without sending mail.
  This is limited spam protection, not a replacement for API throttling or CAPTCHA.
- The forwarder retains attachments and inline images using MIME, respects an
  original Reply-To when present, and otherwise uses the original From address.
- Forwarding failures throw so asynchronous Lambda retries work. The original
  message remains in S3. SES SendRawEmail has a 10 MB MIME size limit; larger
  forwards fail explicitly rather than losing their attachments.
- Repeated S3/Lambda events can still produce duplicate forwards. Exactly-once
  delivery is not implemented. Configure an on-failure destination to retain
  failed event details after retries are exhausted.
- Local development sends no email unless `VITE_CONTACT_API_BASE_URL` is set
  explicitly to an API base URL (without `/contact`). Use a separate test API.
  Production continues to use the existing API Gateway endpoint.
- Connection checks use OPTIONS and confirm reachability only, not SES delivery.
  All default Node test entry points use mocks and send no real email.

## Verify locally

Use Node.js 22 or newer. Run from the repository root:

```sh
npm --prefix lambda/contact-form ci
npm --prefix lambda/contact-form test
npm --prefix lambda/email-processor ci
npm --prefix lambda/email-processor test
node --test scripts/contact-api.test.js scripts/email-deployment.test.js
npm run build
```

The `Email regression checks` GitHub workflow tests both Lambdas without AWS
credentials. The existing frontend workflow also tests contact API behavior.

## Deploy

Frontend deployment alone does **not** update the contact Lambda. With AWS credentials
configured, run from the repository root in Bash / Git Bash:

```sh
bash lambda/contact-form/scripts/deploy.sh
```

For the contact Lambda, native PowerShell is also supported:

```powershell
.\lambda\contact-form\scripts\deploy_windows.ps1
```

Scripts build fresh ZIPs, deploy code, and update runtime/configuration. They run
offline tests before deployment. Contact deployment explicitly sets `TO_EMAIL`
to `mail@raj.kr`, replacing the old personal Gmail destination even on existing
functions. The existing From address and unrelated settings are retained; the
default From address is `mail@raj.kr`. Use `FROM_EMAIL` and `TO_EMAIL` (PowerShell:
`-FromEmail` and `-ToEmail`) for deliberate overrides. Clear any old `TO_EMAIL`
shell variable or set it to `mail@raj.kr` before using Bash or Command Prompt.
The Lambda roles need `ses:SendEmail` for the contact function and
`s3:GetObject` plus `ses:SendRawEmail` for forwarding. If S3 versioning is enabled,
the forwarder reads the event's version and also needs `s3:GetObjectVersion`.
The checked-in SES policy already includes both sending actions.

The Workspace recipient change requires only the contact Lambda deployment.
Future frontend changes use the existing GitHub workflow.
The contact Lambda migration has been deployed: Node.js 22, From/To
`mail@raj.kr`, and the obsolete reply override removed. The deployed package
hash matches the local ZIP; both the live Lambda and public API passed OPTIONS
checks. SES reports the domain verified, DKIM successful, and sending enabled.
No test email was sent, so final Workspace inbox delivery remains unverified.

To update only the recipient on an already deployed, current contact Lambda,
run this from the repository root with AWS credentials configured:

```sh
node lambda/configure-function.mjs contact-form-handler ap-south-1 --from=mail@raj.kr --to=mail@raj.kr
```

This preserves unrelated environment variables, removes the obsolete reply
override, and sets the runtime to Node.js 22. Use the full deployment command
above if the deployed code is older. Confirm afterward that Lambda's `TO_EMAIL`
is `mail@raj.kr` and SES has the domain identity verified with DKIM enabled in
`ap-south-1`. A successful API response confirms SES acceptance; check the
Workspace inbox and spam folder to verify final delivery of a test submission.

## AWS checks still required

Account access is needed to verify SES production access, identity/DKIM status,
active receipt rules, S3 permissions/triggers, quotas, and actual delivery. Add
API Gateway throttling/WAF or server-verified CAPTCHA for stronger abuse
protection. Configure an on-failure queue/destination for `email-processor`, with
the necessary execution-role permissions, and review log/S3 retention.

The older `setup-email-forwarding.sh` and `fix-*.sh` scripts replace bucket/rule
configuration and send real test messages. They are not required for deploying
these code fixes; use the deployment commands above for existing infrastructure.

References:

- [Lambda reserved variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)
- [Lambda asynchronous retries](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-error-handling.html)
- [SES raw-email limits](https://docs.aws.amazon.com/ses/latest/APIReference/API_SendRawEmail.html)
- [Nodemailer MIME composition](https://nodemailer.com/transports/stream)
