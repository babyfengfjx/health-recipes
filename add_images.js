const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'all_recipes.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let count = 0;

const keywordMap = {
    '茶': 'tea', '汤': 'soup', '粥': 'porridge', '饭': 'rice',
    '肉': 'meat', '鸡': 'chicken', '鱼': 'fish', '蛋': 'egg',
    '菜': 'vegetable', '果': 'fruit', '豆': 'beans', '饼': 'cake',
    '枣': 'jujube', '姜': 'ginger', '蒜': 'garlic', '葱': 'onion',
    '耳': 'fungus', '参': 'ginseng', '药': 'herb', '水': 'water'
};

function getKeyword(name) {
    for (let [key, val] of Object.entries(keywordMap)) {
        if (name.includes(key)) return val;
    }
    return 'food';
}

if (data.recipes) {
    data.recipes.forEach((recipe, index) => {
        if (!recipe.image || recipe.image.trim() === '') {
            const id = recipe.id || '';
            const match = id.match(/\d+/);
            const seedNum = match ? parseInt(match[0], 10) : index;
            const keyword = getKeyword(recipe.name || '');
            
            recipe.image = `https://picsum.photos/seed/${keyword}${seedNum}/800/500`;
            count++;
        }
    });
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`已成功为 ${count} 个方子添加配图`);
