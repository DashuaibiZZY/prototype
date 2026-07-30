# 需求文档配图

配图**不进入 `main` 分支**，单独存放在 Git 分支 **`doc-assets`**，文档内通过 GitHub 链接引用。

## 文档中的引用格式

上传 Lark 时勿使用 `![]()` 图片语法（会显示无法导入图片），请用超链接（只显示链接文案，点击在新页打开图片）：

```markdown
页面截图：[**后台 · 新人任务规则（只读）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/积分/admin-config-newbie-tasks.png)

**原型**：[https://dashuaibizzy.github.io/prototype/perp_dex/admin/积分后台.html](https://dashuaibizzy.github.io/prototype/perp_dex/admin/积分后台.html)
```

本地 `git pull main` **不会**拉取 PNG 文件。

## 生成与上传配图

```bash
# 1. 按各文档的 capture 脚本生成 PNG（写入本目录，已被 .gitignore 忽略）
node scripts/capture-points-doc-screenshots.mjs
node scripts/capture-fee-doc-screenshots.mjs
node scripts/capture-web-contract-doc-screenshots.mjs
node scripts/capture-app-contract-doc-screenshots.mjs

# 2. 推送到 doc-assets 分支
node scripts/push-doc-assets.mjs
```

## 目录约定

| 路径 | 说明 |
|---|---|
| `document/assets/积分/` | 《积分（后台/Web/APP）》配图 |
| `document/assets/费率/` | 《VIP 费率与后台配置》配图 |
| `document/assets/合约交易-web/` | 《合约交易页》（Web）配图 |
| `document/assets/合约交易-app/` | 《APP 端合约交易页》配图 |

新增文档配图时，在对应子目录存放 PNG，并更新 `doc-assets` 分支。
