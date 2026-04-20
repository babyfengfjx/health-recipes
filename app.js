// 养生知识库系统 - 主逻辑 v2.0

// 全局配置
const CONFIG = {
    dataPath: 'data/',
    indexFile: 'data/index.json',
    itemsPerPage: 20,
    defaultType: 'recipe'
};

// 全局状态
let state = {
    index: null,           // 索引数据
    allData: {},           // 所有数据 {type: [items]}
    filteredData: [],      // 筛选后数据
    currentPage: 1,
    currentType: 'recipe', // 当前内容类型
    filters: {             // 当前筛选条件
        season: '',
        symptom: '',
        recipeType: '',
        group: '',
        search: '',
        author: ''
    }
};

// 初始化
async function init() {
    initEventListeners();
    await loadIndex();
    await loadDataType('recipe'); // 默认加载食疗方子
}

// 加载索引
async function loadIndex() {
    try {
        const response = await fetch(CONFIG.indexFile);
        if (response.ok) {
            state.index = await response.json();
            console.log('索引加载成功:', state.index.stats);
            updateUI();
        } else {
            console.error('索引文件加载失败，状态码:', response.status);
            document.getElementById('recipesList').innerHTML = `
                <div class="error-state">
                    <h3>⚠️ 数据加载失败</h3>
                    <p>请尝试刷新页面，或等待几分钟后重试</p>
                    <p>状态码: ${response.status}</p>
                </div>
            `;
        }
    } catch (e) {
        console.error('索引加载失败:', e);
        document.getElementById('recipesList').innerHTML = `
            <div class="error-state">
                <h3>⚠️ 数据加载失败</h3>
                <p>GitHub Pages 可能还在部署中，请稍后刷新重试</p>
                <p>错误: ${e.message}</p>
                <button onclick="location.reload()">刷新页面</button>
            </div>
        `;
    }
}

// 加载指定类型的数据
async function loadDataType(type) {
    console.log('开始加载类型:', type);
    
    if (state.allData[type]) {
        // 已加载过
        state.currentType = type;
        filterData();
        return;
    }
    
    // 显示加载状态
    const listEl = document.getElementById('recipesList');
    if (listEl) {
        listEl.innerHTML = '<div class="loading"></div>';
    }
    
    const dataFile = state.index?.dataFiles?.[type];
    console.log('数据文件路径:', dataFile);
    
    if (!dataFile) {
        console.error('未找到数据文件配置:', type);
        if (listEl) {
            listEl.innerHTML = '<div class="error-state"><h3>⚠️ 配置错误</h3><p>未找到数据文件配置</p></div>';
        }
        return;
    }
    
    try {
        console.log('正在fetch:', dataFile);
        const response = await fetch(dataFile);
        console.log('fetch响应状态:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('解析到的数据:', data);
            
            state.allData[type] = data.recipes || data.items || data;
            state.currentType = type;
            
            console.log(`加载 ${type} 数据成功，共 ${state.allData[type].length} 条`);
            
            if (state.allData[type].length === 0) {
                console.warn('数据为空！');
            }
            
            filterData();
        } else {
            console.error('fetch失败:', response.status, response.statusText);
            if (listEl) {
                listEl.innerHTML = `<div class="error-state"><h3>⚠️ 加载失败</h3><p>HTTP ${response.status}</p></div>`;
            }
        }
    } catch (e) {
        console.error('数据加载异常:', e);
        if (listEl) {
            listEl.innerHTML = `<div class="error-state"><h3>⚠️ 加载异常</h3><p>${e.message}</p></div>`;
        }
    }
}

// 更新UI
function updateUI() {
    if (!state.index) return;
    
    // 更新统计
    const stats = state.index.stats;
    document.getElementById('totalCount').innerHTML = 
        `共 <strong>${stats.total}</strong> 条内容`;
    document.getElementById('headerCount').textContent = stats.total;
    
    // 更新类型选择器
    renderTypeSelector();
    
    // 更新筛选器
    renderFilters();
}

// 渲染类型选择器
function renderTypeSelector() {
    const container = document.getElementById('typeSelector');
    if (!container || !state.index) return;
    
    const types = state.index.categories.types;
    container.innerHTML = Object.entries(types).map(([id, info]) => `
        <span class="type-tag ${id === state.currentType ? 'active' : ''}" 
              data-type="${id}" onclick="switchType('${id}')">
            ${info.icon} ${info.name}
            <span class="count">${state.index.stats.byType[id] || 0}</span>
        </span>
    `).join('');
}

// 渲染筛选器
function renderFilters() {
    if (!state.index) return;
    
    const categories = state.index.categories;
    
    // 季节筛选
    renderFilterGroup('seasonFilter', categories.seasons, 'season');
    
    // 症状筛选
    renderFilterGroup('symptomFilter', categories.symptoms, 'symptom');
    
    // 方子类型筛选（仅食疗方子时显示）
    if (state.currentType === 'recipe') {
        renderFilterGroup('recipeTypeFilter', categories.recipeTypes, 'recipeType');
    }
    
    // 作者筛选（仅食疗方子时显示）
    if (state.currentType === 'recipe' && categories.authors) {
        renderFilterGroup('authorFilter', categories.authors, 'author');
    }
}

// 渲染筛选组
function renderFilterGroup(containerId, items, filterKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = `<span class="tag active" data-filter="" onclick="setFilter('${filterKey}', '')">全部</span>`;
    html += items.map(item => `
        <span class="tag" data-filter="${item.id}" onclick="setFilter('${filterKey}', '${item.id}')">
            ${item.icon || ''} ${item.name}
        </span>
    `).join('');
    
    container.innerHTML = html;
}

// 切换内容类型
function switchType(type) {
    if (type === state.currentType) return;
    
    // 更新状态
    state.currentType = type;
    state.currentPage = 1;
    
    // 更新UI
    renderTypeSelector();
    renderFilters();
    
    // 加载数据
    loadDataType(type);
}

// 设置筛选条件
function setFilter(key, value) {
    state.filters[key] = value;
    state.currentPage = 1;
    
    // 更新标签状态
    const containerId = key + 'Filter';
    const container = document.getElementById(containerId);
    if (container) {
        container.querySelectorAll('.tag').forEach(tag => {
            tag.classList.toggle('active', tag.dataset.filter === value);
        });
    }
    
    filterData();
}

// 数据筛选
function filterData() {
    console.log('filterData 被调用');
    
    const data = state.allData[state.currentType] || [];
    const { season, symptom, recipeType, group, search, author } = state.filters;
    
    // 获取中文名称（用于匹配数据）
    const seasonName = season ? (state.index?.categories?.seasons?.find(s => s.id === season)?.name || season) : '';
    const recipeTypeName = recipeType ? (state.index?.categories?.recipeTypes?.find(t => t.id === recipeType)?.name || recipeType) : '';
    const authorName = author ? (state.index?.categories?.authors?.find(a => a.id === author)?.name || author) : '';
    
    console.log('筛选条件:', { season, seasonName, symptom, recipeType, recipeTypeName, author, authorName });
    
    state.filteredData = data.filter(item => {
        // 搜索匹配
        if (search) {
            const searchLower = search.toLowerCase();
            const searchMatch = 
                (item.name && item.name.toLowerCase().includes(searchLower)) ||
                (item.efficacy && item.efficacy.toLowerCase().includes(searchLower)) ||
                (item.symptoms && item.symptoms.some(s => s.toLowerCase().includes(searchLower))) ||
                (item.ingredients && item.ingredients.some(i => i.name && i.name.toLowerCase().includes(searchLower)));
            if (!searchMatch) return false;
        }
        
        // 季节筛选
        if (seasonName && item.categories?.season) {
            if (!item.categories.season.some(s => s.includes(seasonName) || seasonName.includes(s))) {
                return false;
            }
        }
        
        // 症状筛选
        if (symptom) {
            const symptomName = state.index?.categories?.symptoms?.find(s => s.id === symptom)?.name || symptom;
            const hasSymptom = (item.symptoms && item.symptoms.some(s => s.includes(symptomName) || symptomName.includes(s))) ||
                              (item.efficacy && item.efficacy.includes(symptomName));
            if (!hasSymptom) return false;
        }
        
        // 方子类型筛选
        if (recipeTypeName && state.currentType === 'recipe') {
            if (!item.categories?.type?.includes(recipeTypeName)) return false;
        }
        
        // 作者筛选
        if (authorName && item.source?.author) {
            if (item.source.author !== authorName) return false;
        }
        
        return true;
    });
    
    console.log('筛选后数据长度:', state.filteredData.length);
    
    renderList();
    
    // 更新筛选统计
    const filteredCountEl = document.getElementById('filteredCount');
    if (filteredCountEl) {
        filteredCountEl.innerHTML = `当前显示 <strong>${state.filteredData.length}</strong> 条`;
    }
}

// 渲染列表
function renderList() {
    const container = document.getElementById('recipesList');
    const start = 0;
    const end = state.currentPage * CONFIG.itemsPerPage;
    const itemsToShow = state.filteredData.slice(start, end);
    
    if (itemsToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🌱</div>
                <p>暂无相关内容</p>
            </div>
        `;
        document.getElementById('loadMore').style.display = 'none';
        return;
    }
    
    // 根据类型渲染不同的卡片
    const typeConfig = state.index?.categories?.types?.[state.currentType] || {};
    
    container.innerHTML = itemsToShow.map(item => 
        renderCard(item, typeConfig)
    ).join('');
    
    // 显示/隐藏加载更多
    document.getElementById('loadMore').style.display = 
        state.filteredData.length > end ? 'block' : 'none';
}

// 渲染卡片
function renderCard(item, typeConfig) {
    if (state.currentType === 'recipe') {
        return renderRecipeCard(item);
    } else if (state.currentType === 'acupoint') {
        return renderAcupointCard(item);
    } else if (state.currentType === 'exercise') {
        return renderExerciseCard(item);
    }
    return renderDefaultCard(item);
}

// 渲染食疗方子卡片
function renderRecipeCard(recipe) {
    const hasImage = recipe.image && recipe.image.trim();
    return `
        <div class="recipe-card ${hasImage ? 'has-image' : ''}" onclick="showDetail('${recipe.id}')">
            ${hasImage ? `<div class="card-image"><img src="${recipe.image}" alt="${recipe.name}" loading="lazy"/></div>` : ''}
            <div class="card-content">
                <h3>${getTypeIcon(recipe)} ${recipe.name}</h3>
                <div class="categories">
                    ${renderCategoryTags(recipe.categories)}
                </div>
                <div class="efficacy">${recipe.efficacy || '暂无功效描述'}</div>
                <div class="ingredients-preview">
                    📋 ${recipe.ingredients?.map(i => i.name).join('、') || '暂无食材信息'}
                </div>
            </div>
        </div>
    `;
}

// 渲染穴位卡片
function renderAcupointCard(item) {
    return `
        <div class="recipe-card acupoint-card" onclick="showDetail('${item.id}')">
            <h3>👆 ${item.name}</h3>
            <div class="location">📍 ${item.location || ''}</div>
            <div class="efficacy">${item.efficacy || ''}</div>
            <div class="symptoms">
                ${item.symptoms?.map(s => `<span class="symptom-tag">${s}</span>`).join('') || ''}
            </div>
        </div>
    `;
}

// 渲染功法卡片
function renderExerciseCard(item) {
    return `
        <div class="recipe-card exercise-card" onclick="showDetail('${item.id}')">
            <h3>🧘 ${item.name}</h3>
            <div class="duration">⏱️ ${item.duration || ''}</div>
            <div class="efficacy">${item.benefits || item.efficacy || ''}</div>
        </div>
    `;
}

// 渲染默认卡片
function renderDefaultCard(item) {
    return `
        <div class="recipe-card" onclick="showDetail('${item.id}')">
            <h3>${item.name || item.title}</h3>
            <div class="efficacy">${item.efficacy || item.summary || ''}</div>
        </div>
    `;
}

// 显示详情
function showDetail(id) {
    const item = state.allData[state.currentType]?.find(i => i.id === id);
    if (!item) return;
    
    let content = '';
    
    if (state.currentType === 'recipe') {
        content = renderRecipeDetail(item);
    } else if (state.currentType === 'acupoint') {
        content = renderAcupointDetail(item);
    } else if (state.currentType === 'exercise') {
        content = renderExerciseDetail(item);
    } else {
        content = renderDefaultDetail(item);
    }
    
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('recipeModal').classList.add('active');
}

// 渲染食疗方子详情
function renderRecipeDetail(recipe) {
    return `
        ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}" class="detail-image" loading="lazy"/>` : ''}
        <h2>${recipe.name}</h2>
        
        <div class="detail-section efficacy-section">
            <h4>📌 功效</h4>
            <p>${recipe.efficacy || '暂无'}</p>
        </div>
        
        ${recipe.symptoms?.length ? `
            <div class="detail-section symptom-section">
                <h4>🎯 适应症状</h4>
                <p>${recipe.symptoms.join('、')}</p>
            </div>
        ` : ''}
        
        ${recipe.suitableFor?.length ? `
            <div class="detail-section suitable-section">
                <h4>✅ 适用人群</h4>
                <p>${recipe.suitableFor.join('、')}</p>
            </div>
        ` : ''}
        
        ${recipe.contraindicatedFor?.length ? `
            <div class="detail-section warning-section">
                <h4>❌ 禁忌人群</h4>
                <p class="warning-text">${recipe.contraindicatedFor.join('、')}</p>
            </div>
        ` : ''}
        
        ${recipe.ingredients?.length ? `
            <div class="detail-section ingredient-section">
                <h4>🥄 所需食材</h4>
                <ul class="ingredients-list">
                    ${recipe.ingredients.map(i => 
                        `<li>• ${i.name}${i.amount ? `：${i.amount}` : ''}</li>`
                    ).join('')}
                </ul>
            </div>
        ` : ''}
        
        ${recipe.method ? `
            <div class="detail-section method-section">
                <h4>📝 制作方法</h4>
                <div class="method-content">${recipe.method.replace(/\n/g, '<br>')}</div>
            </div>
        ` : ''}
        
        ${recipe.precautions ? `
            <div class="detail-section precaution-section">
                <h4>⚠️ 注意事项</h4>
                <div class="precautions-content">${recipe.precautions.replace(/\n/g, '<br>')}</div>
            </div>
        ` : ''}
        
        ${renderActionButtons(recipe)}
    `;
}

// 渲染穴位详情
function renderAcupointDetail(item) {
    return `
        <h2>${item.name}</h2>
        
        <div class="detail-section location-section">
            <h4>📍 位置</h4>
            <p>${item.location || '暂无'}</p>
        </div>
        
        <div class="detail-section efficacy-section">
            <h4>📌 功效</h4>
            <p>${item.efficacy || '暂无'}</p>
        </div>
        
        ${item.method ? `
            <div class="detail-section method-section">
                <h4>👆 按摩方法</h4>
                <div class="method-content">${item.method.replace(/\n/g, '<br>')}</div>
            </div>
        ` : ''}
        
        ${item.symptoms?.length ? `
            <div class="detail-section symptom-section">
                <h4>🎯 适用症状</h4>
                <p>${item.symptoms.join('、')}</p>
            </div>
        ` : ''}
        
        ${renderActionButtons(item)}
    `;
}

// 渲染功法详情
function renderExerciseDetail(item) {
    return `
        <h2>${item.name}</h2>
        
        <div class="detail-section">
            <h4>📌 简介</h4>
            <p>${item.description || item.summary || ''}</p>
        </div>
        
        ${item.steps?.length ? `
            <div class="detail-section">
                <h4>📝 练习步骤</h4>
                <ol>
                    ${item.steps.map(s => `<li>${s}</li>`).join('')}
                </ol>
            </div>
        ` : ''}
        
        ${item.duration || item.frequency ? `
            <div class="detail-section">
                <h4>⏱️ 练习要求</h4>
                <p>${item.duration || ''} ${item.frequency || ''}</p>
            </div>
        ` : ''}
        
        ${item.benefits ? `
            <div class="detail-section">
                <h4>✅ 功效益处</h4>
                <p>${item.benefits}</p>
            </div>
        ` : ''}
        
        ${renderActionButtons(item)}
    `;
}

// 渲染默认详情
function renderDefaultDetail(item) {
    return `
        <h2>${item.name || item.title}</h2>
        <div class="detail-section">
            <p>${item.content || item.summary || ''}</p>
        </div>
        ${renderActionButtons(item)}
    `;
}

// 渲染操作按钮
function renderActionButtons(item) {
    return `
        <div class="action-buttons">
            <button class="copy-btn" onclick="copyItem('${item.id}')">📋 复制方子</button>
        </div>
    `;
}

// 辅助函数
function getTypeIcon(recipe) {
    const type = recipe.categories?.type?.[0];
    const icons = {'茶饮': '🍵', '汤品': '🍲', '粥品': '🥣', '菜品': '🥗', '甜品': '🍰', '药膳': '💊'};
    return icons[type] || '🌿';
}

function renderCategoryTags(categories) {
    if (!categories) return '';
    const tags = [...(categories.season || []), ...(categories.type || [])];
    return tags.map(tag => `<span class="category-tag">${tag}</span>`).join('');
}

// 分享功能
function shareItem(name) {
    const url = window.location.href;
    const text = `推荐养生内容：${name}`;
    
    if (navigator.share) {
        navigator.share({ title: '养生知识分享', text, url });
    } else {
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
            alert('已复制到剪贴板！');
        });
    }
}

// 复制功能
function copyItem(id) {
    const item = state.allData[state.currentType]?.find(i => i.id === id);
    if (!item) return;
    
    let text = `【${item.name || item.title}】\n`;
    if (item.efficacy) text += `功效：${item.efficacy}\n`;
    if (item.ingredients) text += `食材：${item.ingredients.map(i => i.name).join('、')}\n`;
    if (item.method) text += `做法：${item.method}\n`;
    
    navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板！'));
}

// 页面加载完成后初始化
function onDOMReady() {
    init();
    // 显示季节养生提示（延迟显示，让页面先加载完成）
    setTimeout(() => {
        if (!localStorage.getItem('seasonalTipShown_' + new Date().toDateString())) {
            showSeasonalTip();
            localStorage.setItem('seasonalTipShown_' + new Date().toDateString(), 'true');
        }
    }, 1500);
}

document.addEventListener('DOMContentLoaded', onDOMReady);

// ============ 智能推荐系统 ============

// 症状关键词映射
const SYMPTOM_KEYWORDS = {
    '咳嗽': ['咳嗽', '咳', '痰', '喘'],
    '感冒': ['感冒', '发烧', '发热', '流鼻涕', '打喷嚏', '怕冷'],
    '失眠': ['失眠', '睡不着', '睡眠差', '多梦', '早醒'],
    '便秘': ['便秘', '大便干', '排便困难'],
    '腹泻': ['腹泻', '拉肚子', '拉稀', '大便不成形'],
    '疲劳': ['疲劳', '累', '乏力', '没精神', '困'],
    '胃痛': ['胃痛', '胃胀', '胃不舒服', '消化不良'],
    '头痛': ['头痛', '头疼', '偏头痛'],
    '贫血': ['贫血', '头晕', '脸色苍白'],
    '高血压': ['高血压', '血压高'],
    '心悸': ['心悸', '心慌', '心跳快'],
    '月经不调': ['月经不调', '痛经', '经期'],
    '湿气': ['湿气', '水肿', '浮肿'],
    '上火': ['上火', '口干', '口苦', '口腔溃疡'],
    '阳虚': ['阳虚', '怕冷', '手脚冰凉'],
    '阴虚': ['阴虚', '盗汗', '手脚心热']
};

// 智能推荐入口
function openSmartRecommend() {
    const modal = document.getElementById('smartRecommendModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        createSmartRecommendModal();
    }
}

// 创建智能推荐模态框
function createSmartRecommendModal() {
    const modalHtml = `
        <div class="modal active" id="smartRecommendModal">
            <div class="modal-content smart-recommend-content">
                <span class="close-btn" onclick="closeSmartRecommend()">&times;</span>
                <h2>🤖 智能养生推荐</h2>
                
                <div class="recommend-section">
                    <h4>📝 请描述您的症状或需求</h4>
                    <textarea id="symptomInput" placeholder="例如：最近咳嗽有痰、睡眠不好、容易疲劳..."></textarea>
                    <button class="recommend-btn" onclick="analyzeAndRecommend()">🔍 智能分析</button>
                </div>
                
                <div id="recommendResult" class="recommend-result"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// 关闭智能推荐
function closeSmartRecommend() {
    const modal = document.getElementById('smartRecommendModal');
    if (modal) modal.classList.remove('active');
}

// 分析症状并推荐
function analyzeAndRecommend() {
    const input = document.getElementById('symptomInput').value;
    if (!input.trim()) {
        alert('请输入您的症状或需求');
        return;
    }
    
    // 分析症状
    const detectedSymptoms = detectSymptoms(input);
    
    // 获取推荐
    const recommendations = getRecommendations(detectedSymptoms);
    
    // 显示结果
    displayRecommendations(detectedSymptoms, recommendations);
}

// 检测症状
function detectSymptoms(text) {
    const detected = [];
    const lowerText = text.toLowerCase();
    
    for (const [symptom, keywords] of Object.entries(SYMPTOM_KEYWORDS)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            detected.push(symptom);
        }
    }
    
    return detected;
}

// 获取推荐内容
function getRecommendations(symptoms) {
    const recommendations = {
        recipes: [],
        acupoints: [],
        exercises: []
    };
    
    const recipes = state.allData['recipe'] || [];
    
    // 根据症状匹配方子
    for (const symptom of symptoms) {
        // 匹配食疗方子
        const matchedRecipes = recipes.filter(r => {
            return (r.symptoms && r.symptoms.some(s => s.includes(symptom) || symptom.includes(s))) ||
                   (r.efficacy && r.efficacy.includes(symptom)) ||
                   (r.name && r.name.includes(symptom));
        }).slice(0, 3);
        
        recommendations.recipes.push(...matchedRecipes);
    }
    
    // 去重
    recommendations.recipes = [...new Map(recommendations.recipes.map(r => [r.id, r])).values()].slice(0, 5);
    
    // 穴位推荐（根据症状）
    recommendations.acupoints = getAcupointRecommendations(symptoms);
    
    // 功法推荐
    recommendations.exercises = getExerciseRecommendations(symptoms);
    
    return recommendations;
}

// 穴位推荐
function getAcupointRecommendations(symptoms) {
    const acupointMap = {
        '咳嗽': [{name: '肺俞', location: '背部第3胸椎棘突下旁开1.5寸', method: '按揉3-5分钟'},
                 {name: '尺泽', location: '肘横纹中，肱二头肌腱桡侧凹陷处', method: '按揉2-3分钟'}],
        '感冒': [{name: '大椎', location: '第7颈椎棘突下凹陷中', method: '按揉或艾灸'},
                 {name: '风池', location: '胸锁乳突肌与斜方肌之间凹陷中', method: '按揉5分钟'}],
        '失眠': [{name: '神门', location: '腕横纹尺侧端，尺侧腕屈肌腱的桡侧凹陷处', method: '睡前按揉5分钟'},
                 {name: '三阴交', location: '内踝尖上3寸', method: '按揉5-10分钟'}],
        '胃痛': [{name: '足三里', location: '犊鼻下3寸，胫骨前嵴外1横指', method: '按揉5-10分钟'},
                 {name: '中脘', location: '前正中线上，脐上4寸', method: '顺时针按揉'}],
        '头痛': [{name: '太阳', location: '眉梢与目外眦之间向后约1寸处凹陷中', method: '按揉3-5分钟'},
                 {name: '合谷', location: '手背第1、2掌骨间，第2掌骨桡侧的中点', method: '按揉5分钟'}],
        '疲劳': [{name: '足三里', location: '犊鼻下3寸', method: '按揉5-10分钟'},
                 {name: '关元', location: '前正中线上，脐下3寸', method: '艾灸或按揉'}],
        '心悸': [{name: '内关', location: '腕横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间', method: '按揉5分钟'},
                 {name: '神门', location: '腕横纹尺侧端', method: '按揉5分钟'}]
    };
    
    const result = [];
    for (const symptom of symptoms) {
        if (acupointMap[symptom]) {
            result.push(...acupointMap[symptom]);
        }
    }
    return result.slice(0, 4);
}

// 功法推荐
function getExerciseRecommendations(symptoms) {
    const exerciseMap = {
        '咳嗽': ['八段锦-调理脾胃须单举', '呼吸吐纳练习'],
        '失眠': ['睡前静坐冥想', '八段锦-摇头摆尾去心火'],
        '疲劳': ['八段锦完整练习', '太极拳'],
        '胃痛': ['摩腹功法', '八段锦-调理脾胃须单举'],
        '湿气': ['八段锦', '跪膝走']
    };
    
    const result = [];
    for (const symptom of symptoms) {
        if (exerciseMap[symptom]) {
            result.push(...exerciseMap[symptom]);
        }
    }
    return [...new Set(result)].slice(0, 3);
}

// 显示推荐结果
function displayRecommendations(symptoms, recommendations) {
    const resultDiv = document.getElementById('recommendResult');
    
    let html = '';
    
    // 显示检测到的症状
    if (symptoms.length > 0) {
        html += `
            <div class="detected-symptoms">
                <h4>🔍 识别到的症状</h4>
                <div class="symptom-tags">
                    ${symptoms.map(s => `<span class="symptom-tag">${s}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    // 食疗方子推荐
    if (recommendations.recipes.length > 0) {
        html += `
            <div class="recommend-group">
                <h4>🌿 推荐食疗方子</h4>
                <div class="recommend-cards">
                    ${recommendations.recipes.map(r => `
                        <div class="recommend-card" onclick="showDetail('${r.id}')">
                            <h5>${r.name}</h5>
                            <p>${r.efficacy || ''}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // 穴位推荐
    if (recommendations.acupoints.length > 0) {
        html += `
            <div class="recommend-group">
                <h4>👆 推荐穴位按摩</h4>
                <div class="acupoint-list">
                    ${recommendations.acupoints.map(a => `
                        <div class="acupoint-item">
                            <strong>${a.name}</strong>
                            <span>📍 ${a.location}</span>
                            <span>👆 ${a.method}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // 功法推荐
    if (recommendations.exercises.length > 0) {
        html += `
            <div class="recommend-group">
                <h4>🧘 推荐养生功法</h4>
                <ul class="exercise-list">
                    ${recommendations.exercises.map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (!html) {
        html = '<p class="no-result">暂未找到相关推荐，请尝试其他症状描述</p>';
    }
    
    resultDiv.innerHTML = html;
}

// ============ 季节养生提醒 ============

// 节气数据
const SOLAR_TERMS = [
    {name: '立春', date: '2月4日左右', recipes: ['防感护生汤', '春盘', '凉拌青韭芽'], 
     tips: '宜养肝护肝，多吃辛甘发散之品', acupoints: ['太冲', '肝俞']},
    {name: '雨水', date: '2月19日左右', recipes: ['荠菜鸡蛋汤', '豆芽'],
     tips: '健脾祛湿，少吃酸多食甘', acupoints: ['足三里', '三阴交']},
    {name: '惊蛰', date: '3月6日左右', recipes: ['梨', '防感护生汤'],
     tips: '润肺止咳，预防感冒', acupoints: ['肺俞', '太渊']},
    {name: '春分', date: '3月21日左右', recipes: ['香椿炒蛋', '春菜'],
     tips: '阴阳平衡，调和饮食', acupoints: ['合谷', '太冲']},
    {name: '清明', date: '4月5日左右', recipes: ['清明果', '银耳羹'],
     tips: '养肝明目，慎食发物', acupoints: ['肝俞', '肾俞']},
    {name: '谷雨', date: '4月20日左右', recipes: ['茶饮', '祛湿汤'],
     tips: '健脾除湿，饮用新茶', acupoints: ['脾俞', '阴陵泉']},
    {name: '立夏', date: '5月6日左右', recipes: ['姜枣茶', '黄芪粥'],
     tips: '养心安神，开始喝姜枣茶', acupoints: ['内关', '神门']},
    {name: '小满', date: '5月21日左右', recipes: ['青梅', '苦瓜'],
     tips: '清热利湿，吃苦味食物', acupoints: ['心俞', '小肠俞']},
    {name: '芒种', date: '6月6日左右', recipes: ['酸梅汤', '绿豆汤'],
     tips: '清热解暑，饮食清淡', acupoints: ['足三里', '丰隆']},
    {name: '夏至', date: '6月21日左右', recipes: ['荷叶粥', '西瓜'],
     tips: '养心清热，多食苦味', acupoints: ['内关', '涌泉']},
    {name: '小暑', date: '7月7日左右', recipes: ['绿豆汤', '荷叶茶'],
     tips: '清热消暑，冬病夏治', acupoints: ['大椎', '肺俞']},
    {name: '大暑', date: '7月23日左右', recipes: ['三豆汤', '藿香正气水'],
     tips: '祛湿清热，预防中暑', acupoints: ['中脘', '足三里']},
    {name: '立秋', date: '8月8日左右', recipes: ['十全大补酒糟鸡', '荷叶粥'],
     tips: '滋阴润肺，贴秋膘', acupoints: ['肺俞', '尺泽']},
    {name: '处暑', date: '8月23日左右', recipes: ['出伏送暑汤', '相思长生粥'],
     tips: '润燥养肺，早睡早起', acupoints: ['太渊', '列缺']},
    {name: '白露', date: '9月8日左右', recipes: ['银耳羹', '梨'],
     tips: '润肺防燥，少吃辛辣', acupoints: ['肺俞', '肾俞']},
    {name: '秋分', date: '9月23日左右', recipes: ['桂花银耳羹', '红酒炖梨'],
     tips: '阴阳平衡，润肺养阴', acupoints: ['三阴交', '足三里']},
    {name: '寒露', date: '10月8日左右', recipes: ['桂子暖香茶', '芝麻'],
     tips: '养阴防燥，泡脚养生', acupoints: ['涌泉', '太溪']},
    {name: '霜降', date: '10月24日左右', recipes: ['柿子', '萝卜'],
     tips: '滋阴润燥，预防感冒', acupoints: ['肺俞', '大椎']},
    {name: '立冬', date: '11月8日左右', recipes: ['补肾养藏汤', '羊肉'],
     tips: '补肾养藏，开始进补', acupoints: ['肾俞', '命门']},
    {name: '小雪', date: '11月22日左右', recipes: ['莲杞顺时粥', '核桃壳煮鸡蛋'],
     tips: '温补肾阳，早睡晚起', acupoints: ['关元', '气海']},
    {name: '大雪', date: '12月7日左右', recipes: ['补肾养藏汤', '当归羊肉汤'],
     tips: '温阳补肾，防寒保暖', acupoints: ['肾俞', '太溪']},
    {name: '冬至', date: '12月22日左右', recipes: ['羊肉汤', '腊八粥'],
     tips: '进补最佳时机，数九养生', acupoints: ['关元', '命门']},
    {name: '小寒', date: '1月6日左右', recipes: ['腊八粥', '温补汤'],
     tips: '温肾助阳，三九贴敷', acupoints: ['肾俞', '足三里']},
    {name: '大寒', date: '1月20日左右', recipes: ['消寒糯米饭', '补心养阳汤'],
     tips: '温补脾肾，准备过年', acupoints: ['脾俞', '肾俞']}
];

// 获取当前节气
function getCurrentSolarTerm() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 简化的节气判断（实际应该用精确的天文计算）
    const termDates = [
        [1, 6, '小寒'], [1, 20, '大寒'],
        [2, 4, '立春'], [2, 19, '雨水'],
        [3, 6, '惊蛰'], [3, 21, '春分'],
        [4, 5, '清明'], [4, 20, '谷雨'],
        [5, 6, '立夏'], [5, 21, '小满'],
        [6, 6, '芒种'], [6, 21, '夏至'],
        [7, 7, '小暑'], [7, 23, '大暑'],
        [8, 8, '立秋'], [8, 23, '处暑'],
        [9, 8, '白露'], [9, 23, '秋分'],
        [10, 8, '寒露'], [10, 24, '霜降'],
        [11, 8, '立冬'], [11, 22, '小雪'],
        [12, 7, '大雪'], [12, 22, '冬至']
    ];
    
    for (let i = termDates.length - 1; i >= 0; i--) {
        const [m, d, name] = termDates[i];
        if (month > m || (month === m && day >= d)) {
            return SOLAR_TERMS.find(t => t.name === name) || SOLAR_TERMS[0];
        }
    }
    
    return SOLAR_TERMS[0]; // 默认返回第一个
}

// 显示季节养生提醒
function showSeasonalTip() {
    const term = getCurrentSolarTerm();
    const recipes = state.allData['recipe'] || [];
    
    // 查找推荐的方子
    const recommendedRecipes = term.recipes.map(name => 
        recipes.find(r => r.name && r.name.includes(name))
    ).filter(Boolean);
    
    const modalHtml = `
        <div class="modal-overlay active" id="seasonalModal" onclick="if(event.target===this)closeSeasonal()">
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header" style="background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);">
                    <h2 class="modal-title">🌸 ${term.name}养生</h2>
                    <button class="modal-close" onclick="closeSeasonal()">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="seasonal-section">
                        <h4>💡 养生要点</h4>
                        <p>${term.tips}</p>
                    </div>
                    
                    <div class="seasonal-section">
                        <h4>🌿 推荐食方</h4>
                        <div class="recipe-mini-cards">
                            ${recommendedRecipes.length > 0 ? 
                                recommendedRecipes.map(r => `
                                    <span class="recipe-mini-card" onclick="closeSeasonal();showDetail('${r.id}')">${r.name}</span>
                                `).join('') :
                                term.recipes.map(name => `<span class="recipe-name">${name}</span>`).join('')
                            }
                        </div>
                    </div>
                    
                    <div class="seasonal-section">
                        <h4>👆 推荐穴位</h4>
                        <p>${term.acupoints.join('、')}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 移除旧模态框
    const oldModal = document.getElementById('seasonalModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeSeasonal() {
    const modal = document.getElementById('seasonalModal');
    if (modal) modal.classList.remove('active');
}

// 页面加载时显示季节提示（延迟显示）
function showSeasonalTipOnLoad() {
    setTimeout(() => {
        // 检查是否已经显示过
        if (!localStorage.getItem('seasonalTipShown')) {
            showSeasonalTip();
            localStorage.setItem('seasonalTipShown', Date.now());
        }
    }, 2000);
}

// 快速搜索
function quickSearch(keyword) {
    state.filters.search = keyword;
    document.getElementById('searchInput').value = keyword;
    filterData();
    document.getElementById('recipesList').scrollIntoView({ behavior: 'smooth' });
}

// 随机推荐
function randomItem() {
    const data = state.allData[state.currentType] || [];
    if (data.length === 0) {
        alert('数据正在加载中，请稍候...');
        return;
    }
    const randomIndex = Math.floor(Math.random() * data.length);
    showDetail(data[randomIndex].id);
}

// 加载更多
function loadMore() {
    state.currentPage++;
    renderList();
}

// 关闭模态框
function closeModal() {
    document.getElementById('recipeModal').classList.remove('active');
}

// 初始化事件监听
function initEventListeners() {
    // 搜索
    document.getElementById('searchBtn')?.addEventListener('click', () => {
        state.filters.search = document.getElementById('searchInput').value;
        filterData();
    });
    
    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            state.filters.search = e.target.value;
            filterData();
        }
    });
    
    // 模态框
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('recipeModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'recipeModal') closeModal();
    });
    
    // 加载更多
    document.getElementById('loadMoreBtn')?.addEventListener('click', loadMore);
}
