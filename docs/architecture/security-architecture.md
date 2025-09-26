# Security Architecture

- **Identity:** Cognito with MFA optional for partners; device tracking for mobile.
  -- **Network:** Private subnets for Beanstalk instances and RDS; public subnets only for ALB. Security groups restrict ingress to ALB and bastion host.
  -- **Encryption:** TLS 1.2+, SSE-S3 w/ KMS CMK, RDS encryption at rest, Secrets Manager for credentials.
- **Key Management:** KMS CMKs per environment; IAM policies enforce least privilege.
- **Zero Trust Measures:** AWS WAF (IP reputation, rate limiting), GuardDuty, Security Hub continuous monitoring.
- **Data Protection:** Field-level encryption for sensitive columns (e.g., payout bank info). Tokenization for audit.
- **Compliance:** Audit logging via PostgreSQL `audit_logs` partitions + CloudTrail; retention policies (7 years). GDPR/APAC data residency adhered by region selection.
