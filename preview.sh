#!/bin/bash
# 养生知识库 - 本地预览

echo "🌐 启动本地服务器..."
echo ""
echo "📍 预览地址: http://localhost:8080"
echo "   按 Ctrl+C 停止服务器"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8080
