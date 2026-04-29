/**
 * 养生智慧 v3.0 - 核心逻辑
 * 设计理念：用户体验优先、模块化、可维护
 */

// ========== 配置 ==========
const CONFIG = {
    dataPath: 'data/',
    indexFile: 'data/index.json',
    itemsPerPage: 20,
    cacheKey: 'health_wisdom_cache',
    favoritesKey: 'health_wisdom_favorites'
};

// ========== 全局状态 ==========
const state = {
    index: null,
    allData: {},
    filteredData: [],
    currentType: 'recipe',
    currentPage: 1,
    currentItemId: null,
    filters: {
        season: '',
        symptom: '',
        search: ''
    }
};

// ========== 身体系统分类 ==========
const BODY_SYSTEMS = [
    {
        id: 'respiratory',
        name: '呼吸系统',
        icon: '🫁',
        symptoms: ['咳嗽', '感冒', '咽炎', '哮喘', '肺炎', '支气管炎', '痰多']
    },
    {
        id: 'digestive',
        name: '消化系统',
        icon: '🍲',
        symptoms: ['便秘', '消化不良', '胃痛', '腹泻', '肠炎', '胃寒', '腹胀', '食欲不振']
    },
    {
        id: 'sleep',
        name: '睡眠问题',
        icon: '💤',
        symptoms: ['失眠', '多梦', '睡眠不好']
    },
    {
        id: 'cardiovascular',
        name: '心血管',
        icon: '❤️',
        symptoms: ['高血压', '心悸', '水肿', '高血脂']
    },
    {
        id: 'constitution',
        name: '体质调理',
        icon: '💪',
        symptoms: ['气虚', '肾虚', '脾虚', '阳虚', '阴虚', '体虚', '气血虚']
    },
    {
        id: 'skin',
        name: '皮肤问题',
        icon: '✋',
        symptoms: ['湿疹', '荨麻疹', '青春痘', '皮肤病', '痱子']
    },
    {
        id: 'women',
        name: '女性健康',
        icon: '👩',
        symptoms: ['痛经', '宫寒', '月经不调', '乳腺增生', '产后']
    },
    {
        id: 'other',
        name: '其他',
        icon: '📋',
        symptoms: ['疲劳', '脱发', '头痛', '怕冷', '上火']
    }
];

// ========== 节气数据 ==========
const SOLAR_TERMS = [
    { name: '小寒', date: '01-05', tip: '小寒大寒，冻成一团。宜温补养肾。' },
    { name: '大寒', date: '01-20', tip: '大寒到顶点，日后天渐暖。宜养藏精气。' },
    { name: '立春', date: '02-04', tip: '立春一日，百草回春。宜升发阳气。' },
    { name: '雨水', date: '02-19', tip: '雨水节气，湿气加重。宜健脾祛湿。' },
    { name: '惊蛰', date: '03-06', tip: '惊蛰春雷，万物复苏。宜养肝护脾。' },
    { name: '春分', date: '03-21', tip: '春分昼夜平，阴阳相半。宜调和阴阳。' },
    { name: '清明', date: '04-05', tip: '清明时节，祭祖踏青。宜养肝明目。' },
    { name: '谷雨', date: '04-20', tip: '谷雨断霜，播种时节。宜健脾利湿。' },
    { name: '立夏', date: '05-06', tip: '立夏养心，心静自然凉。宜清心养神。' },
    { name: '小满', date: '05-21', tip: '小满时节，湿热交蒸。宜清热利湿。' },
    { name: '芒种', date: '06-06', tip: '芒种忙种，收获希望。宜养心安神。' },
    { name: '夏至', date: '06-21', tip: '夏至一阴生，养阳护心。宜养心健脾。' },
    { name: '小暑', date: '07-07', tip: '小暑大暑，上蒸下煮。宜清热解暑。' },
    { name: '大暑', date: '07-23', tip: '大暑酷热，防暑降温。宜清补养心。' },
    { name: '立秋', date: '08-08', tip: '立秋贴秋膘，养生正当时。宜滋阴润燥。' },
    { name: '处暑', date: '08-23', tip: '处暑秋来，燥气当令。宜润肺生津。' },
    { name: '白露', date: '09-08', tip: '白露秋分夜，一夜凉一夜。宜养肺润燥。' },
    { name: '秋分', date: '09-23', tip: '秋分阴阳平，养生重平衡。宜调和阴阳。' },
    { name: '寒露', date: '10-08', tip: '寒露脚不露，防寒保暖。宜温阳补肾。' },
    { name: '霜降', date: '10-23', tip: '霜降杀百草，养生重保暖。宜温补肝肾。' },
    { name: '立冬', date: '11-08', tip: '立冬补冬，补嘴空。宜温补养藏。' },
    { name: '小雪', date: '11-22', tip: '小雪地封严，养生重藏精。宜补肾养藏。' },
    { name: '大雪', date: '12-07', tip: '大雪封地，温补为先。宜温阳补肾。' },
    { name: '冬至', date: '12-22', tip: '冬至一阳生，进补正当时。宜养阳补肾。' }
];

// ========== 初始化 ==========
async function init() {
    console.log('🌿 养生智慧 v3.0 初始化中...');
    
    // 显示加载状态
    showLoadingState();
    
    // 初始化事件监听
    initEventListeners();
    
    // 加载数据
    await loadIndex();
    await loadDataType('recipe');
    
    // 渲染首页组件
    renderSeasonalCard();
    renderSymptomCategories();
    renderHotSymptoms();
    updateFavoriteCount();
    
    console.log('✅ 初始化完成');
}

// ========== 事件监听 ==========
function initEventListeners() {
    // 搜索框
    const searchInput = document.getElementById('mainSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearchInput, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    // 类型标签切换
    document.querySelectorAll('.type-tab').forEach(tab => {
        tab.addEventListener('click', () => switchType(tab.dataset.type));
    });
    
    // 点击外部关闭搜索建议
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-wrapper')) {
            hideSearchSuggestions();
        }
    });
    
    // 症状导航搜索
    const symptomSearch = document.getElementById('symptomSearch');
    if (symptomSearch) {
        symptomSearch.addEventListener('input', filterSymptomsInNav);
    }
}

// ========== 数据加载 ==========
async function loadIndex() {
    try {
        const response = await fetch(`${CONFIG.indexFile}?t=${Date.now()}`);
        if (response.ok) {
            state.index = await response.json();
            console.log('📊 索引加载成功:', state.index.stats);
            updateTypeCounts();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (e) {
        console.error('索引加载失败:', e);
        showErrorState('数据加载失败，请刷新页面重试');
    }
}

async function loadDataType(type) {
    if (state.allData[type]) {
        state.currentType = type;
        filterAndRender();
        return;
    }
    
    showLoadingState();
    
    const dataFile = state.index?.dataFiles?.[type] || 
                     (type === 'recipe' ? 'data/all_recipes.json' : null);
    
    if (!dataFile) {
        console.warn('未找到数据文件:', type);
        state.allData[type] = [];
        filterAndRender();
        return;
    }
    
    try {
        const response = await fetch(`${dataFile}?t=${Date.now()}`);
        if (response.ok) {
            const data = await response.json();
            state.allData[type] = data.recipes || data.articles || data.items || data;
            state.currentType = type;
            console.log(`✅ 加载 ${type}: ${state.allData[type].length} 条`);
            filterAndRender();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (e) {
        console.error('数据加载失败:', e);
        state.allData[type] = [];
        filterAndRender();
    }
}

// ========== UI 渲染 ==========
function updateTypeCounts() {
    const stats = state.index?.stats?.byType || {};
    document.getElementById('recipeCount').textContent = stats.recipe || 0;
    document.getElementById('articleCount').textContent = stats.article || 0;
    document.getElementById('acupointCount').textContent = stats.acupoint || 0;
    document.getElementById('exerciseCount').textContent = stats.exercise || 0;
    document.getElementById('totalCount').textContent = state.index?.stats?.total || 0;
}

function renderSeasonalCard() {
    const today = new Date();
    const monthDay = String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(today.getDate()).padStart(2, '0');
    
    // 找到当前节气
    let currentTerm = SOLAR_TERMS.find(term => term.date === monthDay);
    if (!currentTerm) {
        // 找最近的过去节气
        for (let i = SOLAR_TERMS.length - 1; i >= 0; i--) {
            if (SOLAR_TERMS[i].date <= monthDay) {
                currentTerm = SOLAR_TERMS[i];
                break;
            }
        }
        if (!currentTerm) currentTerm = SOLAR_TERMS[SOLAR_TERMS.length - 1];
    }
    
    document.getElementById('seasonalDate').textContent = 
        `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    document.getElementById('seasonalTerm').textContent = currentTerm.name;
    document.getElementById('seasonalTip').textContent = currentTerm.tip;
}

function renderSymptomCategories() {
    const container = document.getElementById('symptomCategories');
    if (!container) return;
    
    container.innerHTML = BODY_SYSTEMS.map(sys => `
        <div class="symptom-category" onclick="openSymptomNav('${sys.id}')">
            <span class="cat-icon">${sys.icon}</span>
            <span class="cat-name">${sys.name}</span>
        </div>
    `).join('');
}

function renderHotSymptoms() {
    const container = document.getElementById('hotSymptoms');
    if (!container) return;
    
    const symptomStats = state.index?.stats?.bySymptom || {};
    const hotSymptoms = Object.entries(symptomStats)
        .filter(([name, count]) => count >= 10)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    container.innerHTML = hotSymptoms.map(([name, count]) => `
        <div class="symptom-card" onclick="searchBySymptom('${name}')">
            <div class="symptom-name">${name}</div>
            <div class="symptom-count">${count} 个方子</div>
        </div>
    `).join('');
}

function renderSeasonFilter() {
    const container = document.getElementById('seasonTags');
    if (!container) return;
    
    const seasons = ['全部', '春季', '夏季', '秋季', '冬季', '四季'];
    container.innerHTML = seasons.map(s => `
        <button class="filter-tag ${s === '全部' ? 'active' : ''}" 
                onclick="setSeasonFilter('${s === '全部' ? '' : s}')">
            ${s}
        </button>
    `).join('');
}

function filterAndRender() {
    const data = state.allData[state.currentType] || [];
    const { season, symptom, search } = state.filters;
    
    state.filteredData = data.filter(item => {
        // 搜索过滤
        if (search) {
            const searchLower = search.toLowerCase();
            const match = (item.name && item.name.toLowerCase().includes(searchLower)) ||
                         (item.efficacy && item.efficacy.toLowerCase().includes(searchLower)) ||
                         (item.symptoms && item.symptoms.some(s => s.includes(search)));
            if (!match) return false;
        }
        
        // 季节过滤
        if (season && item.categories?.season) {
            if (!item.categories.season.some(s => s.includes(season) || season.includes(s))) {
                return false;
            }
        }
        
        // 症状过滤
        if (symptom) {
            const hasSymptom = (item.symptoms && item.symptoms.some(s => s.includes(symptom))) ||
                              (item.efficacy && item.efficacy.includes(symptom));
            if (!hasSymptom) return false;
        }
        
        return true;
    });
    
    state.currentPage = 1;
    renderItems();
    renderSeasonFilter();
}

function renderItems() {
    const container = document.getElementById('itemsGrid');
    const loadMore = document.getElementById('loadMore');
    
    if (!container) return;
    
    const start = 0;
    const end = state.currentPage * CONFIG.itemsPerPage;
    const itemsToShow = state.filteredData.slice(start, end);
    
    if (itemsToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🔍 暂无相关内容</p>
                <p class="text-muted">试试其他关键词或筛选条件</p>
            </div>
        `;
        if (loadMore) loadMore.style.display = 'none';
        return;
    }
    
    container.innerHTML = itemsToShow.map(item => renderCard(item)).join('');
    
    // 更新统计
    document.getElementById('totalCount').textContent = state.filteredData.length;
    
    // 显示/隐藏加载更多
    if (loadMore) {
        loadMore.style.display = state.filteredData.length > end ? 'block' : 'none';
    }
}

function renderCard(item) {
    const typeInfo = {
        recipe: { icon: '🍵', name: '食疗方子', class: 'recipe' },
        article: { icon: '📚', name: '养生文章', class: 'article' },
        acupoint: { icon: '👆', name: '穴位按摩', class: 'acupoint' },
        exercise: { icon: '🧘', name: '养生功法', class: 'exercise' }
    };
    
    const type = typeInfo[item.type] || typeInfo.recipe;
    const seasonTag = item.categories?.season?.[0] || '';
    const symptomTag = item.symptoms?.[0] || '';
    
    return `
        <div class="item-card" onclick="showDetail('${item.id}')">
            <div class="card-header">
                <span class="card-type-badge ${type.class}">${type.icon} ${type.name}</span>
                <h3 class="card-title">${item.name || item.title}</h3>
                <p class="card-source">${item.source?.author || ''}《${item.source?.book || ''}》</p>
            </div>
            <div class="card-body">
                <p class="card-efficacy">${item.efficacy || item.summary || ''}</p>
                <div class="card-tags">
                    ${seasonTag ? `<span class="card-tag season">${seasonTag}</span>` : ''}
                    ${symptomTag ? `<span class="card-tag symptom">${symptomTag}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// ========== 搜索功能 ==========
function handleSearchInput(e) {
    const query = e.target.value.trim();
    if (query.length < 1) {
        hideSearchSuggestions();
        return;
    }
    
    // 生成搜索建议
    const suggestions = generateSuggestions(query);
    showSearchSuggestions(suggestions);
}

function generateSuggestions(query) {
    const suggestions = [];
    const data = state.allData[state.currentType] || [];
    const queryLower = query.toLowerCase();
    
    // 搜索名称
    data.forEach(item => {
        if (item.name && item.name.toLowerCase().includes(queryLower)) {
            suggestions.push({ type: 'name', text: item.name, item });
        }
        if (suggestions.length >= 5) return;
    });
    
    // 搜索症状
    if (state.index?.stats?.bySymptom) {
        Object.keys(state.index.stats.bySymptom).forEach(symptom => {
            if (symptom.includes(query) && suggestions.length < 8) {
                suggestions.push({ type: 'symptom', text: symptom + ' 相关', symptom });
            }
        });
    }
    
    return suggestions.slice(0, 8);
}

function showSearchSuggestions(suggestions) {
    const container = document.getElementById('searchSuggestions');
    if (!container || suggestions.length === 0) return;
    
    container.innerHTML = suggestions.map(s => `
        <div class="suggestion-item" onclick="${s.type === 'symptom' ? `searchBySymptom('${s.symptom}')` : `selectSuggestion('${s.text}')`}">
            <span>${s.type === 'symptom' ? '🎯' : '🍵'}</span>
            <span>${s.text}</span>
        </div>
    `).join('');
    
    container.classList.add('show');
}

function hideSearchSuggestions() {
    const container = document.getElementById('searchSuggestions');
    if (container) container.classList.remove('show');
}

function selectSuggestion(text) {
    document.getElementById('mainSearch').value = text;
    hideSearchSuggestions();
    performSearch();
}

function performSearch() {
    const query = document.getElementById('mainSearch').value.trim();
    state.filters.search = query;
    state.filters.symptom = '';
    hideSearchSuggestions();
    filterAndRender();
}

function searchBySymptom(symptom) {
    document.getElementById('mainSearch').value = symptom;
    state.filters.search = symptom;
    state.filters.symptom = symptom;
    closeSymptomNav();
    filterAndRender();
    
    // 滚动到列表
    document.querySelector('.content-list')?.scrollIntoView({ behavior: 'smooth' });
}

// ========== 类型切换 ==========
function switchType(type) {
    if (type === state.currentType) return;
    
    // 更新UI
    document.querySelectorAll('.type-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    
    // 加载数据
    loadDataType(type);
}

// ========== 筛选功能 ==========
function setSeasonFilter(season) {
    state.filters.season = season;
    
    // 更新UI
    document.querySelectorAll('#seasonTags .filter-tag').forEach(tag => {
        tag.classList.toggle('active', tag.textContent.trim() === (season || '全部'));
    });
    
    filterAndRender();
}

// ========== 症状导航 ==========
function openSymptomNav(systemId = null) {
    const overlay = document.getElementById('symptomNavOverlay');
    const container = document.getElementById('bodySystems');
    
    if (!overlay || !container) return;
    
    container.innerHTML = BODY_SYSTEMS.map(sys => `
        <div class="system-group" data-system="${sys.id}">
            <div class="system-title">
                <span>${sys.icon}</span>
                <span>${sys.name}</span>
            </div>
            <div class="system-symptoms">
                ${sys.symptoms.map(s => `
                    <span class="symptom-item" onclick="searchBySymptom('${s}')">${s}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    overlay.style.display = 'flex';
    
    // 如果指定了系统，滚动到该系统
    if (systemId) {
        const group = container.querySelector(`[data-system="${systemId}"]`);
        group?.scrollIntoView({ behavior: 'smooth' });
    }
}

function closeSymptomNav() {
    document.getElementById('symptomNavOverlay').style.display = 'none';
}

function filterSymptomsInNav(e) {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.system-group').forEach(group => {
        const symptoms = group.querySelectorAll('.symptom-item');
        let hasMatch = false;
        symptoms.forEach(s => {
            const match = s.textContent.toLowerCase().includes(query);
            s.style.display = match || !query ? '' : 'none';
            if (match) hasMatch = true;
        });
        group.style.display = hasMatch || !query ? '' : 'none';
    });
}

// ========== 详情模态框 ==========
function showDetail(id) {
    const item = findItemById(id);
    if (!item) return;
    
    state.currentItemId = id;
    
    const modal = document.getElementById('detailModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    const favBtn = document.getElementById('favoriteAction');
    
    title.textContent = item.name || item.title;
    
    // 更新收藏按钮状态
    const isFav = isFavorite(id);
    favBtn.classList.toggle('favorited', isFav);
    favBtn.querySelector('.action-icon').textContent = isFav ? '❤️' : '🤍';
    
    // 渲染详情内容
    body.innerHTML = renderDetailContent(item);
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
    document.body.style.overflow = '';
    state.currentItemId = null;
}

function renderDetailContent(item) {
    if (item.type === 'recipe') {
        return renderRecipeDetail(item);
    } else if (item.type === 'acupoint') {
        return renderAcupointDetail(item);
    } else if (item.type === 'exercise') {
        return renderExerciseDetail(item);
    } else if (item.type === 'article') {
        return renderArticleDetail(item);
    }
    return '<p>暂无详情</p>';
}

function renderRecipeDetail(item) {
    let html = '';
    
    // 来源
    if (item.source?.author || item.source?.book) {
        html += `
            <div class="detail-section">
                <p class="text-muted">📖 ${item.source?.author || ''}《${item.source?.book || ''}》</p>
            </div>
        `;
    }
    
    // 功效
    if (item.efficacy) {
        html += `
            <div class="detail-section efficacy-section">
                <h3 class="detail-section-title">💡 功效</h3>
                <div class="detail-section-content">${item.efficacy}</div>
            </div>
        `;
    }
    
    // 食材
    if (item.ingredients && item.ingredients.length > 0) {
        html += `
            <div class="detail-section">
                <h3 class="detail-section-title">🥄 食材</h3>
                <ul class="ingredients-list">
                    ${item.ingredients.map(ing => `
                        <li>
                            <span class="ingredient-name">${ing.name}</span>
                            <span class="ingredient-amount">${ing.amount || '适量'}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    // 做法
    if (item.method) {
        html += `
            <div class="detail-section">
                <h3 class="detail-section-title">👨‍🍳 做法</h3>
                <div class="detail-section-content">${formatMethod(item.method)}</div>
            </div>
        `;
    }
    
    // 适用症状
    if (item.symptoms && item.symptoms.length > 0) {
        html += `
            <div class="detail-section">
                <h3 class="detail-section-title">🎯 适用症状</h3>
                <div class="detail-section-content">${item.symptoms.join('、')}</div>
            </div>
        `;
    }
    
    // 注意事项
    if (item.precautions || (item.contraindicatedFor && item.contraindicatedFor.length > 0)) {
        html += `
            <div class="detail-section warning-section">
                <h3 class="detail-section-title">⚠️ 注意事项</h3>
                <div class="detail-section-content">
                    ${item.precautions || ''}
                    ${item.contraindicatedFor?.length ? '<br>禁忌人群：' + item.contraindicatedFor.join('、') : ''}
                </div>
            </div>
        `;
    }
    
    return html;
}

function renderAcupointDetail(item) {
    return `
        <div class="detail-section">
            <h3 class="detail-section-title">📍 位置</h3>
            <div class="detail-section-content">${item.location || '暂无'}</div>
        </div>
        <div class="detail-section efficacy-section">
            <h3 class="detail-section-title">💡 功效</h3>
            <div class="detail-section-content">${item.efficacy || '暂无'}</div>
        </div>
        <div class="detail-section">
            <h3 class="detail-section-title">👆 按摩方法</h3>
            <div class="detail-section-content">${item.method || '暂无'}</div>
        </div>
        ${item.symptoms?.length ? `
            <div class="detail-section">
                <h3 class="detail-section-title">🎯 适用症状</h3>
                <div class="detail-section-content">${item.symptoms.join('、')}</div>
            </div>
        ` : ''}
    `;
}

function renderExerciseDetail(item) {
    return `
        <div class="detail-section">
            <h3 class="detail-section-title">📝 简介</h3>
            <div class="detail-section-content">${item.description || ''}</div>
        </div>
        ${item.steps?.length ? `
            <div class="detail-section">
                <h3 class="detail-section-title">📋 步骤</h3>
                <div class="detail-section-content">
                    ${item.steps.map((s, i) => `${i + 1}. ${s}`).join('<br>')}
                </div>
            </div>
        ` : ''}
        <div class="detail-section">
            <h3 class="detail-section-title">⏱️ 练习要求</h3>
            <div class="detail-section-content">${item.duration || ''} ${item.frequency || ''}</div>
        </div>
    `;
}

function renderArticleDetail(item) {
    return `
        <div class="detail-section">
            <div class="detail-section-content">${item.content || item.summary || ''}</div>
        </div>
    `;
}

function formatMethod(method) {
    // 将换行符转换为段落
    return method.split(/\n|\r\n/).filter(s => s.trim()).map(s => `<p>${s}</p>`).join('');
}

// ========== 收藏功能 ==========
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG.favoritesKey) || '[]');
    } catch {
        return [];
    }
}

function saveFavorites(favs) {
    localStorage.setItem(CONFIG.favoritesKey, JSON.stringify(favs));
    updateFavoriteCount();
}

function isFavorite(id) {
    return getFavorites().some(f => f.id === id);
}

function toggleFavorite() {
    if (!state.currentItemId) return;
    
    const item = findItemById(state.currentItemId);
    if (!item) return;
    
    let favs = getFavorites();
    const index = favs.findIndex(f => f.id === state.currentItemId);
    
    if (index >= 0) {
        favs.splice(index, 1);
    } else {
        favs.push({
            id: state.currentItemId,
            name: item.name || item.title,
            type: item.type,
            efficacy: item.efficacy?.substring(0, 50),
            addedAt: Date.now()
        });
    }
    
    saveFavorites(favs);
    
    // 更新按钮状态
    const isFav = index < 0;
    const favBtn = document.getElementById('favoriteAction');
    favBtn.classList.toggle('favorited', isFav);
    favBtn.querySelector('.action-icon').textContent = isFav ? '❤️' : '🤍';
}

function updateFavoriteCount() {
    const count = getFavorites().length;
    const countEl = document.getElementById('favCount');
    if (countEl) {
        countEl.textContent = count;
        countEl.style.display = count > 0 ? 'flex' : 'none';
    }
}

function showFavorites() {
    const overlay = document.getElementById('favoritesOverlay');
    const list = document.getElementById('favoritesList');
    
    const favs = getFavorites();
    
    if (favs.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>❤️ 暂无收藏</p>
                <p class="text-muted">浏览时点击收藏按钮添加</p>
            </div>
        `;
    } else {
        list.innerHTML = favs.map(fav => `
            <div class="favorite-item" onclick="showFavoriteItem('${fav.id}')">
                <div class="fav-item-info">
                    <div class="fav-item-title">${fav.name}</div>
                    <div class="fav-item-meta">${fav.efficacy || ''}</div>
                </div>
                <button class="remove-fav" onclick="event.stopPropagation(); removeFavorite('${fav.id}')">🗑️</button>
            </div>
        `).join('');
    }
    
    overlay.style.display = 'flex';
}

function closeFavorites() {
    document.getElementById('favoritesOverlay').style.display = 'none';
}

function showFavoriteItem(id) {
    closeFavorites();
    showDetail(id);
}

function removeFavorite(id) {
    let favs = getFavorites();
    favs = favs.filter(f => f.id !== id);
    saveFavorites(favs);
    showFavorites();
}

// ========== 工具函数 ==========
function findItemById(id) {
    for (const type of Object.keys(state.allData)) {
        const found = state.allData[type].find(item => item.id === id);
        if (found) return found;
    }
    return null;
}

function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function showLoadingState() {
    const container = document.getElementById('itemsGrid');
    if (container) {
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>正在加载...</p>
            </div>
        `;
    }
}

function showErrorState(message) {
    const container = document.getElementById('itemsGrid');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <p>⚠️ ${message}</p>
                <button onclick="location.reload()">刷新页面</button>
            </div>
        `;
    }
}

// ========== 节气相关 ==========
function showSeasonalRecipes() {
    const term = document.getElementById('seasonalTerm').textContent;
    state.filters.season = term;
    document.getElementById('mainSearch').value = term;
    filterAndRender();
    document.querySelector('.content-list')?.scrollIntoView({ behavior: 'smooth' });
}

// ========== 分享功能 ==========
function shareItem() {
    const item = findItemById(state.currentItemId);
    if (!item) return;
    
    const text = `【${item.name}】\n${item.efficacy || ''}\n\n来自养生智慧`;
    
    if (navigator.share) {
        navigator.share({
            title: item.name,
            text: text,
            url: window.location.href
        });
    } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(text).then(() => {
            alert('已复制到剪贴板');
        });
    }
}

// ========== 加载更多 ==========
function loadMore() {
    state.currentPage++;
    renderItems();
}

// 关闭模态框的快捷函数
function closeModal() {
    closeDetailModal();
}

// ========== 启动 ==========
document.addEventListener('DOMContentLoaded', init);
