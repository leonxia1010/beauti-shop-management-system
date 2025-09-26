# Project Brief: beauty-shop-management-system

## Executive Summary

beauty-shop-management-system 将打造一套面向连锁美容院的财务管理平台，聚焦“多门店 + 合伙人 + 自由美容师”模式下的现金流透明化。系统要解决现金收支分散、对账低效、利润分配不清等痛点，服务对象包括合伙人、门店管理员与美容师。核心价值主张是：用低门槛、跨终端的数字化工具，让每日经营状态、现金交接、成本分摊和利润结算一目了然，同时为未来实时化、智能化拓展打下基础。

## Problem Statement

- **现状及痛点**：五家门店日常收入与成本由多方手工记录，美容师通常以现金代收，合伙人与门店管理员需要互相核对。手工表格无法及时识别少报、漏报，导致利润分配和财务透明度低。
- **影响**：现金结算往往滞后 20 天才对账一次，运营方难以及时掌握门店健康度，也无法快速发现异常。对合伙人来说，现金变动和成本责任难以追踪，影响信任与决策速度。
- **现有方案缺陷**：通用财务软件或表格模板不支持 4/6 分成、补贴、多人交接等行业特有流程，且操作复杂，门店一线人员难以上手。
- **紧迫性**：随着门店扩张与自由美容师数量增长，现状会放大风险。尽快建立统一系统，可防范资金漏洞、加强合伙人合作基础，并为后续业务拓展（排班、库存、会员）提供数据底座。

## Proposed Solution

- **总体思路**：构建跨 Web 与移动端的轻量财务平台，支持日终录入、异常预警、现金交接批次管理、成本分摊与利润拆账。通过模板批量导入 + 移动端实时录入并行方案，兼顾当前操作习惯与未来升级。
- **差异化特征**：结合模板导入、OCR、语音输入、预警规则，专门处理“现金为主 + 多主体分成”的场景。提供日志化的现金交接批次与补贴管理，化解合伙人与美容师之间的信息不对称。
- **成功关键**：低学习成本（UI 简洁、流程贴合习惯）、稳健的数据结构（可追溯、可审计）、逐步演进路径（集中录入 → 实时化 → 智能提醒）。
- **高层愿景**：形成门店运营数据中心，未来叠加成本自动化、智能风控、经营预测等价值模块。

## Target Users

### Primary User Segment: 合伙人 / 财务负责人

- **画像**：多家门店的投资合伙人或财务主管，重视现金流与利润分配透明度。常在 PC 或平板查看报表。
- **行为与需求**：希望每日掌握收入、成本、利润、现金交接情况；需要快速发现异常并追踪处理；要有审计痕迹满足双方信任。
- **目标**：实时了解经营健康、确保利润按规则分配、降低财务纠纷风险。

### Secondary User Segment: 门店管理员（可含资深美容师）

- **画像**：负责日常记录与交接的门店管理者或核心美容师，文化程度参差不齐。
- **行为与需求**：下班后集中录入数据，未来希望可随手实时上报；需要简单清晰的界面和批量导入能力；要有补贴、报销等特殊记录入口。
- **目标**：降低录入工作量、减少错漏、协助门店顺利结算。

### Secondary User Segment: 美容师（自由合伙制）

- **画像**：独立接待顾客，手持现金结算，周期性与合伙人对账。
- **行为与需求**：录入个人服务记录、补贴请求、现金交接；查看自己的提成与差异提醒。
- **目标**：记录方便、结算准确、避免误差导致纠纷。

## Goals & Success Metrics

### Business Objectives

- 提升日常财务透明度，使合伙人对每日经营情况的可见度达到 100%。
- 建立标准化现金交接流程，确保差异在当日内被识别并跟进。
- 通过系统化报表，减少因错报/漏报导致的财务纠纷数量 ≥ 70%。

### User Success Metrics

- 门店管理员在 10 分钟内完成日终批量录入及异常检查。
- 美容师能在 3 分钟内完成一笔服务与现金交接记录。
- 合伙人每日登录查看核心报表的操作小于 5 次即可获取全部关键数据。

### Key Performance Indicators (KPIs)

- 报表生成准确率 ≥ 99%，异常告警响应时效 ≤ 1 日。
- 现金交接批次完成率（按计划周期） ≥ 95%。
- 系统月活跃门店数 ≥ 90%（5 家门店全覆盖）。
- 平均每月检测到的现金异常数量与人工处理耗时对比下降 50%。

## MVP Scope

### Core Features (Must Have)

- **日终收入录入与批量导入**：提供模板上传、字段校验、异常提示。
- **成本录入与分摊**：记录成本类别、付款人、门店归属，支持分摊结果展示。
- **现金交接批次管理**：创建批次、记录期望/实收/差异、审批与日志追踪。
- **利润分配与补贴**：自动计算合伙人利润、记录美容师补贴并影响净收入。
- **核心报表**：日结报表、月度汇总、异常列表，支持导出。
- **角色权限**：合伙人、门店管理员、美容师的差异化权限控制与数据范围。

### Out of Scope for MVP

- OCR 自动识别、语音实时录入（作为后续增强）。
- 微信小程序或第三方实时对账接入。
- 高级 BI 分析、AI 风控预测。
- 排班、库存、会员等非财务域功能。

### MVP Success Criteria

MVP 上线后 1 个月内，5 家门店全部使用系统完成日终录入与现金交接，且合伙人能够通过系统完成利润分配与异常处理，满足缩短结算周期、提高透明度的目标。

## Post-MVP Vision

### Phase 2 Features

- 成本 OCR 识别与自动分类试点。
- 实时语音录入 / 移动端推送提醒。
- 细分维度的自助分析（门店、项目、合伙人收益）。

### Long-term Vision

- 打造完整经营决策平台，涵盖排班、库存、会员、营销等模块，与财务数据打通形成闭环。
- 引入 AI 风控助手，预测现金缺口与潜在异常，并给出处理建议。

### Expansion Opportunities

- 拓展多城市、多品牌的 SaaS 化方案，支持更多连锁美容行业客户。
- 与第三方支付、银行接口集成，实现半自动或全自动对账。
- 提供合规与税务辅助模块，降低审计成本。

## Technical Considerations

### Platform Requirements

- **Target Platforms:** Web（PC 管理后台） + 移动端 App（React Native WebView/原生）
- **Browser/OS Support:** 现代浏览器（Chrome/Edge/Safari），移动端 iOS 13+ 与 Android 9+
- **Performance Requirements:** 支持每日 5+ 门店并发录入与查询，报表生成在 3 秒内完成

### Technology Preferences

- **Frontend:** Vite + React + TypeScript，shadcn/ui + Tailwind；移动端采用 React Native + NativeBase
- **Backend:** NestJS (TypeScript) + PostgreSQL，使用 Prisma ORM
- **Database:** Amazon RDS for PostgreSQL (Multi-AZ)，日志分表设计
- **Hosting/Infrastructure:** AWS（Elastic Beanstalk、S3、Cognito、SES、CloudWatch）

### Architecture Considerations

- **Repository Structure:** Nx Monorepo（apps + libs），统一 npm 管理
- **Service Architecture:** 单体 NestJS 服务 + Worker 环境（BullMQ），逐步演进至按域拆分
- **Integration Requirements:** Excel/CSV 导入导出、SES 邮件通知
- **Security/Compliance:** Cognito 认证、最小权限 IAM、HTTPS/TLS、数据库加密、审计日志保留

## Constraints & Assumptions

### Constraints

- **Budget:** 初期预算有限，优先使用 AWS 基础托管（Beanstalk + RDS），暂不引入高阶付费服务
- **Timeline:** 目标 4-6 周完成 MVP 并试运行，后续按迭代推进
- **Resources:** 团队规模小，需高复用、易上手的技术栈；一线员工培训时间有限
- **Technical:** 现阶段无自动采集能力，需兼容手工批量录入；网络环境参差需支持离线/延迟提交

### Key Assumptions

- 自由美容师愿意配合系统录入，且可通过移动端完成操作
- 合伙人可协调门店在统一时间内完成数据上报
- 各门店具备基础硬件（电脑/手机）与网络条件
- 未来若引入微信小程序，可基于现有 API 快速扩展

## Risks & Open Questions

### Key Risks

- **数据录入依赖人为操作**：若门店人员执行不到位，系统价值难体现
- **现金差异处理流程复杂**：需要明确处理时限和责任人，避免长时间悬而未决
- **预算受限**：可能限制 OCR、实时通知等功能的上线节奏
- **安全合规压力**：现金与个人信息较敏感，需持续评估安全措施

### Open Questions

- 是否需要支持多币种或外部支付渠道？
- 合伙人是否希望接入第三方会计/税务系统？
- 是否存在门店之间差异化流程（例如不同的成本分摊规则）？

### Areas Needing Further Research

- 目标用户对移动端实时录入的接受程度与培训需求
- OCR 与语音输入方案的成本对比与准确率评估
- 行业内类似产品的价格模型和功能对标

## Appendices

### C. References

- 头脑风暴结果：`docs/brainstorming-session-results.md`
- 架构基线：`docs/architecture.md`
- 角色权限与迭代规划：`docs/planning/role_permissions_overview.md`、`docs/planning/iteration_milestones.md`

## Next Steps

### Immediate Actions

1. 与 PM/架构师审阅本项目简要，确认关键目标与范围。
2. 结合 Brief 内容启动 PRD 编写（由 PM 负责），细化需求与验收标准。
3. 制定利益相关方沟通计划，明确上线节奏与培训安排。
4. 收集门店现有手工表格样本，验证字段涵盖度。

### PM Handoff

This Project Brief provides the full context for beauty-shop-management-system. Please start in 'PRD Generation Mode', review the brief thoroughly to work with the user to create the PRD section by section as the template indicates, asking for any necessary clarification or suggesting improvements.
