# Contact Form Lambda

The contact modal posts to API Gateway, which invokes this Node.js 22 Lambda.
AWS SES sends a notification to `mail@raj.kr`, received in Google Workspace.
Replying in Gmail addresses the visitor who submitted the form.

## Deployment

From the repository root, with Node.js 22+ and AWS CLI credentials configured:

```powershell
.\lambda\contact-form\scripts\deploy_windows.ps1
```

Or in Bash / Git Bash:

```sh
bash lambda/contact-form/scripts/deploy.sh
```

These scripts install dependencies, run mocked tests, package the Lambda, deploy
its code, and update its runtime and email settings. Frontend deployment does
not deploy the Lambda. See [email deployment](../../docs/email-fixes.md) for the
Workspace migration and DNS requirements.

## Configuration

| Setting | Behavior |
| --- | --- |
| Function | `contact-form-handler` by default |
| Region | `ap-south-1` by default; Lambda supplies `AWS_REGION` |
| `FROM_EMAIL` | Defaults to `mail@raj.kr`; deployment preserves an existing sender unless overridden |
| `TO_EMAIL` | Defaults to `mail@raj.kr`; contact deployment replaces the old recipient with this address |
| Reply-To | Validated visitor email; the legacy `REPLY_TO_EMAIL` variable is ignored and removed during deployment |

Bash / Command Prompt accept `FROM_EMAIL` and `TO_EMAIL` environment overrides.
PowerShell accepts `-FromEmail` and `-ToEmail`. Clear an old `TO_EMAIL` shell
variable or explicitly set it to `mail@raj.kr` when deploying to Workspace.
Unrelated Lambda environment variables are preserved.

The Lambda execution role needs `ses:SendEmail` and CloudWatch logging access.
Keep the SES sender identity verified and DKIM enabled in the sending region.
Google handles incoming mail; Gmail SMTP credentials are not used by this form.

## Testing

```sh
npm --prefix lambda/contact-form ci
npm --prefix lambda/contact-form test
node --test scripts/email-deployment.test.js
```

Tests mock SES and do not send real emails. They cover the Workspace destination,
custom recipients, visitor Reply-To, field validation, HTML escaping, preflight,
honeypot handling, request limits, and provider failures. SES acceptance does
not by itself confirm inbox delivery.

## Monitoring

```sh
aws logs tail /aws/lambda/contact-form-handler --follow --region ap-south-1
```

Logs record request/message IDs without message contents or visitor addresses.
If delivery fails, check the Lambda recipient, SES identity/DKIM status, sending
permissions and quotas, and the Workspace inbox/spam folder.
