**Session Date:** 2025-09-25
**Facilitator:** Business Analyst Mary
**Participant:** Leon

## Executive Summary

**Topic:** 美容院财务管理系统头脑风暴

**Session Goals:** 聚焦可执行的财务管理功能需求，明确优先落地场景

**Techniques Used:** What If Scenarios（约 15 分钟）, Mind Mapping（约 20 分钟）, Morphological Analysis（约 15 分钟）

**Total Ideas Generated:** 29

**Key Themes Identified:**

- 多门店与多角色现金流透明化需求突出
- 需要兼顾当前集中录入与未来实时化的渐进式演进路径
- 报表与预警功能是提升管理效率的核心抓手

## 支撑资料清单

- `docs/templates/data_templates.md`：日常流水与现金交接模板说明，对应 CSV 字段释义。
- `docs/templates/daily_entry_template.csv`：日常流水样例数据，可直接用于后续系统导入原型与校验。
- `docs/templates/cash_handover_log_template.csv`：现金交接批次样例数据，示范长周期交接追踪。
- `docs/reports/daily_summary_layout.md`：日结/月结报表结构与自动验证脚本说明。
- `docs/reports/daily_summary_sample.csv`、`docs/reports/monthly_summary_sample.csv`：由脚本生成的日报/月报样例输出。
- `docs/planning/role_permissions_overview.md`：角色与权限矩阵、审批流程建议。
- `docs/planning/iteration_milestones.md`：迭代节奏规划与阶段目标。

## Technique Sessions

### What If Scenarios - 约 15 分钟

**Description:** 通过连续假设场景激发核心需求与痛点

**Ideas Generated:**

1. 系统需覆盖每日收入、成本、报销与美容师现金代管的全流程，支撑五家店与 4/6 分成模式下的运营洞察。
2. 自动识别美容师少报现金或预约数量的异常场景，并及时提醒介入核对。
3. 每日收尾生成门店与整体收入、客户数、成本支出的对比报告，满足当前集中录入与未来实时采集两种模式。
4. 数据录入阶段需兼容下班后批量录入与未来自动采集，同时界面简洁以适应不同文化水平的美容师。

**Insights Discovered:**

- 现金流相关的异常检测是信任体系的核心诉求。
- 报表必须同时满足合伙人对现金流与利润分配的透明化需求。

**Notable Connections:**

- 未来排班等功能可与财务流水打通，为运营决策形成闭环。

### Mind Mapping - 约 20 分钟

**Description:** 围绕系统核心板块展开分支梳理，构建需求全貌

**Ideas Generated:**

1. 收入管理：记录门店/美容师粒度的收入、客户数、毛利、均摊成本；区分现金与转账；比对预约金额与服务时长；支持门店/美容师/项目等多维汇总；提供历史趋势与异常提醒。
2. 成本管理：覆盖租金、水电、保险、耗材、维护人工、广告费等类型；记录付款方（你或合伙人）；支持 OCR 录入；与门店/项目关联；区分一次性与周期性成本。
3. 现金流管理：追踪美容师代收金额、交款时间与应得收入差异；基于“收入-成本”自动计算合伙人利润并平分；完整记录现金流入/流出直至平账；合伙人权限一致；保留操作日志。
4. 数据录入：移动端、PC、微信小程序全覆盖；多人协同录入；提供 OCR、语音、模板化表单；界面简洁易用；逐步从集中录入演进到实时录入。

**Insights Discovered:**

- 系统需兼顾经营统计与现金监管双重目标。
- 操作简化与多端支持是推动执行落地的关键。

**Notable Connections:**

- 数据录入与异常检测紧密关联，准确性决定后续分成与对账可靠性。

### Morphological Analysis - 约 15 分钟

**Description:** 设定关键参数并组合优先功能场景

**Ideas Generated:**

1. 场景 A（日终门店收入归档）：收入录入 × 合伙人 × 模板批量导入 × 自动对账+异常标记+操作日志 × 日结报告+Excel 导出。
2. 场景 B（成本票据入账与核对）：成本录入 × 合伙人 × OCR 录入 × 自动对账+操作日志 × 周/月报+Excel 导出。
3. 场景 C（实时语音上报与分成提醒）：收入录入 × 美容师 × 语音输入 × 异常标记+操作日志 × 微信提醒。

**Insights Discovered:**

- 日终归档是最快实现价值的场景，能立刻改进现金透明度。
- 成本 OCR 虽影响大，但落地复杂，需要规划实施节奏。
- 实时语音与微信提醒可作为后续轻量创新模块逐步上线。

**Notable Connections:**

- 三个场景形成从基础到创新的渐进式迭代路径。

## Idea Categorization

### Immediate Opportunities

_Ideas ready to implement now_

1. **场景 A：日终门店收入归档落地**
   - Description: 建立模板化批量导入与日结报告机制，实现门店收入、客户数、合伙人分成的日度透明。
   - Why immediate: 能迅速解决当前无系统汇总、对账困难的问题。
   - Resources needed: 数据模板设计、批量导入接口、日结报表与异常提示模块。
2. **收入异常检测与提醒**
   - Description: 基于录入数据识别美容师少报金额或时长的异常，并在日结报告中突出。
   - Why immediate: 直接回应当前最大的风险点。
   - Resources needed: 异常规则设定、告警逻辑、可视化标记。

### Future Innovations

_Ideas requiring development/research_

1. **场景 B：成本票据 OCR 与周期分析**
   - Description: 引入票据识别与成本分类，实现成本周/月度统计与利润核算联动。
   - Development needed: OCR 模型/服务对接、成本分类引擎、与利润模块的数据打通。
   - Timeline estimate: 中期规划，可在基础收入模块稳定后启动。

### Moonshots

_Ambitious, transformative concepts_

1. **AI 级财务风控助手**
   - Description: 结合实时数据与外部信息，智能预测现金缺口、异常趋势，并提供策略建议。
   - Transformative potential: 从被动对账升级为主动经营决策支持。
   - Challenges to overcome: 数据量积累、算法模型建设、团队使用习惯迁移。

### Insights & Learnings

_Key realizations from the session_

- 渐进式建设路径（集中录入 → 实时录入）能有效降低实施阻力。
- 合伙人最关注现金透明与利润对账，功能优先级需紧贴这一核心诉求。
- 简化操作与多端兼容是确保美容师参与度与数据质量的关键。

## Action Planning

### #1 Priority: 场景 A 日终门店收入归档

- Rationale: 最高影响、难度可控，直接解决当下痛点。
- Next steps: 设计数据模板 → 实现批量导入 → 开发日结报表与异常提示 → 验证多门店数据流程。
- Resources needed: 产品设计、后端数据处理、报表可视化、基础告警逻辑。
- Timeline: 4-6 周（含需求确认、设计、开发与试运行）。

### #2 Priority: 收入异常检测规则落地

- Rationale: 建立信任机制，防止少报风险。
- Next steps: 定义异常阈值 → 开发检测与提醒模块 → 与日结报告联动 → 制定处理流程。
- Resources needed: 数据分析、规则配置、通知机制。
- Timeline: 与场景 A 并行或紧随其后，约 2-3 周迭代。

### #3 Priority: 场景 B 成本票据 OCR 试点

- Rationale: 提升成本透明度，为利润核算打基础。
- Next steps: 选定 OCR 方案 → 设计成本分类流程 → 接入周/月报 → 小范围试点验证。
- Resources needed: OCR 服务对接、成本数据模型、报表开发。
- Timeline: 场景 A 稳定后启动，约 6-8 周。

## Reflection & Follow-up

### What Worked Well

- What If 情境帮助快速聚焦真实痛点。
- 思维导图让基础功能结构清晰可视化。
- 形态分析明确了优先迭代组合。

### Areas for Further Exploration

- 报表分析与排班/库存等未来模块的整合路线。
- 多端界面在低文化水平操作场景下的交互验证。

### Recommended Follow-up Techniques

- SCAMPER Method: 用于扩展报表与运营工具的创意。
- Question Storming: 深入挖掘实施过程中的潜在风险与疑问。

### Questions That Emerged

- 票据 OCR 的准确率和成本是否符合预期？
- 实时语音录入如何在不同门店网络环境下保证稳定性？

### Next Session Planning

- **Suggested topics:** 场景 A 的详细需求拆解、数据模板设计评审
- **Recommended timeframe:** 场景 A 需求原型完成后（约 2 周内）
- **Preparation needed:** 整理现有手工统计表格、确定报表口径与异常规则草案

---

_Session facilitated using the BMAD-METHOD™ brainstorming framework_
