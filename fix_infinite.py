import re

with open('app.js', 'r', encoding='utf8') as f:
    code = f.read()

# 1. 修复 renderList 的追加逻辑
pattern1 = r'const start = 0;\s*const end = state\.currentPage \* CONFIG\.itemsPerPage;\s*const itemsToShow = state\.filteredData\.slice\(start, end\);'
repl1 = r"""const end = state.currentPage * CONFIG.itemsPerPage;
    const start = (state.currentPage - 1) * CONFIG.itemsPerPage;
    const itemsToShow = state.filteredData.slice(start, end);
    if (state.currentPage === 1 && container) {
        container.innerHTML = '';
    }"""
code = re.sub(pattern1, repl1, code)

# 2. 修复 innerHTML 赋值逻辑，防止每次全量覆盖（导致闪烁）
pattern2 = r'container\.innerHTML = itemsToShow\.map\(item =>\s*renderCard\(item, typeConfig\)\s*\)\.join\(\'\'\);'
repl2 = r"""const newHtml = itemsToShow.map(item => renderCard(item, typeConfig)).join('');
    if (state.currentPage === 1) {
        container.innerHTML = newHtml;
    } else {
        container.insertAdjacentHTML('beforeend', newHtml);
    }
    state.isLoadingMore = false;"""
code = re.sub(pattern2, repl2, code)

# 3. 美化底部加载区域
pattern3 = r'document\.getElementById\(\'loadMore\'\)\.style\.display =\s*state\.filteredData\.length > end \? \'block\' : \'none\';'
repl3 = r"""const loadMoreEl = document.getElementById('loadMore');
    if (loadMoreEl) {
        if (state.filteredData.length > end) {
            loadMoreEl.style.display = 'block';
            loadMoreEl.innerHTML = '<div class="loading-more-text"><span>正</span><span>在</span><span>加</span><span>载</span><span>.</span><span>.</span><span>.</span></div>';
        } else if (state.filteredData.length > 0) {
            loadMoreEl.style.display = 'block';
            loadMoreEl.innerHTML = '<p class="no-more-data">没有更多内容了 ~ 🌿</p>';
        } else {
            loadMoreEl.style.display = 'none';
        }
    }"""
code = re.sub(pattern3, repl3, code)

# 4. 修复 loadMore 并且添加 handleScroll 自动加载
pattern4 = r'// 加载更多\s*function loadMore\(\) \{\s*state\.currentPage\+\+;\s*renderList\(\);\s*\}'
repl4 = r"""// 加载更多（用于点击和无限滚动）
function loadMore() {
    if (state.isLoadingMore) return;
    const end = state.currentPage * CONFIG.itemsPerPage;
    if (state.filteredData && state.filteredData.length <= end) return; // 已经加载完
    
    state.isLoadingMore = true;
    state.currentPage++;
    renderList();
}

// 无限滚动实现
function handleScroll() {
    // 当滚动到距离底部 800px 时自动加载
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        loadMore();
    }
}"""
code = re.sub(pattern4, repl4, code)

# 5. 绑定 handleScroll 事件
pattern5 = r'// 加载更多\s*document\.getElementById\(\'loadMoreBtn\'\)\?\.addEventListener\(\'click\', loadMore\);'
repl5 = r"""// 移除旧按钮，添加无限滚动
    window.addEventListener('scroll', handleScroll);"""
code = re.sub(pattern5, repl5, code)

with open('app.js', 'w', encoding='utf8') as f:
    f.write(code)

print("✅ app.js 分页和无限加载逻辑已更新")
