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
| 触达渠道 | 仅 **站内信** + **App Push**（不支持 Email / SMS 等） |
| 文案结构 | **站内信**与 **Push 分别配置**；Push 须更短（短标题 + 一句正文），不得复用站内信全文 |
| 站内信 | 须配置 **标题** + **正文**；正文首句须带敬语，统一以 `尊敬的用户（UID：{{ uid }}），` 开头（平台无用户昵称，称呼用 UID） |
| 业务触发说明 | 每条事件须写 **业务触发**，标明原业务 PRD 中哪段逻辑会触发站内信（原业务文档已封板时，以本目录为准） |
| 业务 PRD 写什么 | **何时触发、发给谁**（封板文档除邀请返佣外不再改模板；新文档只引用 §3.x） |
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
> **单条事件结构**：业务触发 → 变量表 → **站内信**（标题 + 正文）→ **Push**（标题 + 正文）→ 默认配置。

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

**业务触发：** 《[邀请返佣（Web/APP）](邀请返佣（Web_APP）.md)》§1 日结与等级更新 · **等级更新**：每日 00:00（UTC+8）快照后，应属等级 **高于** 当前等级，实时升级并记录升级时间。

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

**站内信标题：** 邀请等级已升级

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），恭喜您的邀请等级已升级。

原等级：Lv{{ previous_level }}（{{ previous_rebate_ratio }}%）
新等级：Lv{{ current_level }}（{{ current_rebate_ratio }}%）

当前活跃好友：{{ active_friends }} 人
下级累计交易量：{{ direct_client_volume }} USDT

新等级将于 {{ effective_at }}（UTC+8）起生效。
升级时间：{{ occurred_at }}
```

**Push 标题：** 邀请等级已升级

**Push 正文：** 您的邀请等级已升至 Lv{{ current_level }}，返佣 {{ current_rebate_ratio }}%

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 2 · `invite_rebate.level.buffer.started` · 降级保护开启

**业务触发：** 《[邀请返佣（Web/APP）](邀请返佣（Web_APP）.md)》§1 · **7 日缓冲期**：每日 00:00（UTC+8）等级快照发现 **不满足当前等级门槛**，进入保护状态（缓冲第 1 天）。

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

**站内信标题：** 邀请等级保护已开启

**站内信正文：**

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

**Push 标题：** 等级保护已开启

**Push 正文：** 返佣比例将保留 7 天，请抓紧邀请好友交易

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 3 · `invite_rebate.level.downgraded` · 确定降级

**业务触发：** 《[邀请返佣（Web/APP）](邀请返佣（Web_APP）.md)》§1 · **缓冲期结束**：7 日保护期结束后 **第 8 日 00:00（UTC+8）** 仍不满足条件，执行降级并更新返佣比例。

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

**站内信标题：** 邀请等级已调整

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的邀请等级已调整。

返佣比例已从 {{ previous_rebate_ratio }}% 调整为 {{ current_rebate_ratio }}%。
继续邀请好友提升交易量，随时可以升回来。

原等级：Lv{{ previous_level }}（{{ previous_rebate_ratio }}%）
新等级：Lv{{ current_level }}（{{ current_rebate_ratio }}%）
生效时间：{{ effective_at }}（UTC+8）

调整时间：{{ occurred_at }}
```

**Push 标题：** 邀请等级已调整

**Push 正文：** 返佣比例已调整为 {{ current_rebate_ratio }}%

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 4 · `invite_rebate.reclaimed` · 待结算回收

**业务触发：** 《[邀请返佣（Web/APP）](邀请返佣（Web_APP）.md)》§2.2.1 待结算回收记录 · 后台「邀请返佣管理」提交回收指令，**次日 0:00（UTC+8）** 日结批次 **执行成功** 后写入用户可见记录（提交瞬间不发）。

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

**站内信标题：** 待结算返佣已调整

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的邀请返佣待结算金额已调整。

回收待结算金额：{{ reclaim_amount }} {{ currency }}
回收原因：{{ reclaim_reason }}
执行时间：{{ executed_at }}（UTC+8）

调整后剩余待结算返佣：{{ remaining_pending }} {{ currency }}

如有疑问，请联系在线客服或查看邀请返佣页「待结算收益」说明。
```

**Push 标题：** 待结算返佣已调整

**Push 正文：** 待结算返佣 {{ reclaim_amount }} {{ currency }} 已回收

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

**业务触发：** 《[邀请合伙人无限层返佣系统 · 后台管理](邀请合伙人无限层返佣系统-后台管理.md)》§2.7.5 **设置成一级代理** 或 §2.1.4 **新增一级合伙人** · 审核/绑定审批通过并生效。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（新一级合伙人，用于敬语称呼） |
| `{{ rebate_ratio }}` | 合伙人返佣比例（%） |
| `{{ activation_source }}` | 开通来源：`partner_application`（计划审核）/ `admin_bind`（后台绑定） |
| `{{ effective_at }}` | 合伙人资格生效时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** 合伙人资格已开通

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的合伙人资格已开通。

返佣比例：{{ rebate_ratio }}%

请前往「合伙人管理中心」查看邀请链接与团队数据。
生效时间：{{ effective_at }}（UTC+8）

诚邀您继续拓展团队，邀请更多伙伴加入，共创更高返佣收益。
```

**Push 标题：** 合伙人资格已开通

**Push 正文：** 返佣 {{ rebate_ratio }}%，请前往合伙人管理中心

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 2 · `partner.rebate_migrate.superior_notified` · 原上级 · 下级迁移

**业务触发：** 《[邀请合伙人无限层返佣系统 · 后台管理](邀请合伙人无限层返佣系统-后台管理.md)》§2.3.5 **提交与审批** · 「返佣关系迁移」风控审批 **通过并即刻生效**。

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

**站内信标题：** 下级返佣关系已迁移

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的下级已完成返佣关系迁移。

被迁移主体 UID：{{ migrated_subject_uid }}（{{ migrated_subject_type }}）
迁移范围：{{ migrate_scope }}
新上级 UID：{{ new_superior_uid }}

生效时间：{{ effective_at }}（UTC+8）
审批单号：{{ migrate_approval_id }}
```

**Push 标题：** 下级关系已迁移

**Push 正文：** 下级 UID {{ migrated_subject_uid }} 已完成返佣关系迁移

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

> **说明**：仅通知 **原上级**；迁移主体、新上级的通知本期不做。

---

#### 3 · `partner.violation.deducted` · 违规扣除

**业务触发：** 《[邀请合伙人无限层返佣系统 · 后台管理](邀请合伙人无限层返佣系统-后台管理.md)》§2.6.3 **人工调整规则** · 佣金对账批次中 **修改实发** 低于原始佣金，且填写 **佣金扣除原因说明** 后保存生效。

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

**站内信标题：** 合伙人佣金违规扣减

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的合伙人佣金存在违规扣减。

结算日：{{ settlement_date }}（UTC+8）
应发返佣：{{ original_rebate }} {{ currency }}
违规扣减：{{ violation_deduction }} {{ currency }}
实发返佣：{{ actual_rebate }} {{ currency }}

扣减原因：{{ deduction_reason }}

请前往合伙人管理中心「佣金管理」查看详情。
```

**Push 标题：** 佣金违规扣减

**Push 正文：** {{ settlement_date }} 结算佣金扣减 {{ violation_deduction }} {{ currency }}

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

**业务触发：** 《[合约体验金&卡券中心页（后台/Web/APP）](合约体验金&卡券中心页（后台_Web_APP）.md)》§9.2 **审批通过后的系统行为** · 批量发放四级审批全部通过，卡券写入用户卡券中心（状态「可使用」）。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ amount }}` | 体验金面额（USDC） |
| `{{ coupon_id }}` | 卡券 ID |
| `{{ activate_deadline }}` | 卡券激活截止时间（UTC+8） |
| `{{ grant_batch_id }}` | 发放批次 / 审批单关联 ID |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** 合约体验金已发放

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的合约体验金已发放。

体验金面额：{{ amount }} USDC

请在 {{ activate_deadline }}（UTC+8）前前往卡券中心激活使用。
到账时间：{{ occurred_at }}
```

**Push 标题：** 体验金已发放

**Push 正文：** {{ amount }} USDC 体验金已到账，请前往卡券中心激活

**默认配置：** 奖励通知 · 普通 · 站内信 + App Push

---

#### 2 · `trial_fund.unused_expired` · 未使用过期

**业务触发：** 《[合约体验金&卡券中心页（后台/Web/APP）](合约体验金&卡券中心页（后台_Web_APP）.md)》§二 **卡券状态机** · **可使用 → 已过期**：卡券有效期结束，用户未激活。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ amount }}` | 过期作废的体验金面额（USDC） |
| `{{ coupon_id }}` | 卡券 ID |
| `{{ activate_deadline }}` | 原卡券激活截止时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** 体验金已过期未使用

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的体验金卡券已过期未使用。

体验金面额：{{ amount }} USDC

该卡券未在 {{ activate_deadline }}（UTC+8）前激活，已自动作废。
如有新的体验金活动，请关注卡券中心。
```

**Push 标题：** 体验金已过期

**Push 正文：** {{ amount }} USDC 体验金未激活已作废

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 3 · `trial_fund.activated` · 使用体验金

**业务触发：** 《[合约体验金&卡券中心页（后台/Web/APP）](合约体验金&卡券中心页（后台_Web_APP）.md)》§二 **卡券状态机** · **可使用 → 已使用**：用户在卡券有效期内点击激活，体验金注入合约账户。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ amount }}` | 本次激活注入合约账户的体验金面额（USDC） |
| `{{ coupon_id }}` | 卡券 ID |
| `{{ position_valid_until }}` | 开仓有效期截止时间 / 回收截止时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** 体验金已激活

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的体验金已激活。

体验金面额：{{ amount }} USDC

体验金已注入合约账户，请在 {{ position_valid_until }}（UTC+8）前完成交易使用。
激活时间：{{ occurred_at }}
```

**Push 标题：** 体验金已激活

**Push 正文：** {{ amount }} USDC 已注入合约账户

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 4 · `trial_fund.position_expired_reclaimed` · 体验金到期回收

**业务触发：** 《[合约体验金&卡券中心页（后台/Web/APP）](合约体验金&卡券中心页（后台_Web_APP）.md)》§二 **卡券状态机** · **已使用 → 已失效**：开仓有效期结束，系统回收剩余体验金（见 §6.1 触发条件 · 开仓有效期到期）。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ coupon_id }}` | 卡券 ID |
| `{{ reclaimed_amount }}` | 本次回收的体验金金额（USDC） |
| `{{ position_valid_until }}` | 开仓有效期截止时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** 体验金已到期回收

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的体验金已到期回收。

回收金额：{{ reclaimed_amount }} USDC

开仓有效期已于 {{ position_valid_until }}（UTC+8）结束，剩余体验金已从合约账户回收。
回收时间：{{ occurred_at }}
```

**Push 标题：** 体验金已回收

**Push 正文：** {{ reclaimed_amount }} USDC 体验金已到期回收

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

### 3.4 费率

**业务 PRD**：《[VIP 费率与后台配置](费率.md)》  
**默认**：业务通知 · 站内信 + App Push

| 序号 | 事件 | 说明 | 触发 | 接收人 | 幂等 |
|---|---|---|---|---|---|
| 1 | `fee_rate.vip.upgraded` | VIP 升级 | 每日 **UTC+8 24:00** 结算后，用户 **实际生效 VIP 等级** 较上一日升档 | 用户 UID | UID + 结算日 |
| 2 | `fee_rate.vip.downgraded` | VIP 降级 | 每日 **UTC+8 24:00** 结算后，用户 **实际生效 VIP 等级** 较上一日降档（自然滑档） | 用户 UID | UID + 结算日 |
| 3 | `fee_rate.vip_config.applied` | 设置 VIP 费率 | 运营 **指定 VIP 等级** 配置，三级审批 **全部通过** 并生效 | 目标 UID | 审批单 ID + UID |
| 4 | `fee_rate.custom_config.applied` | 设置自定义费率 | 运营 **自定义 Maker/Taker** 配置，三级审批 **全部通过** 并生效 | 目标 UID | 审批单 ID + UID |
| 5 | `fee_rate.config.expired` | 设置的费率失效 | 运营配置 **有效期到期**（到期日 **24:00 UTC+8**），自动恢复自然升降 | 目标 UID | UID + 运营配置记录 ID |

**不发通知**：

- 审批提交、驳回、重新提交等流转环节
- 运营 **撤销费率设置**（即时恢复自然升降，不走审批）
- 运营 **永久有效** 配置（无到期日，不发 `fee_rate.config.expired`）
- 存在 **VIP 2–VIP 4 或自定义** 运营配置期间的自然升降评估（用户冻结在自然通道外）
- **VIP 1 保底** 期间评估结果未升档、或未低于 VIP 1 的档位变化

> **自然升降 vs 运营配置**：仅当用户处于 **自然升降通道**（无运营配置，或仅 **VIP 1 保底** 且发生升档）时，才可能触发 `fee_rate.vip.upgraded` / `fee_rate.vip.downgraded`。运营指定 **VIP 1** 保底期间 **只升不降**，不触发降级通知。

---

#### 1 · `fee_rate.vip.upgraded` · VIP 升级

**业务触发：** 《[VIP 费率与后台配置](费率.md)》§1.1 **VIP 自然升降级** · 每日 **UTC+8 24:00** 结算后，用户处于自然升降通道（或 VIP 1 保底升档），**实际生效 VIP 等级** 较上一日升档。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ previous_level }}` | 升级前 VIP 等级（0–4） |
| `{{ current_level }}` | 升级后 VIP 等级（0–4） |
| `{{ previous_maker_rate }}` | 升级前 Maker 费率（%） |
| `{{ previous_taker_rate }}` | 升级前 Taker 费率（%） |
| `{{ current_maker_rate }}` | 升级后 Maker 费率（%） |
| `{{ current_taker_rate }}` | 升级后 Taker 费率（%） |
| `{{ volume_14d }}` | 近 14 日合约交易量（USD） |
| `{{ effective_at }}` | 新等级生效时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** VIP 等级已升级

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），恭喜您的 VIP 等级已升级。

原等级：VIP {{ previous_level }}（Maker {{ previous_maker_rate }}% / Taker {{ previous_taker_rate }}%）
新等级：VIP {{ current_level }}（Maker {{ current_maker_rate }}% / Taker {{ current_taker_rate }}%）

近 14 日交易量：{{ volume_14d }} USD
生效时间：{{ effective_at }}（UTC+8）
```

**Push 标题：** VIP 等级已升级

**Push 正文：** 您已升至 VIP {{ current_level }}，费率更优惠

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 2 · `fee_rate.vip.downgraded` · VIP 降级

**业务触发：** 《[VIP 费率与后台配置](费率.md)》§1.1 **VIP 自然升降级** · 每日 **UTC+8 24:00** 结算后，用户处于自然升降通道，近 14 日交易量不达标 **立即滑档**，实际生效等级较上一日降档。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ previous_level }}` | 降级前 VIP 等级（0–4） |
| `{{ current_level }}` | 降级后 VIP 等级（0–4） |
| `{{ previous_maker_rate }}` | 降级前 Maker 费率（%） |
| `{{ previous_taker_rate }}` | 降级前 Taker 费率（%） |
| `{{ current_maker_rate }}` | 降级后 Maker 费率（%） |
| `{{ current_taker_rate }}` | 降级后 Taker 费率（%） |
| `{{ volume_14d }}` | 近 14 日合约交易量（USD） |
| `{{ effective_at }}` | 新等级生效时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** VIP 等级已调整

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的 VIP 等级已调整。

原等级：VIP {{ previous_level }}（Maker {{ previous_maker_rate }}% / Taker {{ previous_taker_rate }}%）
新等级：VIP {{ current_level }}（Maker {{ current_maker_rate }}% / Taker {{ current_taker_rate }}%）

近 14 日交易量：{{ volume_14d }} USD
继续交易可提升 VIP 等级，享受更低费率。
生效时间：{{ effective_at }}（UTC+8）
```

**Push 标题：** VIP 等级已调整

**Push 正文：** 当前 VIP {{ current_level }}，继续交易可升档

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 3 · `fee_rate.vip_config.applied` · 设置 VIP 费率

**业务触发：** 《[VIP 费率与后台配置](费率.md)》§1.2 **运营后台配置费率** · 配置方式为 **指定 VIP 等级**（VIP 1–4），§1.5 三级审批 **全部通过** 并生效（§3.2 审批通过后的系统行为）。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ vip_level }}` | 运营指定的 VIP 等级（1–4） |
| `{{ maker_rate }}` | 生效 Maker 费率（%） |
| `{{ taker_rate }}` | 生效 Taker 费率（%） |
| `{{ valid_days }}` | 有效期天数；永久有效时为空 |
| `{{ valid_until }}` | 优惠到期时间（UTC+8）；永久有效时为空 |
| `{{ effective_at }}` | 费率生效时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** VIP 费率优惠已生效

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的 VIP 费率优惠已生效。

VIP 等级：VIP {{ vip_level }}
Maker 费率：{{ maker_rate }}%
Taker 费率：{{ taker_rate }}%

生效时间：{{ effective_at }}（UTC+8）
```

> **说明**：配置了有效期天数时，正文补充一行 `优惠有效期至：{{ valid_until }}（UTC+8）`；永久有效则省略。

**Push 标题：** VIP 费率优惠生效

**Push 正文：** VIP {{ vip_level }} 费率已生效

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 4 · `fee_rate.custom_config.applied` · 设置自定义费率

**业务触发：** 《[VIP 费率与后台配置](费率.md)》§1.2 **运营后台配置费率** · 配置方式为 **自定义 Maker/Taker**，§1.5 三级审批 **全部通过** 并生效（§3.2 审批通过后的系统行为；老板终审须无持仓）。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ maker_rate }}` | 生效 Maker 费率（%） |
| `{{ taker_rate }}` | 生效 Taker 费率（%） |
| `{{ valid_days }}` | 有效期天数；永久有效时为空 |
| `{{ valid_until }}` | 优惠到期时间（UTC+8）；永久有效时为空 |
| `{{ effective_at }}` | 费率生效时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** 专属费率优惠已生效

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的专属费率优惠已生效。

Maker 费率：{{ maker_rate }}%
Taker 费率：{{ taker_rate }}%

生效时间：{{ effective_at }}（UTC+8）
```

> **说明**：配置了有效期天数时，正文补充一行 `优惠有效期至：{{ valid_until }}（UTC+8）`；永久有效则省略。

**Push 标题：** 专属费率优惠生效

**Push 正文：** Maker {{ maker_rate }}% / Taker {{ taker_rate }}% 已生效

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 5 · `fee_rate.config.expired` · 设置的费率失效

**业务触发：** 《[VIP 费率与后台配置](费率.md)》§1.2 **有效期** · 运营配置填写了有效期天数，到期日 **24:00（UTC+8）** 自动失效，用户恢复 VIP 自然升降级（§1.2 生效规则 · 若配置了有效期天数，到期自动失效）。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ current_level }}` | 失效后按自然升降匹配的 VIP 等级（0–4） |
| `{{ maker_rate }}` | 失效后生效 Maker 费率（%） |
| `{{ taker_rate }}` | 失效后生效 Taker 费率（%） |
| `{{ volume_14d }}` | 近 14 日合约交易量（USD） |
| `{{ expired_at }}` | 运营配置失效时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** 费率优惠已失效

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的费率优惠已到期失效。

已恢复按近 14 日交易量匹配的 VIP 等级计费。

当前 VIP 等级：VIP {{ current_level }}
Maker 费率：{{ maker_rate }}%
Taker 费率：{{ taker_rate }}%

近 14 日交易量：{{ volume_14d }} USD
失效时间：{{ expired_at }}（UTC+8）
```

**Push 标题：** 费率优惠已失效

**Push 正文：** 已恢复 VIP {{ current_level }} 自然等级费率

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

### 3.5 积分

**业务 PRD**：《[积分（后台/Web/APP）](积分（后台_Web_APP）.md)》  
**默认**：业务通知 · 站内信 + App Push

| 序号 | 事件 | 说明 | 触发 | 接收人 | 幂等 |
|---|---|---|---|---|---|
| 1 | `points.bonus.adjusted` | 积分加成升/降级 | 每周一 **00:00（UTC+8）** 结算，**自然等级加成**（机制 2）较上一结算周升档或降档 | 用户 UID | UID + 结算周 |
| 2 | `points.manual.granted` | 手动积分发放 | **积分手动发放** 三级审批 **全部通过**，积分写入用户账户 | 名单内 UID | 审批单 ID + UID |
| 3 | `points.bonus_config.applied` | 手动配置积分加成 | **积分加成配置** 三级审批 **全部通过**，自定义加成系数生效 | 名单内 UID | 审批单 ID + UID |

**不发通知**：

- 审批提交、驳回、重新提交等流转环节
- **机制 1** 新人任务自动发放、**机制 3** 系统周结算自动瓜分（本期不做用户通知）
- **积分总池配置**、**积分计划总开关** 审批通过
- 自然加成与自定义加成取高后 **实际生效倍率未变** 的评估（级别变化但不影响用户可见加成时不发）

---

#### 1 · `points.bonus.adjusted` · 积分加成升/降级

**业务触发：** 《[积分（后台/Web/APP）](积分（后台_Web_APP）.md)》**机制 2 · 积分加成自动化规则** · 每周一 00:00（UTC+8）根据**上周伞下周交易额**判定自然等级加成系数；较上一结算周 **升档或降档** 时触发（级别 1–5 对照表见机制 2）。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ previous_level }}` | 调整前自然加成级别（1–5）；未达门槛时为 `0` |
| `{{ current_level }}` | 调整后自然加成级别（1–5）；未达门槛时为 `0` |
| `{{ previous_multiplier }}` | 调整前自然加成系数（如 `1.0`、`1.1`） |
| `{{ current_multiplier }}` | 调整后自然加成系数（如 `1.15`、`1.2`） |
| `{{ umbrella_volume }}` | 用于判定的伞下周交易额（USD） |
| `{{ effective_at }}` | 新生效加成对应的结算周起始时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** 积分加成已更新

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的积分加成已更新。

原加成：{{ previous_multiplier }}x（级别 {{ previous_level }}）
新加成：{{ current_multiplier }}x（级别 {{ current_level }}）

伞下周交易额：{{ umbrella_volume }} USD
生效时间：{{ effective_at }}（UTC+8）
```

> **说明**：升档时可在首句使用「恭喜」类表述；降档时使用「已更新」类表述。级别为 `0` 表示未达任何加成门槛（基础系数 1.0x）。

**Push 标题：** 积分加成已更新

**Push 正文：** 加成 {{ previous_multiplier }}x → {{ current_multiplier }}x

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

#### 2 · `points.manual.granted` · 手动积分发放

**业务触发：** 《[积分（后台/Web/APP）](积分（后台_Web_APP）.md)》§3.4 **手动发放积分** · **审批通过后的系统行为**：三级审批全部通过，按名单为每位用户增加对应积分并写入流水。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ points_amount }}` | 本次发放的积分数量 |
| `{{ grant_batch_id }}` | 发放批次 / 审批单关联 ID |
| `{{ effective_at }}` | 积分入账时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** 积分已到账

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您有新的积分已到账。

发放积分：+{{ points_amount }} Pts

请前往积分页查看余额与发放明细。
到账时间：{{ effective_at }}（UTC+8）
```

**Push 标题：** 积分已到账

**Push 正文：** +{{ points_amount }} Pts 积分已发放

**默认配置：** 奖励通知 · 普通 · 站内信 + App Push

---

#### 3 · `points.bonus_config.applied` · 手动配置积分加成

**业务触发：** 《[积分（后台/Web/APP）](积分（后台_Web_APP）.md)》§3.2 **积分加成配置** · **生效规则**：三级审批全部通过，目标用户 **自定义积分加成系数** 正式生效。

**允许消息模板使用的变量：**

| 变量 | 字段说明 |
|---|---|
| `{{ uid }}` | 接收通知的用户 UID（用于敬语称呼） |
| `{{ bonus_multiplier }}` | 生效的自定义加成系数（如 `1.5`） |
| `{{ config_batch_id }}` | 配置批次 / 审批单关联 ID |
| `{{ effective_at }}` | 加成生效时间（UTC+8） |
| `{{ occurred_at }}` | 事件发生时间（UTC+8） |

**站内信标题：** 积分加成优惠已生效

**站内信正文：**

```
尊敬的用户（UID：{{ uid }}），您的积分加成优惠已生效。

加成系数：{{ bonus_multiplier }}x

后续积分计算将按当前生效加成参与瓜分。
生效时间：{{ effective_at }}（UTC+8）
```

**Push 标题：** 积分加成优惠生效

**Push 正文：** 加成 {{ bonus_multiplier }}x 已生效

**默认配置：** 业务通知 · 普通 · 站内信 + App Push

---

### 3.6 （待补充）

下一业务分类在此追加（如充提、合约…），结构同 §3.1。
