#!/usr/bin/env python3
"""
拆分复合方子脚本
问题：一个条目包含多个完全不同的方子
解决：按【原料】拆分成独立的方子
"""

import json
import re
import uuid

def extract_recipe_name(text):
    """从文本中提取方子名称"""
    lines = text.strip().split('\n')
    for line in lines[:10]:
        line = line.strip()
        if line and not line.startswith('【'):
            # 移除常见的引导词
            line = re.sub(r'^(喝|吃|用|做|煮)\s*', '', line)
            line = re.sub(r'，.*$', '', line)
            if len(line) > 2 and len(line) < 30:
                return line
    return None

def extract_ingredients(text):
    """从文本中提取食材"""
    ingredients = []
    match = re.search(r'【原料】\s*\n([\s\S]*?)(?=\n【|$)', text)
    if match:
        ingredient_text = match.group(1)
        for line in ingredient_text.split('\n'):
            line = line.strip()
            if line and not line.startswith('【'):
                # 提取食材名称和用量
                parts = re.split(r'[，、。]', line)
                for part in parts:
                    part = part.strip()
                    if part:
                        # 尝试分离名称和用量
                        match = re.match(r'(.+?)(\d+[克个片根碗勺份升毫升以上]+)?$', part)
                        if match:
                            name = match.group(1).strip()
                            amount = match.group(2) or ''
                            if name and len(name) > 1:
                                ingredients.append({'name': name, 'amount': amount})
    return ingredients

def extract_efficacy(text):
    """从文本中提取功效"""
    match = re.search(r'【功效】\s*\n([\s\S]*?)(?=\n【|允斌叮嘱|读者评论|$)', text)
    if match:
        return match.group(1).strip()
    return ''

def extract_method(text):
    """从文本中提取做法"""
    match = re.search(r'【做法】\s*\n([\s\S]*?)(?=\n【功效】|允斌叮嘱|读者评论|$)', text)
    if match:
        return match.group(1).strip()
    return text

def split_recipe(recipe):
    """拆分一个复合方子"""
    method = recipe.get('method', '')
    
    # 按【原料】拆分
    parts = re.split(r'\n(?=【原料】)', method)
    
    if len(parts) < 2:
        return [recipe]  # 不需要拆分
    
    # 找到每个方子的标题
    # 通常是"XXX水"、"XXX茶"、"XXX饮"等
    
    new_recipes = []
    
    # 提取开头部分（可能是简介）
    intro = parts[0]
    
    # 处理每个【原料】部分
    for i, part in enumerate(parts):
        if not part.strip():
            continue
        
        # 创建新方子
        new_recipe = recipe.copy()
        new_recipe['id'] = f"{recipe['id']}-{i+1}"
        new_recipe['method'] = part.strip()
        
        # 提取食材
        ingredients = extract_ingredients(part)
        if ingredients:
            new_recipe['ingredients'] = ingredients
        
        # 提取功效
        efficacy = extract_efficacy(part)
        if efficacy:
            new_recipe['efficacy'] = efficacy
        
        # 尝试提取方子名称
        name = extract_recipe_name(part)
        if name:
            new_recipe['name'] = name
        else:
            # 使用原标题 + 序号
            new_recipe['name'] = f"{recipe['name']}（{i+1}）"
        
        new_recipes.append(new_recipe)
    
    return new_recipes

def main():
    with open('data/all_recipes.json', 'r', encoding='utf8') as f:
        data = json.load(f)
    
    recipes = data['recipes']
    
    print(f"原始方子数: {len(recipes)}")
    
    # 拆分复合方子
    new_recipes = []
    split_count = 0
    
    for r in recipes:
        method = r.get('method', '')
        ingredient_count = method.count('【原料】')
        
        if ingredient_count >= 2:
            # 需要拆分
            parts = split_recipe(r)
            if len(parts) > 1:
                new_recipes.extend(parts)
                split_count += 1
                print(f"拆分: {r['name']} -> {len(parts)}个")
            else:
                new_recipes.append(r)
        else:
            new_recipes.append(r)
    
    print(f"\n拆分了 {split_count} 个复合方子")
    print(f"最终方子数: {len(new_recipes)}")
    
    # 保存
    data['recipes'] = new_recipes
    with open('data/all_recipes.json', 'w', encoding='utf8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("\n✅ 拆分完成，已保存")

if __name__ == '__main__':
    main()
