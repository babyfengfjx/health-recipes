import json
import datetime

with open('data/all_recipes.json', 'r', encoding='utf8') as f:
    data = json.load(f)

recipes = data.get('recipes', [])
total = len(recipes)

index = {
    'version': '1.1',
    'generated': datetime.date.today().isoformat(),
    'stats': {
        'total': total,
        'byType': {'recipe': total, 'acupoint': 0, 'exercise': 0, 'knowledge': 0},
        'bySeason': {},
        'bySymptom': {}
    },
    'dataFiles': {
        'recipe': 'data/all_recipes.json',
        'acupoint': 'data/acupoints.json',
        'exercise': 'data/exercises.json',
        'knowledge': 'data/knowledge.json'
    },
    'categories': {
        'types': {
            'recipe': {'name': '食疗方子', 'icon': '🌿'},
            'acupoint': {'name': '穴位按摩', 'icon': '👆'},
            'exercise': {'name': '养生功法', 'icon': '🧘'},
            'knowledge': {'name': '健康知识', 'icon': '📖'}
        },
        'seasons': {'spring': '春季🌸', 'summer': '夏季☀️', 'autumn': '秋季🍂', 'winter': '冬季❄️'},
        'symptoms': {'ganmao': '感冒', 'kesou': '咳嗽', 'shimian': '失眠', 'bipi': '补脾', 'buxue': '补血', 'qvxie': '祛湿', 'shanghuo': '上火'},
        'recipeTypes': [
            {'id': 'tea', 'name': '茶饮'},
            {'id': 'soup', 'name': '汤品'},
            {'id': 'porridge', 'name': '粥品'},
            {'id': 'dish', 'name': '菜品'},
            {'id': 'dessert', 'name': '甜品'},
            {'id': 'herb', 'name': '药膳'},
            {'id': 'external', 'name': '外用'},
            {'id': 'footbath', 'name': '泡脚方'}
        ],
        'authors': [
            {'id': '陈允斌', 'name': '陈允斌'},
            {'id': '罗大伦', 'name': '罗大伦'}
        ]
    }
}

for r in recipes:
    cats = r.get('categories', {})
    for s in cats.get('season', []):
        if s not in index['stats']['bySeason']: index['stats']['bySeason'][s] = 0
        index['stats']['bySeason'][s] += 1
    for sym in r.get('symptoms', []):
        if sym not in index['stats']['bySymptom']: index['stats']['bySymptom'][sym] = 0
        index['stats']['bySymptom'][sym] += 1

with open('data/index.json', 'w', encoding='utf8') as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

print('✅ 索引文件修复完成！已恢复筛选条件！')
