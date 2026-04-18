#!/usr/bin/env python3
"""
合并所有方子数据为单个文件，提高网站加载效率
"""
import json
import glob
import os

# 数据目录
DATA_DIR = '/home/ut003483@uos/.openclaw/workspace/health-website/data'
OUTPUT_FILE = os.path.join(DATA_DIR, 'all_recipes.json')

def merge_all_recipes():
    """合并所有方子数据"""
    all_recipes = []
    file_count = 0
    
    # 读取所有JSON文件
    for f in sorted(glob.glob(os.path.join(DATA_DIR, 'recipes-*.json'))):
        try:
            with open(f, 'r', encoding='utf-8') as fp:
                data = json.load(fp)
                recipes = data.get('recipes', [])
                all_recipes.extend(recipes)
                file_count += 1
        except Exception as e:
            print(f"错误: {f} - {e}")
    
    # 保存合并后的数据
    output = {
        "version": "1.1",
        "generated": "2026-04-18",
        "total": len(all_recipes),
        "recipes": all_recipes
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as fp:
        json.dump(output, fp, ensure_ascii=False, indent=2)
    
    print(f"✅ 合并完成!")
    print(f"   文件数: {file_count}")
    print(f"   方子数: {len(all_recipes)}")
    print(f"   输出: {OUTPUT_FILE}")
    print(f"   大小: {os.path.getsize(OUTPUT_FILE) / 1024:.1f} KB")

if __name__ == '__main__':
    merge_all_recipes()
