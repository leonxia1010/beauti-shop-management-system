# Monitoring & Observability

- **Frontend Monitoring:** Datadog RUM or LogRocket (capture UX metrics, console errors). Edge logs in CloudFront.
- **Backend Monitoring:** CloudWatch dashboards, AWS X-Ray traces, Container Insights. Optional Datadog integration.
- **Error Tracking:** Sentry for unified error pipeline (web/mobile/backend). Use release health dashboards.
- **Performance Monitoring:** CloudWatch Synthetics for uptime, Lighthouse CI for web performance regression.

## Key Metrics

Frontend Metrics:

- Core Web Vitals (LCP, FID, CLS)
- JavaScript error rate per 1k sessions
- API call success rate per channel
- Offline sync success %

Backend Metrics:

- API p95 latency & 5xx rate
- Queue backlog size (SQS)
- Aurora CPU/ACU usage, connection count
- Cash handover variance > threshold count
