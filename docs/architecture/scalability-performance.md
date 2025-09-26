# Scalability & Performance

- Multi-AZ Aurora with auto-scaling capacity units; read replicas for analytics.
- ECS Fargate auto-scaling based on CPU/memory/queue depth.
- CloudFront caching for static assets; API caching via API Gateway for read-heavy endpoints.
- Rate limiting per client; backpressure with SQS + DLQ for ingestion tasks.
- Use of connection pooling (RDS Proxy) to avoid exhaustion. Optimize ORMs with prepared statements.
