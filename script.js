// Supabase配置 - 请替换为你的项目信息
const supabaseUrl = 'https://phiajrpyogytemhvuvsr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaWFqcnB5b2d5dGVtaHZ1dnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTQxODksImV4cCI6MjA4ODk5MDE4OX0.o9uRPNwIGtKUq01VgGPUJgvJLGU6Kb5BBgtD4fClvqc';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    loadReasons();
    setupEventListeners();
});

// 从Supabase加载请假理由
function loadReasons() {
    // 从Supabase获取数据
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

// 从Supabase获取数据
function fetchReasonsFromServer() {
    return supabase
        .from('reasons')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error) {
                throw error;
            }
            return data;
        });
}

// 保存数据到Supabase
function saveReasonsToServer(newReason) {
    return supabase
        .from('reasons')
        .insert(newReason)
        .then(({ error }) => {
            if (error) {
                throw error;
            }
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
        content: content,
        category: category,
        created_at: new Date().toISOString()
    };
    
    // 保存到Supabase
    saveReasonsToServer(newReason)
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
            reasons.push({
                id: Date.now(),
                ...newReason,
                timestamp: newReason.created_at
            });
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
