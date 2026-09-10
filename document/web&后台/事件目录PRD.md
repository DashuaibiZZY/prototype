# 事件目录 PRD

> **Lark 主文档**：[事件目录 PRD](https://ksgf73ukjokp.sg.larksuite.com/wiki/BiTown38EipLF3k8TJllGd35gHc)  
> 本文件为仓库留痕副本。各业务 PRD **只引用本文**，不在业务文档内维护站内信模板。

---

## 1. 文档说明

消息中心通过 **系统事件** 驱动站内信 / Push / Email 等通知。业务方按分类补充事件；消息中心维护事件目录、模板变量与通知规则。

| 规则 | 说明 |
|---|---|
| 分类 | 按业务线划分（如邀请返佣、充提、合约…），后续分类在本文件追加 |
| 事件命名 | `{domain}.{action}`，如 `invite_rebate.level.upgraded` |
| 版本 | 事件目录 **只能新增**；若需变更已上线事件，在原事件名后加 `v2`、`v3`… |
| 模板变量 | 统一 `{{ variable }}` 占位符 |
| 业务 PRD | 只写 **何时触发、发给谁**；变量与文案以本文为准 |

---

## 2. 后台「事件目录」列表

| 列 | 说明 |
|---|---|
| 事件 | 系统事件 ID |
| 业务线 | 所属分类 |
| 关联通知规则 | 消息中心配置的通知规则 |
| 近 24h 调用 | 监控 |
| 失败率 | 监控 |
| 最后调用 | 监控 |
| 运行状态 | 启用 / 停用 |
| 操作 | 查看详情（基本信息、可引用变量、关联规则） |

---

## 3. 事件分类

### 3.1 邀请返佣

**业务说明**：普通用户 Lv0–Lv3 邀请返佣。等级与缓冲期规则见《[邀请返佣（Web/APP）](邀请返佣（Web_APP）.md)》§3.1。

**通知范围**（仅以下 4 条；其余场景不发系统通知）：

| 事件 | 触发时机 | 接收人 | 幂等 |
|---|---|---|---|
| `invite_rebate.level.upgraded` | 00:00（UTC+8）快照后判定应升级，实时升级成功 | 邀请人 | UID + 日期 + 目标等级 |
| `invite_rebate.level.buffer.started` | 00:00（UTC+8）判定不达标，进入 7 日保护（第 1 天） | 邀请人 | UID + 缓冲开始日 |
| `invite_rebate.level.downgraded` | 保护期第 8 日 00:00（UTC+8）仍不达标，执行降级 | 邀请人 | UID + 降级执行日 |
| `invite_rebate.reclaimed` | 后台回收指令在 **次日 0:00 批次执行成功**（提交瞬间不发） | 被回收 UID | 回收指令 ID |

> 缓冲期第 5、7 天倒计时 **不发** 通知。

---

#### `invite_rebate.level.upgraded` · 等级升级

**变量：** `user_nickname` · `previous_level` · `current_level` · `previous_rebate_ratio` · `current_rebate_ratio` · `active_friends` · `direct_client_volume` · `effective_at` · `occurred_at`

**示例：**

```
尊敬的 {{ user_nickname }}，恭喜您的邀请等级已升级。

原等级：Lv{{ previous_level }}（{{ previous_rebate_ratio }}%）
新等级：Lv{{ current_level }}（{{ current_rebate_ratio }}%）
新等级将于 {{ effective_at }}（UTC+8）起生效。
```

**默认：** 业务通知 · 普通 · 站内信 + App Push

---

#### `invite_rebate.level.buffer.started` · 降级保护开启

**变量：** `user_nickname` · `current_level` · `current_rebate_ratio` · `target_level` · `target_rebate_ratio` · `buffer_end_at` · `active_friends` · `active_friends_required` · `direct_client_volume` · `direct_client_volume_required` · `occurred_at`

**示例：**

```
尊敬的 {{ user_nickname }}，您的邀请等级保护已开启。

近期活跃好友或交易量暂未达标，我们将为您保留当前返佣比例 7 天，请抓紧邀请好友交易吧。
若到期仍未恢复条件，返佣比例将从 {{ current_rebate_ratio }}% 降至 {{ target_rebate_ratio }}%。
保护期至：{{ buffer_end_at }}（UTC+8）
```

**默认：** 业务通知 · 普通 · 站内信 + App Push

---

#### `invite_rebate.level.downgraded` · 确定降级

**变量：** `user_nickname` · `previous_level` · `current_level` · `previous_rebate_ratio` · `current_rebate_ratio` · `effective_at` · `occurred_at`

**示例：**

```
尊敬的 {{ user_nickname }}，您的邀请等级已调整。

返佣比例已从 {{ previous_rebate_ratio }}% 调整为 {{ current_rebate_ratio }}%。
继续邀请好友提升交易量，随时可以升回来。
生效时间：{{ effective_at }}（UTC+8）
```

**默认：** 业务通知 · 普通 · 站内信 + App Push

---

#### `invite_rebate.reclaimed` · 待结算回收

**变量：** `user_nickname` · `reclaim_amount` · `currency` · `reclaim_reason` · `executed_at` · `remaining_pending` · `reclaim_instruction_id` · `occurred_at`

**示例：**

```
尊敬的 {{ user_nickname }}，您的邀请返佣待结算金额已调整。

回收待结算金额：{{ reclaim_amount }} {{ currency }}
回收原因：{{ reclaim_reason }}
执行时间：{{ executed_at }}（UTC+8）
调整后剩余待结算返佣：{{ remaining_pending }} {{ currency }}
```

**默认：** 业务通知 · 较高 · 站内信 + App Push · 批次失败不发

---

### 3.2 （待补充）

后续业务分类在此追加，格式同 §3.1。
