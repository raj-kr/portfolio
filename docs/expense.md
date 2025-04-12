# Monthly Expense

Let's break down the monthly cost of hosting a static Next.js website on AWS using S3 + CloudFront + Route 53, and possibly GoDaddy if your domain is there.

## 💰 Estimated Monthly Cost Breakdown (Low-to-Moderate Traffic)

| Service                 | Cost Range        | Notes                                          |
| ----------------------- | ----------------- | ---------------------------------------------- |
| S3 (Storage + Requests) | ~$0.01 – $2/month | Static files only — cheap unless heavy traffic |
| CloudFront (CDN)        | ~$1 – $10/month   | Depends on bandwidth and # of requests         |
| Route 53 (DNS)          | ~$0.50 – $1/month | $0.50/hosted zone + ~$0.40/million queries     |
| ACM (SSL Cert)          | Free              | Public SSL certs via ACM are 100% free         |
| GoDaddy Domain          | ~$10 – $20/year   | Only if your domain is purchased there         |

## 🔍 Example: Small Portfolio Site (~5K visitors/month)

| Resource            | Usage                        | Cost Estimate |
| ------------------- | ---------------------------- | ------------- |
| S3 Storage          | 50MB                         | ~$0.01        |
| S3 Requests         | 10K PUT + 100K GET           | ~$0.10        |
| CloudFront Data Out | 1GB traffic                  | ~$0.08        |
| CloudFront Requests | 100K                         | ~$0.02        |
| Route 53 DNS        | 1 hosted zone + 100K queries | ~$0.90        |
| ACM Certificate     | Valid for custom domain      | Free          |
| Total Monthly       |                              | ~$1.11        |

## 🚀 If You Go Viral (~500K visitors/month)

| Resource      | Usage                   | Cost Estimate |
| ------------- | ----------------------- | ------------- |
| S3            | More traffic, more GETs | ~$1 – $3      |
| CloudFront    | 10–50GB traffic         | ~$2 – $7      |
| Route 53      | ~1M DNS queries         | ~$1 – $2      |
| Total Monthly |                         | ~$5 – $12     |

### ✅ Ways to Reduce Cost

- Use CloudFront caching aggressively
- Minimize S3 file size (compress images, use .webp)
- Offload analytics to free tools like Plausible or Cloudflare Analytics
- Use next export (static only) to avoid server-side compute costs
