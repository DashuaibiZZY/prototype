# ForX 和卡结合的方案

> 关联项目：**Perp_dex（ForX 永续合约）** ↔ **虚拟信用卡**  
> 目标：用户在两边完成绑定，经每周线下验证后打标「验证成功」，方可参与跨项目运营活动权益。

---

## 1. 背景与目标

| 项目 | 绑定能力 | 说明 |
|------|----------|------|
| **Perp_dex（ForX）** | 个人中心绑定虚拟卡号 | 用户以 ForX UID 为主体，关联一张虚拟信用卡 |
| **虚拟信用卡** | 绑定 Perp_dex UID | 用户以虚拟卡为主体，关联 ForX UID |

两边绑定信息需**定期（每周）线下验证**有效性，验证通过后双方同步标记 **「验证成功」** 标签。仅在该标签生效后，用户才可参与两边对应的**联名运营活动权益**。

---

## 2. 参与方

| 角色 | 说明 |
|------|------|
| **用户** | 在两个产品分别完成绑定 |
| **Perp_dex 个人中心** | 绑定虚拟卡号、展示验证状态 |
| **Perp_dex 账户服务** | 存储 UID ↔ 虚拟卡号映射 |
| **虚拟信用卡 App/Web** | 绑定 Perp_dex UID |
| **虚拟信用卡后台** | 存储卡号 ↔ UID 映射 |
| **线下验证团队** | 每周人工核对两边信息 |
| **验证标签服务** | 双方打标或中台统一同步状态 |
| **运营活动系统** | 校验验证标签后发放/解锁权益 |

---

## 3. 双向绑定（用户侧）

```mermaid
sequenceDiagram
    autonumber
    actor U as 用户
    participant PD as Perp_dex<br/>个人中心
    participant PDB as Perp_dex<br/>账户服务
    participant VC as 虚拟信用卡<br/>App/Web
    participant VCB as 虚拟信用卡<br/>后台

    Note over U,VCB: 阶段 A：Perp_dex 侧绑定虚拟卡号

    U->>PD: 进入个人中心 → 绑定虚拟卡
    PD->>PDB: 提交 UID + 虚拟卡号
    PDB->>PDB: 校验卡号格式 / 是否已被占用
    PDB-->>PD: 绑定成功（状态：待验证 pending）
    PD-->>U: 展示「已绑定，待验证」

    Note over U,VCB: 阶段 B：虚拟信用卡侧绑定 Perp_dex UID

    U->>VC: 进入绑定页 → 填写 Perp_dex UID
    VC->>VCB: 提交卡号 + UID
    VCB->>VCB: 校验 UID 格式 / 卡归属
    VCB-->>VC: 绑定成功（状态：待验证 pending）
    VC-->>U: 展示「已绑定，待验证」

    Note over PDB,VCB: 此时两边均为 pending，权益未解锁
```

**设计要点：**

- 两边绑定可**任意顺序**，但均完成后才进入验证队列。
- 初始状态建议统一：`bind_status = bound`，`verify_status = pending`。
- 列表/详情展示：**已绑定 · 待验证**。

---

## 4. 验证状态机

```mermaid
stateDiagram-v2
    [*] --> unbound: 未绑定

    unbound --> pending: 任一侧完成绑定
    pending --> pending: 另一侧补全绑定
    pending --> verified: 每周线下验证通过
    pending --> failed: 验证失败
    failed --> pending: 用户修正后重新入队
    verified --> revoked: 卡注销 / UID 风控 / 解绑
    revoked --> [*]
```

---

## 5. 每周线下验证

```mermaid
sequenceDiagram
    autonumber
    participant OPS as 线下验证团队<br/>（每周一次）
    participant PDX as Perp_dex<br/>导出/对账接口
    participant VCX as 虚拟信用卡<br/>导出/对账接口
    participant TAG as 验证标签服务<br/>（双方或中台）
    participant PDB as Perp_dex 账户
    participant VCB as 虚拟信用卡后台

    Note over OPS,VCB: 每周固定批次（如每周一 10:00）

    OPS->>PDX: 拉取待验证绑定清单<br/>(UID, 虚拟卡号, 绑定时间)
    OPS->>VCX: 拉取待验证绑定清单<br/>(卡号, UID, 绑定时间)

    OPS->>OPS: 线下比对：<br/>① UID 一致<br/>② 卡号一致<br/>③ 卡状态有效<br/>④ 账户无风控/冻结

    alt 验证通过
        OPS->>TAG: 提交 verified<br/>(UID, 卡号, batch_id)
        TAG->>PDB: verify_status = verified<br/>verify_tag = 验证成功<br/>verified_at = now
        TAG->>VCB: 同步 verify_status = verified<br/>verify_tag = 验证成功
        PDB-->>OPS: 回写成功
        VCB-->>OPS: 回写成功
    else 验证失败
        OPS->>TAG: 提交 failed + 原因<br/>(信息不一致 / 卡失效 / UID 不存在)
        TAG->>PDB: verify_status = failed<br/>fail_reason = xxx
        TAG->>VCB: verify_status = failed
        Note over PDB,VCB: 用户修正绑定信息后<br/>进入下一批次重验
    end

    Note over OPS,VCB: 可选：验证完成后双方互发 webhook / 消息通知
```

### 5.1 验证标签字段（两边对齐）

| 字段 | 说明 |
|------|------|
| `verify_status` | `pending` / `verified` / `failed` / `revoked` |
| `verify_tag` | 展示用，如「验证成功」 |
| `verify_batch_id` | 批次号，如 `2026-W38` |
| `verified_at` | 验证通过时间 |
| `fail_reason` | 失败原因（仅 `failed` 时有值） |

### 5.2 验证失败原因（建议枚举）

| 原因 | 用户侧提示 |
|------|------------|
| UID 不一致 | 两边绑定的 UID 不匹配，请核对后重新绑定 |
| 卡号不一致 | 两边绑定的卡号不匹配 |
| 卡已注销/失效 | 虚拟卡状态异常，请更换有效卡 |
| UID 不存在/已冻结 | ForX 账户异常，请联系客服 |

---

## 6. 验证成功后解锁运营权益

```mermaid
sequenceDiagram
    autonumber
    actor U as 用户
    participant PD as Perp_dex<br/>活动页
    participant PDB as Perp_dex<br/>权益服务
    participant VC as 虚拟信用卡<br/>活动页
    participant VCB as 虚拟信用卡<br/>权益服务

    Note over U,VCB: 前置条件：verify_status = verified

    U->>PD: 参与 Perp_dex 联名活动
    PD->>PDB: 校验 UID 权益资格
    PDB->>PDB: 检查：<br/>① verify_status = verified<br/>② 绑定关系仍有效<br/>③ 活动规则满足
    alt 资格通过
        PDB-->>PD: 允许领取 / 参与
        PD-->>U: 发放 Perp_dex 侧权益
    else 未验证或已失效
        PDB-->>PD: 拒绝 + 引导完成绑定 / 等待验证
        PD-->>U: 「需完成虚拟卡验证后可参与」
    end

    U->>VC: 参与虚拟信用卡侧联名活动
    VC->>VCB: 校验卡号权益资格
    VCB->>VCB: 同样校验 verify_status = verified
    alt 资格通过
        VCB-->>VC: 允许领取 / 参与
        VC-->>U: 发放虚拟卡侧权益
    else 未通过
        VC-->>U: 提示绑定 Perp_dex 并等待每周验证
    end
```

**权益门禁规则：**

- `verify_status != verified` → **不可**参与任何跨项目联名活动。
- `verified` 但后续解绑 / 卡失效 → 权益**冻结**；已发放权益按活动规则回收或保留至过期。
- 两边活动可独立配置，但**共用同一验证标签**作为准入条件。

---

## 7. 端到端总览

```mermaid
sequenceDiagram
    autonumber
    actor U as 用户
    participant PD as Perp_dex
    participant VC as 虚拟信用卡
    participant OPS as 每周线下验证
    participant ACT as 运营活动（双方）

    U->>PD: 绑定虚拟卡号
    U->>VC: 绑定 Perp_dex UID
    Note over PD,VC: 双方状态：待验证

    loop 每周一次
        OPS->>PD: 对账 + 验证
        OPS->>VC: 对账 + 验证
        OPS->>PD: 打标「验证成功」
        OPS->>VC: 打标「验证成功」
    end

    U->>ACT: 参与联名活动
    ACT->>PD: 校验 verified 标签
    ACT->>VC: 校验 verified 标签
    ACT-->>U: 解锁 / 发放双边权益
```

---

## 8. 产品建议

### 8.1 绑定不对称时的 UX

只完成一侧绑定时，提示：

> 请在另一产品完成绑定。绑定完成后将进入每周验证队列，验证通过方可参与联名活动。

### 8.2 验证周期透明

个人中心 / 绑定页展示：

> 验证批次：每周一提交，预计 1–2 个工作日出结果。  
> 当前状态：待验证 / 验证成功 / 验证失败（附原因）

### 8.3 失败可自愈

用户修正绑定信息后，状态回到 `pending`，自动进入下一验证批次，无需额外人工开单。

### 8.4 权益与验证解耦

活动配置只认 `verified` + 活动自身规则（KYC、地区、时间窗等），避免活动逻辑与验证细节强耦合。

### 8.5 审计

每次线下验证保留：操作人、批次号、比对快照、通过/失败明细，便于客诉与合规追溯。

---

## 9. 后续可扩展

- 验证自动化：在规则明确后，由中台自动比对，线下仅处理异常单。
- 解绑流程：用户主动解绑 → `revoked`，双边权益同步失效。
- 活动联动配置表：活动 ID、所需 `verify_status`、Perp_dex 权益、虚拟卡权益、有效期。
