// UI Module
const UI = {
  showNotify(msg, duration = 2500) {
    const el = document.getElementById('notif');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
  },

  switchView(viewId) {
    // 隐藏所有视图
    document.querySelectorAll('.view').forEach(v => v.classList.remove('on'));
    // 取消所有导航高亮
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('on'));
    
    // 显示目标视图
    const viewEl = document.getElementById('v' + viewId.charAt(0).toUpperCase() + viewId.slice(1));
    if (viewEl) viewEl.classList.add('on');
    
    // 高亮对应导航
    const navEl = document.querySelector(`.nav-item[onclick*="${viewId}"]`);
    if (navEl) navEl.classList.add('on');

    // 如果是记录列表，加载所有记录
    if (viewId === 'recs') {
      App.loadAllRecords();
    }
    // 如果是每日记录列表，加载所有每日记录
    if (viewId === 'daily') {
      App.loadDailyRecords();
    }
  },

  openAddModal() {
    document.getElementById('addOv').classList.add('on');
    document.getElementById('rDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('rContent').value = '';
    document.getElementById('rNotes').value = '';
    document.getElementById('rHours').value = '1';
  },

  closeAddModal() {
    document.getElementById('addOv').classList.remove('on');
  },

  openWeeklyModal() {
    document.getElementById('wkOv').classList.add('on');
    const now = new Date();
    const year = now.getFullYear();
    const week = this.getWeekNumber(now);
    document.getElementById('wkPick').value = `${year}-W${String(week).padStart(2, '0')}`;
  },

  openDailyModal() {
    document.getElementById('dailyOv').classList.add('on');
    document.getElementById('dailyDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('dailyTimeline').value = '';
    document.getElementById('dailyNotes').value = '';
    document.getElementById('dailyScore').value = '80';
  },

  closeDailyModal() {
    document.getElementById('dailyOv').classList.remove('on');
  },

  closeWeeklyModal() {
    document.getElementById('wkOv').classList.remove('on');
  },

  showConfirm(msg, onConfirm) {
    document.getElementById('cfMsg').textContent = msg;
    document.getElementById('cfBtn').onclick = () => {
      this.closeConfirm();
      onConfirm();
    };
    document.getElementById('cfOv').classList.add('on');
  },

  closeConfirm() {
    document.getElementById('cfOv').classList.remove('on');
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  },

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
};
