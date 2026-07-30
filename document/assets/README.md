# 需求文档配图

配图**不进入 `main` 分支**，单独存放在 Git 分支 **`doc-assets`**，文档内通过 GitHub 链接引用。

## 文档中的引用格式

```markdown
![说明](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/积分/示例.png)
```

在 GitHub 上打开 md 或上传 Lark 时，图片从上述 URL 加载；本地 `git pull main` **不会**拉取 PNG 文件。

## 生成与上传配图

```bash
# 1. 按各文档的 capture 脚本生成 PNG（写入本目录，已被 .gitignore 忽略）
node scripts/capture-points-doc-screenshots.mjs

# 2. 推送到 doc-assets 分支
node scripts/push-doc-assets.mjs
```

## 目录约定

| 路径 | 说明 |
|---|---|
| `document/assets/积分/` | 《积分（后台/Web/APP）》配图 |

新增文档配图时，在对应子目录存放 PNG，并更新 `doc-assets` 分支。
