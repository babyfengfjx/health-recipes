#!/bin/bash
# 养生知识库 - GitHub Pages 部署脚本

set -e

echo "=========================================="
echo "🚀 养生知识库 - GitHub Pages 部署"
echo "=========================================="
echo ""

# 检查是否在项目目录
if [ ! -f "index.html" ]; then
    echo "❌ 错误：请在 health-website 目录下运行此脚本"
    exit 1
fi

# 检查 git 是否已初始化
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 获取 GitHub 用户名和仓库名
echo ""
echo "请输入 GitHub 信息："
read -p "GitHub 用户名: " USERNAME
read -p "仓库名称 (默认: health-recipes): " REPO
REPO=${REPO:-health-recipes}

echo ""
echo "📋 部署信息："
echo "   用户名: $USERNAME"
echo "   仓库名: $REPO"
echo "   网站地址: https://$USERNAME.github.io/$REPO/"
echo ""

read -p "确认部署？(y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "已取消部署"
    exit 0
fi

# 添加所有文件
echo ""
echo "📦 添加文件..."
git add .

# 检查是否有更改
if git diff --cached --quiet; then
    echo "⚠️ 没有需要提交的更改"
else
    # 提交
    echo "💾 提交更改..."
    git commit -m "✨ 更新养生知识库 $(date '+%Y-%m-%d %H:%M')"
fi

# 添加远程仓库
if ! git remote | grep -q "origin"; then
    echo "🔗 添加远程仓库..."
    git remote add origin "https://github.com/$USERNAME/$REPO.git"
else
    echo "🔗 更新远程仓库..."
    git remote set-url origin "https://github.com/$USERNAME/$REPO.git"
fi

# 推送到 GitHub
echo ""
echo "🚀 推送到 GitHub..."
git branch -M main
git push -u origin main --force

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📍 网站地址: https://$USERNAME.github.io/$REPO/"
echo ""
echo "⚠️ 首次部署需要："
echo "   1. 进入 GitHub 仓库 Settings → Pages"
echo "   2. Source 选择: Branch: main, Folder: / (root)"
echo "   3. 点击 Save"
echo "   4. 等待 1-2 分钟即可访问"
echo ""
