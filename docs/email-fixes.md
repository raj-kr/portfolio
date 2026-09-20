# Email fixes and deployment

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

Frontend deployment alone does **not** update either Lambda. With AWS credentials
configured, run from the repository root in Bash / Git Bash:

```sh
bash lambda/contact-form/scripts/deploy.sh
bash lambda/email-processor/deploy.sh
```

For the contact Lambda, native PowerShell is also supported:

```powershell
.\lambda\contact-form\scripts\deploy_windows.ps1
```

Scripts build fresh ZIPs, deploy code, and update runtime/configuration. They run
offline tests before deployment. Existing From/To settings are retained; use
`FROM_EMAIL` and `TO_EMAIL` (PowerShell: `-FromEmail` and `-ToEmail`) to override.
The Lambda roles need `ses:SendEmail` for the contact function and
`s3:GetObject` plus `ses:SendRawEmail` for forwarding. If S3 versioning is enabled,
the forwarder reads the event's version and also needs `s3:GetObjectVersion`.
The checked-in SES policy already includes both sending actions.

After the Lambdas, deploy the frontend through the existing GitHub workflow.
No live email has been sent or infrastructure changed as part of these fixes.

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
