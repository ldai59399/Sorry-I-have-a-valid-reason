// 模拟在线存储 - 实际项目中应使用真实的后端API
let onlineStorage = {
    reasons: []
};

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    loadReasons();
    setupEventListeners();
});

// 从在线存储加载请假理由
function loadReasons() {
    // 模拟从服务器获取数据
    fetchReasonsFromServer()
        .then(reasons => {
            renderReasons(reasons);
        })
        .catch(error => {
            console.error('加载数据失败:', error);
            // 失败时使用本地存储作为备用
            const reasons = getReasonsFromLocalStorage();
            renderReasons(reasons);
        });
}

// 模拟从服务器获取数据
function fetchReasonsFromServer() {
    return new Promise((resolve, reject) => {
        // 模拟网络请求延迟
        setTimeout(() => {
            // 实际项目中这里应该是真实的API调用
            resolve(onlineStorage.reasons);
        }, 500);
    });
}

// 保存数据到服务器
function saveReasonsToServer(reasons) {
    return new Promise((resolve, reject) => {
        // 模拟网络请求延迟
        setTimeout(() => {
            // 实际项目中这里应该是真实的API调用
            onlineStorage.reasons = reasons;
            resolve();
        }, 500);
    });
}

// 从本地存储获取请假理由（作为备用）
function getReasonsFromLocalStorage() {
    const reasons = localStorage.getItem('leaveReasons');
    return reasons ? JSON.parse(reasons) : [];
}

// 保存请假理由到本地存储（作为备用）
function saveReasonsToLocalStorage(reasons) {
    localStorage.setItem('leaveReasons', JSON.stringify(reasons));
}

// 渲染请假理由
function renderReasons(reasons) {
    const reasonList = document.getElementById('reasonList');
    reasonList.innerHTML = '';
    
    reasons.forEach(reason => {
        const reasonItem = document.createElement('div');
        reasonItem.className = `reason-item ${reason.category}`;
        
        const categoryLabel = document.createElement('div');
        categoryLabel.className = `reason-category ${reason.category}`;
        categoryLabel.textContent = reason.category === 'sick' ? '病假' : '事假';
        
        const content = document.createElement('div');
        content.className = 'reason-content';
        content.textContent = reason.content;
        
        reasonItem.appendChild(categoryLabel);
        reasonItem.appendChild(content);
        reasonList.appendChild(reasonItem);
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 我要请假按钮点击事件
    document.getElementById('add-reason-btn').addEventListener('click', function() {
        document.getElementById('submitSection').style.display = 'block';
    });
    
    // 取消按钮点击事件
    document.getElementById('cancel-btn').addEventListener('click', function() {
        document.getElementById('submitSection').style.display = 'none';
        // 清空输入框
        document.getElementById('reason').value = '';
    });
    
    // 提交按钮点击事件
    document.getElementById('submit-btn').addEventListener('click', submitReason);
    
    // 分类按钮点击事件
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterReasons(category);
            
            // 更新活跃按钮状态
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// 提交请假理由
function submitReason() {
    const reasonInput = document.getElementById('reason');
    const categorySelect = document.getElementById('category');
    
    const content = reasonInput.value.trim();
    const category = categorySelect.value;
    
    // 验证输入
    if (!content) {
        showNotification('请填写请假理由', 'error');
        return;
    }
    
    if (content.length < 5) {
        showNotification('请假理由至少需要5个字', 'error');
        return;
    }
    
    // 创建新的请假理由
    const newReason = {
        id: Date.now(),
        content: content,
        category: category,
        timestamp: new Date().toISOString()
    };
    
    // 获取现有理由并添加新理由
    fetchReasonsFromServer()
        .then(reasons => {
            reasons.push(newReason);
            
            // 保存到服务器
            return saveReasonsToServer(reasons);
        })
        .then(() => {
            // 重新渲染理由列表
            loadReasons();
            
            // 隐藏提交表单并清空输入框
            document.getElementById('submitSection').style.display = 'none';
            reasonInput.value = '';
            
            // 显示成功通知
            showNotification('提交成功，感谢分享', 'success');
        })
        .catch(error => {
            console.error('提交失败:', error);
            // 失败时使用本地存储作为备用
            const reasons = getReasonsFromLocalStorage();
            reasons.push(newReason);
            saveReasonsToLocalStorage(reasons);
            
            // 重新渲染理由列表
            loadReasons();
            
            // 隐藏提交表单并清空输入框
            document.getElementById('submitSection').style.display = 'none';
            reasonInput.value = '';
            
            // 显示成功通知
            showNotification('提交成功，感谢分享', 'success');
        });
}

// 按分类筛选请假理由
function filterReasons(category) {
    fetchReasonsFromServer()
        .then(reasons => {
            let filteredReasons;
            
            if (category === 'all') {
                filteredReasons = reasons;
            } else {
                filteredReasons = reasons.filter(reason => reason.category === category);
            }
            
            renderReasons(filteredReasons);
        })
        .catch(error => {
            console.error('筛选失败:', error);
            // 失败时使用本地存储作为备用
            const reasons = getReasonsFromLocalStorage();
            let filteredReasons;
            
            if (category === 'all') {
                filteredReasons = reasons;
            } else {
                filteredReasons = reasons.filter(reason => reason.category === category);
            }
            
            renderReasons(filteredReasons);
        });
}

// 显示通知
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // 3秒后自动隐藏
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}