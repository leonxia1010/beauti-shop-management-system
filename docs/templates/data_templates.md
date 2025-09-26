# 财务数据模板概览

## 1. 日常流水模板 (`daily_entry_template.csv`)

| 字段                 | 说明                               | 示例                       |
| -------------------- | ---------------------------------- | -------------------------- |
| entry_date           | 业务日期 (`yyyy-mm-dd`)            | 2025-09-25                 |
| store_code           | 门店代号                           | B1                         |
| store_name           | 门店名称                           | Central Store              |
| beautician_id        | 美容师编号                         | B1-LX                      |
| beautician_name      | 美容师姓名                         | Li Xia                     |
| service_type         | 服务/产品类别                      | Facial                     |
| payment_method       | 支付方式 (Cash / Transfer / Other) | Cash                       |
| appointment_ref      | 预约编号或备注                     | APPT-001                   |
| customer_count       | 客户数量                           | 1                          |
| service_duration_min | 服务时长（分钟）                   | 60                         |
| gross_revenue        | 总收入                             | 500                        |
| beautician_share     | 美容师分成                         | 300                        |
| beautician_subsidy   | 美容师补贴                         | 0                          |
| net_revenue          | 门店毛利                           | 200                        |
| allocatable_cost     | 当日门店可分摊成本                 | 40                         |
| net_after_cost       | 扣除成本后的净额                   | 160                        |
| partner_profit_each  | 合伙人当日应分利润                 | 80                         |
| cash_received        | 实收现金                           | 500                        |
| cash_short_over      | 现金差异                           | 0                          |
| entry_channel        | 录入渠道                           | Manual Template            |
| entered_by           | 录入人                             | Leon                       |
| entry_timestamp      | 录入时间                           | 2025-09-25 23:10           |
| cash_handover_from   | 交款人                             | Li Xia                     |
| cash_handover_to     | 收款人                             | Leon                       |
| handover_confirmed   | 交接是否确认 (Yes/No)              | Yes                        |
| handover_batch_id    | 对应交接批次 ID                    | H2025-09-B1-01             |
| handover_status      | 交接状态 (Settled/Pending/Open)    | Settled                    |
| exception_flag       | 异常标记 (Normal/Alert 等)         | Normal                     |
| exception_reason     | 异常原因说明                       |                            |
| notes                | 备注                               | Daytime VIP facial session |

> 更多样例可直接查看 `docs/templates/daily_entry_template.csv`。

## 2. 现金交接日志模板 (`cash_handover_log_template.csv`)

| 字段                | 说明                           | 示例                           |
| ------------------- | ------------------------------ | ------------------------------ |
| handover_batch_id   | 交接批次编号                   | H2025-09-B1-01                 |
| store_code          | 门店代号                       | B1                             |
| store_name          | 门店名称                       | Central Store                  |
| beautician_id       | 美容师编号（可为空代表整店）   |                                |
| beautician_name     | 美容师姓名（可为空）           | ALL                            |
| period_start        | 覆盖起始日期                   | 2025-09-01                     |
| period_end          | 覆盖结束日期                   | 2025-09-25                     |
| total_cash_expected | 期望交接金额                   | 8200                           |
| total_cash_reported | 美容师申报金额                 | 8200                           |
| total_cash_received | 实收金额                       | 8200                           |
| variance            | 差异金额                       | 0                              |
| variance_reason     | 差异原因                       |                                |
| handover_date       | 实际交接日期                   | 2025-09-25                     |
| handover_method     | 交接方式 (In-person/Transfer)  | In-person                      |
| handover_channel    | 渠道 (Cash/Bank)               | Cash                           |
| received_by         | 收款人                         | Leon                           |
| approved_by         | 审批人                         | PartnerA                       |
| recorded_by         | 记录人                         | Leon                           |
| recorded_at         | 记录时间                       | 2025-09-25 21:30               |
| attachments         | 附件路径或链接                 | receipt-20250925.jpg           |
| notes               | 备注                           | Periodical cash drop completed |
| status              | 批次状态 (Open/Pending/Closed) | Closed                         |

## 3. 支持脚本

- `scripts/generate_finance_reports.py`：读取日常流水模板，生成 `docs/reports/daily_summary_sample.csv` 和 `docs/reports/monthly_summary_sample.csv` 作为日报/月报样例。
- `scripts/migrate_legacy_template.py`：可选，若未来需要导入旧版 Excel 记录，可用该脚本转换为新模板格式。

> 以上模板与脚本为架构设计与后续开发提供参考，可根据实际实现进行扩展。
