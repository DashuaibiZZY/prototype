# 事件目录 PRD

> **Lark 主文档**：[事件目录 PRD](https://ksgf73ukjokp.sg.larksuite.com/wiki/BiTown38EipLF3k8TJllGd35gHc)  
> 本文件为仓库留痕副本。**凡涉及系统通知 / 站内信 / Push 的业务需求，一律引用本文**；业务 PRD 只写触发时机，不在业务文档内维护模板。

---

## 1. 需求说明（给业务 & 消息中心）

| 项 | 规则 |
|---|---|
| 文档定位 | 消息中心 **唯一事件源**；按业务线分 §3.x 分类追加 |
| 事件命名 | `{domain}.{action}`，如 `invite_rebate.level.upgraded` |
| 版本 | 目录 **只增不改**；变更已上线事件 → 原名 + `v2`、`v3`… |
| 模板变量 | 统一 `{{ variable }}` |
| 业务 PRD 写什么 | **何时触发、发给谁** |
| 业务 PRD 怎么引用 | `见《事件目录PRD》§3.x` |

---

## 2. 后台「事件目录」页

| 列 | 说明 |
|---|---|
| 事件 | 系统事件 ID |
| 业务线 | §3 分类名 |
| 关联通知规则 | 消息中心配置 |
| 近 24h 调用 / 失败率 / 最后调用 | 监控 |
| 运行状态 | 启用 / 停用 |
| 操作 | 详情：基本信息 · 可引用变量 · 关联规则 |

---

## 3. 事件分类

> 新增业务：复制 §3.1 结构，改序号与事件表即可。

### 3.1 邀请返佣

**业务 PRD**：《[邀请返佣（Web/APP）](邀请返佣（Web_APP）.md)》  
**默认**：业务通知 · 站内信 + App Push

| 事件 | 说明 | 触发 | 接收人 | 幂等 |
|---|---|---|---|---|
| `invite_rebate.level.upgraded` | 等级升级 | 00:00 UTC+8 快照后判定应升级 | 邀请人 | UID + 日期 + 目标等级 |
| `invite_rebate.level.buffer.started` | 降级保护开启 | 00:00 UTC+8 不达标，缓冲第 1 天 | 邀请人 | UID + 缓冲开始日 |
| `invite_rebate.level.downgraded` | 确定降级 | 缓冲第 8 日 00:00 UTC+8 仍不达标 | 邀请人 | UID + 降级执行日 |
| `invite_rebate.reclaimed` | 待结算回收 | 回收指令 **次日 0:00 批次执行成功**（提交不发） | 被回收 UID | 回收指令 ID |

**不发通知**：缓冲期第 5、7 天倒计时。

#### 变量与示例

**`invite_rebate.level.upgraded`**

- 变量：`user_nickname` `previous_level` `current_level` `previous_rebate_ratio` `current_rebate_ratio` `active_friends` `direct_client_volume` `effective_at` `occurred_at`
- 示例：尊敬的 {{ user_nickname }}，恭喜您的邀请等级已升级。Lv{{ previous_level }}（{{ previous_rebate_ratio }}%）→ Lv{{ current_level }}（{{ current_rebate_ratio }}%），{{ effective_at }}（UTC+8）起生效。

**`invite_rebate.level.buffer.started`**

- 变量：`user_nickname` `current_level` `current_rebate_ratio` `target_level` `target_rebate_ratio` `buffer_end_at` `active_friends` `active_friends_required` `direct_client_volume` `direct_client_volume_required` `occurred_at`
- 示例：您的邀请等级保护已开启，保留 {{ current_rebate_ratio }}% 共 7 天；未达标将降至 {{ target_rebate_ratio }}%。保护期至 {{ buffer_end_at }}（UTC+8）。

**`invite_rebate.level.downgraded`**

- 变量：`user_nickname` `previous_level` `current_level` `previous_rebate_ratio` `current_rebate_ratio` `effective_at` `occurred_at`
- 示例：返佣比例已从 {{ previous_rebate_ratio }}% 调整为 {{ current_rebate_ratio }}%，{{ effective_at }}（UTC+8）起生效。

**`invite_rebate.reclaimed`**（风险等级：较高 · 批次失败不发）

- 变量：`user_nickname` `reclaim_amount` `currency` `reclaim_reason` `executed_at` `remaining_pending` `reclaim_instruction_id` `occurred_at`
- 示例：待结算已调整：回收 {{ reclaim_amount }} {{ currency }}，原因 {{ reclaim_reason }}，剩余 {{ remaining_pending }} {{ currency }}。

---

### 3.2 （待补充）

下一业务分类在此追加（如充提、合约、积分…），结构同 §3.1。
