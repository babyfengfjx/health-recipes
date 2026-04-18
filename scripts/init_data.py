#!/usr/bin/env python3
"""
初始化新内容类型的数据文件
"""
import json
import os

DATA_DIR = '/home/ut003483@uos/.openclaw/workspace/health-website/data'

# 初始化穴位数据
acupoints = {
    "version": "1.0",
    "generated": "2026-04-18",
    "description": "穴位按摩数据",
    "items": [
        {
            "id": "acupoint-001",
            "name": "内关穴",
            "location": "腕横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间",
            "efficacy": "宁心安神、理气止痛、和胃降逆",
            "method": "用拇指按压，每次3-5分钟，力度以有酸胀感为宜",
            "duration": "每次3-5分钟",
            "frequency": "每天2-3次",
            "symptoms": ["心悸", "失眠", "胸闷", "恶心", "呕吐"],
            "source": {"book": "中医基础理论", "author": "传统穴位"}
        },
        {
            "id": "acupoint-002",
            "name": "足三里",
            "location": "小腿外侧，犊鼻下3寸，胫骨前嵴外1横指处",
            "efficacy": "健脾和胃、扶正培元、通经活络",
            "method": "用拇指按揉，每次5-10分钟",
            "duration": "每次5-10分钟",
            "frequency": "每天1-2次",
            "symptoms": ["胃痛", "腹胀", "腹泻", "便秘", "体虚"],
            "source": {"book": "中医基础理论", "author": "传统穴位"}
        },
        {
            "id": "acupoint-003",
            "name": "三阴交",
            "location": "小腿内侧，内踝尖上3寸，胫骨内侧缘后际",
            "efficacy": "滋阴补肾、疏肝理气、健脾利湿",
            "method": "用拇指按揉，每次3-5分钟",
            "duration": "每次3-5分钟",
            "frequency": "每天1-2次",
            "symptoms": ["月经不调", "失眠", "遗精", "小便不利"],
            "source": {"book": "中医基础理论", "author": "传统穴位"}
        }
    ]
}

# 初始化功法数据
exercises = {
    "version": "1.0",
    "generated": "2026-04-18",
    "description": "养生功法数据",
    "items": [
        {
            "id": "exercise-001",
            "name": "八段锦",
            "description": "中国传统养生功法，动作简单易学，适合各年龄段人群练习",
            "steps": [
                "两手托天理三焦",
                "左右开弓似射雕",
                "调理脾胃须单举",
                "五劳七伤往后瞧",
                "摇头摆尾去心火",
                "两手攀足固肾腰",
                "攒拳怒目增气力",
                "背后七颠百病消"
            ],
            "duration": "15-20分钟",
            "frequency": "每天1-2次",
            "benefits": "调理脏腑、疏通经络、增强体质",
            "precautions": "动作要缓慢柔和，呼吸要自然顺畅",
            "source": {"book": "传统养生功法", "author": "传统"}
        },
        {
            "id": "exercise-002",
            "name": "太极拳",
            "description": "中国传统武术与养生功法结合，动作柔和缓慢",
            "steps": [
                "起势",
                "野马分鬃",
                "白鹤亮翅",
                "搂膝拗步",
                "手挥琵琶"
            ],
            "duration": "20-30分钟",
            "frequency": "每天1次",
            "benefits": "强身健体、调节呼吸、平衡身心",
            "precautions": "初学者建议跟随老师学习",
            "source": {"book": "传统养生功法", "author": "传统"}
        }
    ]
}

# 初始化知识数据
knowledge = {
    "version": "1.0",
    "generated": "2026-04-18",
    "description": "健康知识数据",
    "items": [
        {
            "id": "knowledge-001",
            "title": "春季养生要点",
            "summary": "春季是养肝护肝的最佳时节",
            "content": "春季万物生发，人体阳气也开始升发。此时养生重在养肝，要顺应春天阳气生发的特点，注意舒展身心，保持心情舒畅。饮食上宜省酸增甘，多吃些辛甘发散的食物，如韭菜、香菜等。",
            "tags": ["春季", "养肝", "养生"],
            "source": {"book": "中医养生基础", "author": "传统"}
        }
    ]
}

def init_data_files():
    """初始化数据文件"""
    
    # 写入穴位数据
    acupoints_file = os.path.join(DATA_DIR, 'acupoints.json')
    with open(acupoints_file, 'w', encoding='utf-8') as f:
        json.dump(acupoints, f, ensure_ascii=False, indent=2)
    print(f"✅ 创建: {acupoints_file}")
    
    # 写入功法数据
    exercises_file = os.path.join(DATA_DIR, 'exercises.json')
    with open(exercises_file, 'w', encoding='utf-8') as f:
        json.dump(exercises, f, ensure_ascii=False, indent=2)
    print(f"✅ 创建: {exercises_file}")
    
    # 写入知识数据
    knowledge_file = os.path.join(DATA_DIR, 'knowledge.json')
    with open(knowledge_file, 'w', encoding='utf-8') as f:
        json.dump(knowledge, f, ensure_ascii=False, indent=2)
    print(f"✅ 创建: {knowledge_file}")
    
    # 更新索引
    update_index()

def update_index():
    """更新数据索引"""
    index_file = os.path.join(DATA_DIR, 'index.json')
    
    with open(index_file, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    # 更新统计
    index['stats']['byType']['acupoint'] = 3
    index['stats']['byType']['exercise'] = 2
    index['stats']['byType']['knowledge'] = 1
    index['stats']['total'] = 795 + 3 + 2 + 1
    
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 更新索引: {index_file}")
    print(f"   总内容数: {index['stats']['total']}")

if __name__ == '__main__':
    init_data_files()
    print("\n🎉 数据文件初始化完成！")
