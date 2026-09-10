# 事件目录 PRD

> **Lark 主文档**：[事件目录 PRD](https://ksgf73ukjokp.sg.larksuite.com/wiki/BiTown38EipLF3k8TJllGd35gHc)  
> 本文件为仓库留痕副本。**凡涉及系统通知 / 站内信 / Push 的业务需求，一律引用本文**；业务 PRD 只写触发时机，不在业务文档内维护模板。

---

## 1. 需求说明（给业务 & 消息中心）

| 项 | 规则 |
|---|---|
| 文档定位 | 消息中心 **唯一事件源**；按业务线分 §3.x 分类追加 |
| 事件命名 | `{domain}.{action}`，如 `invite_rebate.level.upgraded` |
| 事件编号 | 每个分类内事件按 **1、2、3…** 顺序编号，与后台事件目录序号一致 |
| 版本 | 目录 **只增不改**；变更已上线事件 → 原名 + `v2`、`v3`… |
| 模板变量 | 统一 `{{ variable }}`；须说明变量代表的业务字段 |
| 用户文案 | 每条事件须配置 **消息标题** + **消息正文**；正文首句须带敬语，统一以 `尊敬的用户（UID：{{ uid }}），` 开头（平台无用户昵称，称呼用 UID） |
| 业务 PRD 写什么 | **何时触发、发给谁** |
| 业务 PRD 怎么引用 | `见《事件目录PRD》§3.x` |

---

## 2. 后台「事件目录」页

| 列 | 说明 |
|---|---|
| 序号 | 分类内事件编号（1、2、3…） |
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

| 序号 | 事件 | 说明 | 触发 | 接收人 | 幂等 |
|---|---|---|---|---|---|
| 1 | `invite_rebate.level.upgraded` | 等级升级 | 00:00 UTC+8 快照后判定应升级 | 邀请人 | UID + 日期 + 目标等级 |
| 2 | `invite_rebate.level.buffer.started` | 降级保护开启 | 00:00 UTC+8 不达标，缓冲第 1 天 | 邀请人 | UID + 缓冲开始日 |
| 3 | `invite_rebate.level.downgraded` | 确定降级 | 缓冲第 8 日 00:00 UTC+8 仍不达标 | 邀请人 | UID + 降级执行日 |
| 4 | `invite_rebate.reclaimed` | 待结算回收 | 回收指令 **次日 0:00 批次执行成功**（提交不发） | 被回收 UID | 回收指令 ID |

**不发通知**：缓冲期第 5、7 天倒计时。

---

#### 1 · `invite_rebate.level.upgraded` · 等级升级

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ previous_level }}` | 升级前邀请等级（Lv0–Lv3） |
| `{{ current_level }}` | 升级后邀请等级（Lv0–Lv3） |
| `{{ previous_rebate_ratio }}` | 升级前返佣比例（%） |
| `{{ current_rebate_ratio }}` | 升级后返佣比例（%） |
| `{{ active_friends }}` | 当前活跃好友数（30 日内交易额 ≥ $10k） |
| `{{ direct_client_volume }}` | 下级累计交易量（USDT） |
| `{{ effective_at }}` | 新等级生效时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 邀请等级已升级

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），恭喜您的邀请等级已升级。

原等级：Lv{{ previous_level }}（{{ previous_rebate_ratio }}%）
新等级：Lv{{ current_level }}（{{ current_rebate_ratio }}%）

当前活跃好友：{{ active_friends }} 人
下级累计交易量：{{ direct_client_volume }} USDT

新等级将于 {{ effective_at }}（UTC+8）起生效。
升级时间：{{ occurred_at }}
```

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 2 · `invite_rebate.level.buffer.started` · 降级保护开启

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ current_level }}` | 当前邀请等级（Lv0–Lv3） |
| `{{ current_rebate_ratio }}` | 保护期内保留的返佣比例（%） |
| `{{ target_level }}` | 保护期结束后若仍不达标，预计降至的等级 |
| `{{ target_rebate_ratio }}` | 保护期结束后若仍不达标，预计降至的返佣比例（%） |
| `{{ buffer_end_at }}` | 7 日保护期结束时间（UTC+8） |
| `{{ active_friends }}` | 当前活跃好友数 |
| `{{ active_friends_required }}` | 当前等级门槛要求的活跃好友数 |
| `{{ direct_client_volume }}` | 下级累计交易量（USDT） |
| `{{ direct_client_volume_required }}` | 当前等级门槛要求的累计交易量（USDT） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 邀请等级保护已开启

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），您的邀请等级保护已开启。

近期活跃好友或交易量暂未达标，我们将为您保留当前返佣比例 7 天，请抓紧邀请好友交易吧。

当前等级：Lv{{ current_level }}（{{ current_rebate_ratio }}%）
保护期至：{{ buffer_end_at }}（UTC+8）

若到期仍未恢复条件，返佣比例将从 {{ current_rebate_ratio }}% 降至 {{ target_rebate_ratio }}%。

当前活跃好友：{{ active_friends }} / {{ active_friends_required }}
下级累计交易量：{{ direct_client_volume }} / {{ direct_client_volume_required }} USDT

开启时间：{{ occurred_at }}
```

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 3 · `invite_rebate.level.downgraded` · 确定降级

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ previous_level }}` | 降级前邀请等级（Lv0–Lv3） |
| `{{ current_level }}` | 降级后邀请等级（Lv0–Lv3） |
| `{{ previous_rebate_ratio }}` | 降级前返佣比例（%） |
| `{{ current_rebate_ratio }}` | 降级后返佣比例（%） |
| `{{ effective_at }}` | 新等级生效时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 邀请等级已调整

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），您的邀请等级已调整。

返佣比例已从 {{ previous_rebate_ratio }}% 调整为 {{ current_rebate_ratio }}%。
继续邀请好友提升交易量，随时可以升回来。

原等级：Lv{{ previous_level }}（{{ previous_rebate_ratio }}%）
新等级：Lv{{ current_level }}（{{ current_rebate_ratio }}%）
生效时间：{{ effective_at }}（UTC+8）

调整时间：{{ occurred_at }}
```

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 4 · `invite_rebate.reclaimed` · 待结算回收

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ reclaim_amount }}` | 本次回收的待结算返佣金额 |
| `{{ currency }}` | 金额币种（如 USDC） |
| `{{ reclaim_reason }}` | 回收原因（运营在后台填写） |
| `{{ executed_at }}` | 日结批次执行完成时间（UTC+8） |
| `{{ remaining_pending }}` | 回收后剩余待结算返佣余额 |
| `{{ reclaim_instruction_id }}` | 回收指令 ID（系统内部，可用于幂等） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 待结算返佣已调整

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），您的邀请返佣待结算金额已调整。

回收待结算金额：{{ reclaim_amount }} {{ currency }}
回收原因：{{ reclaim_reason }}
执行时间：{{ executed_at }}（UTC+8）

调整后剩余待结算返佣：{{ remaining_pending }} {{ currency }}

如有疑问，请联系在线客服或查看邀请返佣页「待结算收益」说明。
```

**默认配置：** 业务通知 · 较高 · 站内信 + App Push · 批次执行失败 **不发**

---

### 3.2 合伙人

**业务 PRD**：《[邀请合伙人无限层返佣系统](邀请合伙人无限层返佣系统.md)》（业务定义 · 后台管理 · 用户合伙人中心）  
**默认**：业务通知 · 站内信 + App Push

| 序号 | 事件 | 说明 | 触发 | 接收人 | 幂等 |
|---|---|---|---|---|---|
| 1 | `partner.agent.activated` | 成为代理 | 合伙人计划审核通过并「设置成一级代理」生效，或后台「新增一级合伙人」绑定/审批通过生效 | 新一级合伙人 UID | UID + 生效批次 ID |
| 2 | `partner.rebate_migrate.superior_notified` | 原上级 · 下级迁移 | 返佣关系迁移 **风控审批通过并即刻生效** | 迁移前 **原上级** UID | 迁移审批单 ID |
| 3 | `partner.violation.deducted` | 违规扣除 | 佣金对账批次中对合伙人 **调减实发** 且填写扣除原因后生效 | 被扣减合伙人 UID | UID + 结算日 + 批次 ID |

**不发通知**：合伙人计划驳回、审批流转（运营/风控侧）、日结放款到账（本期不做）。

---

#### 1 · `partner.agent.activated` · 成为代理

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（新一级合伙人，用于敬语称呼） |
| `{{ rebate_ratio }}` | 合伙人返佣比例（%） |
| `{{ activation_source }}` | 开通来源：`partner_application`（计划审核）/ `admin_bind`（后台绑定） |
| `{{ effective_at }}` | 合伙人资格生效时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 合伙人资格已开通

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），您的合伙人资格已开通。

返佣比例：{{ rebate_ratio }}%

请前往「合伙人管理中心」查看邀请链接与团队数据。
生效时间：{{ effective_at }}（UTC+8）

诚邀您继续拓展团队，邀请更多伙伴加入，共创更高返佣收益。
```

**默认配置：** 业务通知 · 普通 · 站内信 + App Push + Email

---

#### 2 · `partner.rebate_migrate.superior_notified` · 原上级 · 下级迁移

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（迁移前原上级，用于敬语称呼） |
| `{{ migrated_subject_uid }}` | 被迁移主体 UID（普通用户 / 直客 / N 级代理 / 一级代理） |
| `{{ migrated_subject_type }}` | 被迁移主体类型（如：普通用户、N 级代理、一级代理） |
| `{{ migrate_scope }}` | 迁移范围（如：本人、整伞迁移） |
| `{{ new_superior_uid }}` | 迁移后新上级 UID |
| `{{ effective_at }}` | 迁移生效时间（UTC+8） |
| `{{ migrate_approval_id }}` | 迁移审批单 ID（如 APR…） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 下级返佣关系已迁移

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），您的下级已完成返佣关系迁移。

被迁移主体 UID：{{ migrated_subject_uid }}（{{ migrated_subject_type }}）
迁移范围：{{ migrate_scope }}
新上级 UID：{{ new_superior_uid }}

生效时间：{{ effective_at }}（UTC+8）
审批单号：{{ migrate_approval_id }}
```

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

> **说明**：仅通知 **原上级**；迁移主体、新上级的通知本期不做。

---

#### 3 · `partner.violation.deducted` · 违规扣除

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（被扣减合伙人，用于敬语称呼） |
| `{{ settlement_date }}` | 结算日（UTC+8，如 2026-09-09） |
| `{{ original_rebate }}` | 调减前应发返佣金额 |
| `{{ violation_deduction }}` | 违规扣减金额（正数，展示绝对值） |
| `{{ actual_rebate }}` | 调减后实发返佣金额 |
| `{{ currency }}` | 金额币种（如 USDC） |
| `{{ deduction_reason }}` | 佣金扣除原因说明（后台「修改实发」填写，与用户端「违规 −$XX」同源） |
| `{{ settlement_batch_id }}` | 佣金对账批次 ID |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 合伙人佣金违规扣减

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），您的合伙人佣金存在违规扣减。

结算日：{{ settlement_date }}（UTC+8）
应发返佣：{{ original_rebate }} {{ currency }}
违规扣减：{{ violation_deduction }} {{ currency }}
实发返佣：{{ actual_rebate }} {{ currency }}

扣减原因：{{ deduction_reason }}

请前往合伙人管理中心「佣金管理」查看详情。
```

**默认配置：** 业务通知 · 较高 · 站内信 + App Push

---

### 3.3 体验金

**业务 PRD**：《[合约体验金&卡券中心页（后台/Web/APP）](合约体验金&卡券中心页（后台_Web_APP）.md)》  
**默认**：奖励通知 · 站内信 + App Push

| 序号 | 事件 | 说明 | 触发 | 接收人 | 幂等 |
|---|---|---|---|---|---|
| 1 | `trial_fund.credited` | 发放 | 批量发放 **审批通过** 后，卡券写入用户卡券中心（状态「可使用」） | 收券 UID | 发放批次 ID + UID + 卡券 ID |
| 2 | `trial_fund.unused_expired` | 未使用过期 | **卡券有效期** 到期，用户未激活（状态「可使用」→「已过期」） | 收券 UID | UID + 卡券 ID |
| 3 | `trial_fund.activated` | 使用体验金 | 用户在卡券中心 **激活** 成功（状态「可使用」→「已使用」） | 用户 UID | UID + 卡券 ID |
| 4 | `trial_fund.position_expired_reclaimed` | 体验金到期回收 | **开仓有效期** 到期，系统回收该卡券剩余体验金（状态「已使用」→「已失效」） | 用户 UID | UID + 卡券 ID + 回收流水 ID |

**不发通知**：划转回收、亏损/费用上限回收、风控强制回收、到期前提醒（卡券/开仓倒计时）本期不做。

---

#### 1 · `trial_fund.credited` · 发放

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ amount }}` | 体验金面额（USDC） |
| `{{ coupon_id }}` | 卡券 ID |
| `{{ activate_deadline }}` | 卡券激活截止时间（UTC+8） |
| `{{ grant_batch_id }}` | 发放批次 / 审批单关联 ID |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 合约体验金已发放

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），您的合约体验金已发放。

体验金面额：{{ amount }} USDC

请在 {{ activate_deadline }}（UTC+8）前前往卡券中心激活使用。
到账时间：{{ occurred_at }}
```

**默认配置：** 奖励通知 · 普通 · 站内信 + App Push + Email

---

#### 2 · `trial_fund.unused_expired` · 未使用过期

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ amount }}` | 过期作废的体验金面额（USDC） |
| `{{ coupon_id }}` | 卡券 ID |
| `{{ activate_deadline }}` | 原卡券激活截止时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 体验金已过期未使用

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），您的体验金卡券已过期未使用。

体验金面额：{{ amount }} USDC

该卡券未在 {{ activate_deadline }}（UTC+8）前激活，已自动作废。
如有新的体验金活动，请关注卡券中心。
```

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 3 · `trial_fund.activated` · 使用体验金

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ amount }}` | 本次激活注入合约账户的体验金面额（USDC） |
| `{{ coupon_id }}` | 卡券 ID |
| `{{ position_valid_until }}` | 开仓有效期截止时间 / 回收截止时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 体验金已激活

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），您的体验金已激活。

体验金面额：{{ amount }} USDC

体验金已注入合约账户，请在 {{ position_valid_until }}（UTC+8）前完成交易使用。
激活时间：{{ occurred_at }}
```

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 4 · `trial_fund.position_expired_reclaimed` · 体验金到期回收

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ coupon_id }}` | 卡券 ID |
| `{{ reclaimed_amount }}` | 本次回收的体验金金额（USDC） |
| `{{ position_valid_until }}` | 开仓有效期截止时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**消息标题：** 体验金已到期回收

**消息示例：**

```
尊敬的用户（UID：{{ uid }}），您的体验金已到期回收。

回收金额：{{ reclaimed_amount }} USDC

开仓有效期已于 {{ position_valid_until }}（UTC+8）结束，剩余体验金已从合约账户回收。
回收时间：{{ occurred_at }}
```

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

### 3.4 （待补充）

下一业务分类在此追加（如充提、合约、积分…），结构同 §3.1。
