# GitHub Pages 部署指南

## 前提条件

1. 拥有 GitHub 账号
2. 已安装 Git

## 部署步骤

### 1. 创建 GitHub 仓库

```bash
# 在 GitHub 上创建新仓库
# 仓库名建议：health-recipes 或 yangsheng-knowledge-base
```

### 2. 初始化 Git 并推送

```bash
# 进入项目目录
cd /home/ut003483@uos/.openclaw/workspace/health-website

# 初始化 git
git init

# 添加 .gitignore
cat > .gitignore << 'EOF'
# 备份文件
*.bak
*_v1.*

# 系统文件
.DS_Store
Thumbs.db

# 临时文件
*.tmp
*.temp
EOF

# 添加所有文件
git add .

# 首次提交
git commit -m "🎉 初始化养生知识库网站

功能：
- 795+ 食疗方子
- 穴位按摩数据
- 养生功法数据
- 智能推荐系统
- 季节养生提醒
- 多维度筛选"

# 添加远程仓库（替换 YOUR_USERNAME 和 YOUR_REPO）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入 GitHub 仓库页面
2. 点击 **Settings** → **Pages**
3. 在 **Source** 下选择：
   - Branch: `main`
   - Folder: `/ (root)`
4. 点击 **Save**
5. 等待几分钟后，网站将在以下地址可用：
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```

## 文件结构

```
health-website/
├── index.html          # 主页
├── app.js              # 主逻辑
├── style.css           # 样式
├── data/               # 数据文件
│   ├── index.json      # 数据索引
│   ├── all_recipes.json # 食疗方子
│   ├── acupoints.json  # 穴位数据
│   ├── exercises.json  # 功法数据
│   └── knowledge.json  # 知识数据
├── assets/             # 静态资源
├── scripts/            # 构建脚本
├── README.md           # 项目说明
├── ROADMAP.md          # 发展路线图
├── ARCHITECTURE.md     # 架构设计
└── .gitignore          # Git 忽略配置
```

## 更新网站

```bash
# 添加更改的文件
git add .

# 提交更改
git commit -m "✨ 更新内容"

# 推送到 GitHub
git push
```

GitHub Pages 会自动重新部署。

## 自定义域名（可选）

1. 在仓库根目录创建 `CNAME` 文件
2. 内容为你的域名（如：`health.example.com`）
3. 在域名 DNS 设置中添加 CNAME 记录指向 `YOUR_USERNAME.github.io`

## 注意事项

1. **文件大小限制**：单个文件不超过 100MB
2. **仓库大小限制**：总大小不超过 1GB
3. **流量限制**：每月 100GB 带宽
4. **构建时间**：每次 push 后约 1-2 分钟生效

## 性能优化建议

1. 图片使用 CDN 或压缩后上传
2. 大数据文件已合并（all_recipes.json ~1.3MB）
3. 启用浏览器缓存（GitHub Pages 自动处理）

## 常见问题

### Q: 网站显示 404
A: 检查 Settings → Pages 是否正确配置为 main 分支

### Q: 更新后网站没有变化
A: 等待 1-2 分钟，或清除浏览器缓存

### Q: 数据加载失败
A: 检查 data/ 文件夹是否正确上传

## 自动化部署（进阶）

可使用 GitHub Actions 自动部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

**部署完成后，你将拥有一个免费、稳定的养生知识网站！** 🎉
