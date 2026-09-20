# Unknown URLs on S3 and CloudFront

React Router can redirect unknown paths only after the app document loads.
An S3 object such as `/asdf` does not exist, so CloudFront must serve
`/index.html` for origin 403 and 404 responses with HTTP status 200.
The app then redirects the visitor to `/` and displays the maintenance page.

The deployment workflow now configures this fallback after uploading the build,
waits for CloudFront deployment, then invalidates cached responses. It preserves
the existing origins, cache behaviors, certificate, and other error responses.
The fallback applies to all origin 403/404 responses, including missing assets;
it is appropriate for this public static site, not for private API responses.

The deployment AWS identity needs these additional permissions on the existing
distribution:

- `cloudfront:GetDistributionConfig`
- `cloudfront:UpdateDistribution`
- `cloudfront:GetDistribution`

Existing S3 upload and `cloudfront:CreateInvalidation` permissions are still required.
If the workflow reports AccessDenied, grant these permissions and rerun it.

For manual configuration in CloudFront, select the raj.kr distribution and add
custom error responses for **403** and **404**, each with response page
`/index.html`, response code **200**, and error caching minimum TTL **0**.
Set the default root object to `index.html`, wait for deployment, and invalidate
`/*` so cached 403 responses are removed. Keep the S3 bucket private.

Verify after deployment by opening `/asdf` and a nested path in a fresh tab.
Both should load the app and redirect to `/`. `/favicon.ico` should return an
icon. The existing ICO asset is included in `public/` for browsers that request
this conventional path; the main document continues to use `favicon.svg`.

AWS references:

- [Custom error responses](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/creating-custom-error-pages.html)
- [Updating a distribution safely](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/update-distribution.html)
