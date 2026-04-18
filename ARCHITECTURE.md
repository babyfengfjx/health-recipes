# 养生知识库系统架构设计

## 设计目标

1. **可扩展** - 支持不断增加的养生内容
2. **多来源** - 支持多位作者的书籍
3. **多类型** - 支持食疗、穴位、功法等多种类型
4. **自适应** - 数据增长时自动适应

---

## 数据结构设计

### 1. 统一内容模型

```json
{
  "id": "unique-id",
  "type": "recipe|acupoint|exercise|knowledge|formula",
  "category": "食疗|穴位|功法|知识|方剂",
  "source": {
    "book": "书名",
    "author": "作者",
    "page": "页码"
  },
  "content": {
    // 根据type不同，内容结构不同
  },
  "tags": ["标签1", "标签2"],
  "symptoms": ["症状1", "症状2"],
  "season": ["春季", "夏季"],
  "created": "2026-04-18",
  "updated": "2026-04-18"
}
```

### 2. 类型细分

#### 食疗方子 (recipe)
```json
{
  "type": "recipe",
  "content": {
    "name": "方子名称",
    "efficacy": "功效",
    "ingredients": [{"name": "", "amount": ""}],
    "method": "做法",
    "precautions": "注意事项",
    "suitableFor": [],
    "contraindicatedFor": []
  }
}
```

#### 穴位按摩 (acupoint)
```json
{
  "type": "acupoint",
  "content": {
    "name": "穴位名称",
    "location": "位置描述",
    "efficacy": "功效",
    "method": "按摩方法",
    "duration": "按摩时长",
    "frequency": "按摩频率",
    "symptoms": ["适用症状"],
    "image": "穴位图"
  }
}
```

#### 养生功法 (exercise)
```json
{
  "type": "exercise",
  "content": {
    "name": "功法名称",
    "description": "描述",
    "steps": ["步骤1", "步骤2"],
    "duration": "练习时长",
    "frequency": "练习频率",
    "benefits": "益处",
    "precautions": "注意事项"
  }
}
```

#### 健康知识 (knowledge)
```json
{
  "type": "knowledge",
  "content": {
    "title": "知识标题",
    "summary": "摘要",
    "content": "详细内容",
    "references": []
  }
}
```

---

## 文件结构

```
health-website/
├── index.html              # 主页
├── app.js                  # 主逻辑
├── style.css               # 样式
├── data/
│   ├── index.json          # 数据索引
│   ├── sources.json        # 来源列表
│   ├── categories.json     # 分类定义
│   ├── recipes/            # 食疗方子
│   │   ├── chen_yunbin/    # 按作者分类
│   │   │   ├── spring.json
│   │   │   ├── summer.json
│   │   │   └── ...
│   │   └── other_author/
│   ├── acupoints/          # 穴位数据
│   │   └── *.json
│   ├── exercises/          # 功法数据
│   │   └── *.json
│   └── knowledge/          # 知识数据
│       └── *.json
├── assets/
│   ├── images/             # 图片资源
│   └── icons/              # 图标
└── scripts/
    ├── merge_data.py       # 数据合并
    └── validate.py         # 数据验证
```

---

## 分类系统

### 按类型分类
- 食疗方子 (recipe)
- 穴位按摩 (acupoint)
- 养生功法 (exercise)
- 健康知识 (knowledge)
- 中药方剂 (formula)

### 按季节分类
- 春季养生
- 夏季养生
- 秋季养生
- 冬季养生
- 四季通用

### 按症状分类
- 呼吸系统（咳嗽、感冒、哮喘...）
- 消化系统（便秘、腹泻、胃痛...）
- 睡眠问题（失眠、多梦...）
- 心血管（心悸、高血压...）
- ...

### 按人群分类
- 老年人
- 女性
- 男性
- 儿童
- 孕妇
- ...

---

## 数据索引系统

### index.json
```json
{
  "version": "2.0",
  "updated": "2026-04-18",
  "stats": {
    "total": 795,
    "byType": {
      "recipe": 795,
      "acupoint": 0,
      "exercise": 0
    },
    "bySource": {
      "陈允斌": 795
    }
  },
  "sources": [
    {
      "id": "chen_yunbin",
      "name": "陈允斌",
      "books": ["二十四节气顺时饮食法", "回家吃饭的智慧", ...],
      "count": 795
    }
  ],
  "categories": {
    "seasons": ["春季", "夏季", "秋季", "冬季"],
    "symptoms": ["咳嗽", "感冒", ...],
    "types": ["茶饮", "汤品", "粥品", ...]
  }
}
```

---

## 网站功能模块

### 1. 搜索系统
- 全文搜索
- 分类筛选
- 多条件组合
- 智能推荐

### 2. 分类导航
- 按类型
- 按季节
- 按症状
- 按人群

### 3. 详情展示
- 统一样式
- 类型适配
- 来源标注

### 4. 用户功能
- 收藏
- 分享
- 打印
- 反馈

---

## 扩展计划

### Phase 1: 架构重构
- [x] 数据结构设计
- [ ] 索引系统
- [ ] 分类系统

### Phase 2: 内容扩展
- [ ] 穴位按摩数据
- [ ] 养生功法数据
- [ ] 其他作者内容

### Phase 3: 功能增强
- [ ] 智能推荐
- [ ] 个人收藏
- [ ] 学习路径

---

## 数据迁移

现有795个方子迁移到新结构：
1. 保持原有数据格式
2. 添加类型标记
3. 建立索引
4. 更新网站代码
