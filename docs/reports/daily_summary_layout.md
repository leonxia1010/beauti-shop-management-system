# Daily & Monthly Summary Report Layout

## Header Metrics (Daily Summary)

- Report Date
- Total Stores Reporting
- Gross Revenue (All Stores)
- Total Customers
- Average Revenue per Customer
- Net Revenue After Beautician Share
- Same-Day Allocated Cost (按门店汇总)
- Net Profit After Cost
- Partner Profit Each

## Location Breakdown (Daily)

- Store Code / Store Name
- Customer Count
- Gross Revenue (Cash / Transfer / Other)
- Beautician Share
- Subsidy Total
- Net Revenue
- Allocated Cost (门店口径)
- Net After Cost
- Partner Profit Each
- Cash Received vs Variance
- Exception Count (少报/其他)
- Cash Handover Pending Count

## Top Beauticians Highlights (Daily)

- Top 3 by Gross Revenue
- Top 3 by Customer Count

## Exception Log (Daily)

- Store
- Beautician
- Entry Reference
- Variance Amount
- Exception Type (Short / Over / Missing Data / Other)
- Reported By
- Status (Open / Investigating / Resolved)
- Resolution Notes

## Cash Handover Tracker (Cross-Date)

- Handover Batch ID
- Store / Beautician (可选)
- Period Start / End
- Expected Cash vs Reported / Received
- Variance & Reason
- Handover Date / Method / Channel
- Received By / Approved By / Recorded By
- Supporting Attachment Links
- Status (Open / Pending / Closed)

## Monthly Summary (Derived from Daily Data)

- Month (YYYY-MM)
- Store Code / Store Name
- Active Days Count
- Customer Count
- Gross Revenue (Cash / Transfer / Other)
- Beautician Share & Subsidy
- Net Revenue
- Allocated Cost (按门店自动合计)
- Net After Cost
- Partner Profit Each (总额)
- Cash Received & Variance
- Exception Count
- Handover Pending Count

---

### 快速验证脚本

`scripts/generate_finance_reports.py` 会读取 `docs/templates/daily_entry_template.csv` 并生成：

- `docs/reports/daily_summary_sample.csv`
- `docs/reports/monthly_summary_sample.csv`

以上文件可用来校验数据口径、作为日结/月结报表的原型数据源。
