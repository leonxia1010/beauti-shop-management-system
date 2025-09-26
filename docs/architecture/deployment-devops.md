# Deployment & DevOps

- **Local Development:** 使用 `docker-compose` 启动 API（NestJS）、Admin Web、PostgreSQL、Redis 以及辅助工具；共享 `.env` 配置以便与生产环境一致，支持后端/前端热重载。
- **Container Build:** 多阶段 Dockerfile（Node 20）统一构建前端静态资源与 NestJS 应用，CI 在 GitHub Actions 中执行 lint/test/build，并生成镜像推送至 ECR。
- **Environments:** dev → staging → prod；每个环境使用独立 AWS 账号，由 AWS Organizations 管理。
- **IaC:** AWS CDK (TypeScript) 管理 VPC、Elastic Beanstalk、RDS、Cognito、S3、SES 等资源，代码位于 `infra/cdk`。
- **CI/CD:** GitHub Actions 负责依赖安装、测试、构建 Docker 镜像并推送至 ECR，随后触发 CDK 或 Beanstalk 蓝绿部署；mobile 端通过 EAS/OTA 发布。
- **Secrets Management:** AWS Secrets Manager + SSM Parameter Store，禁止将秘钥写入仓库。
- **Artifact Storage:** Docker 镜像存放在 ECR，静态资源托管于 S3；内部 npm 包使用 GitHub Packages。
- **Release Strategy:** 遵循语义化版本与 conventional commits，生成自动变更日志；API 采用蓝绿部署，移动端采取分阶段发布（OTA + 应用商店）。
