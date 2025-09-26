# Observability

- **Logging:** Structured JSON logs shipped to CloudWatch; retention policy per environment.
- **Tracing:** Lightweight tracing via OpenTelemetry + AWS X-Ray (optional) with sampling to control cost.
- **Metrics:** CloudWatch dashboards for API latency, error rates, queue depth, ingestion success. Business metrics emitted via CloudWatch EMF.
- **Alerts:** CloudWatch Alarms -> SNS/email (partners) + optional Feishu/WeChat webhook; escalate on sustained 5xx, login failures, cash variance spikes.
- **Audit:** PostgreSQL `audit_logs` table with row-level security; periodic export to S3 via cron for cold storage.
