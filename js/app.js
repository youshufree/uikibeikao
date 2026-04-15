// Main App Module
const App = {
  currentRecordId: null,

  init() {
    this.updateDashboard();
    this.updatePhase();
    this.updateCountdown();
    Calendar.init('miniCal', 'fullCal');
    document.getElementById('todayStr').textContent = new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    // 每分钟更新倒计时
    setInterval(() => this.updateCountdown(), 60000);
  },

  updatePhase() {
    const phases = document.querySelectorAll('.phase');
    const now = new Date();
    const month = now.getMonth() + 1;
    let currentPhase = 1;
    
    if (month >= 4 && month <= 5) currentPhase = 1;
    else if (month >= 6 && month <= 9) currentPhase = 2;
    else if (month >= 10 && month <= 12) currentPhase = 3;
    else currentPhase = 4;

    const phaseNames = ['日语四级攻坚', '高数+专业课', '强化冲刺', '冲刺模拟'];
    document.getElementById('currentPhase').textContent = phaseNames[currentPhase - 1];

    phases.forEach((p, i) => {
      p.classList.remove('done', 'current');
      if (i + 1 < currentPhase) p.classList.add('done');
      else if (i + 1 === currentPhase) p.classList.add('current');
    });
  },

  updateCountdown() {
    // 日语四级考试一般在6月中旬，设为6月15日
    const examDate = new Date('2026-06-15');
    const now = new Date();
    const diff = examDate - now;
    
    if (diff > 0) {
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      document.getElementById('cdDays').textContent = days;
      document.getElementById('cdHours').textContent = hours;
      document.getElementById('cdMins').textContent = mins;
    } else {
      document.getElementById('cdDays').textContent = '0';
      document.getElementById('cdHours').textContent = '0';
      document.getElementById('cdMins').textContent = '0';
    }
  },

  updateDashboard() {
    const data = Storage.getData();
    const records = data.records;
    const today = new Date().toISOString().split('T')[0];
    
    // 显示今日评分
    const dailyRecords = Storage.getDailyRecords();
    const todayDaily = dailyRecords.find(r => r.date === today);
    const scoreStat = document.getElementById('todayScoreStat');
    const scoreDisplay = document.getElementById('todayScore');
    if (todayDaily) {
      scoreStat.style.display = 'flex';
      scoreDisplay.textContent = todayDaily.score;
    } else {
      scoreStat.style.display = 'none';
    }

    const totalDays = new Set(records.map(r => r.date)).size;
    const totalHours = records.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);

    // 连续天数
    let streak = 0;
    const dates = [...new Set(records.map(r => r.date))].sort().reverse();
    const todayDate = new Date();
    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      const expected = new Date(todayDate);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (d === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    // 本周学习
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekRecords = records.filter(r => new Date(r.date) >= weekStart);
    const weekHours = weekRecords.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);

    document.getElementById('s1').textContent = totalDays;
    document.getElementById('s2').textContent = totalHours.toFixed(1);
    document.getElementById('s3').textContent = streak;
    document.getElementById('s4').textContent = weekHours.toFixed(1);
    document.getElementById('sf1').textContent = totalHours.toFixed(0) + 'h';
    document.getElementById('sf2').textContent = streak + '天';
    
    // 侧边栏 badge 显示今日任务数
    const todayTasks = records.filter(r => r.date === today);
    document.getElementById('cntBadge').textContent = todayTasks.length;

    // 今日任务
    this.renderTodayTasks(records.filter(r => r.date === today));

    // 最近记录
    this.renderRecentRecords(records.slice(-5).reverse());
  },

  renderTodayTasks(tasks) {
    const el = document.getElementById('todayTasks');
    if (!el) return;
    if (tasks.length === 0) {
      el.innerHTML = '<div class="task-empty">暂无任务，添加一个吧～</div>';
      return;
    }

    const typeNames = {
      jlx: '🍳 词汇',
      yf: '📖 语法',
      yd: '👂 听力',
      ydx: '📄 阅读',
      gs: '📐 高数',
      zy: '📚 专业课',
      other: '⚡ 其他'
    };

    el.innerHTML = tasks.map(t => `
      <div class="task-item ${t.done ? 'done' : ''}" onclick="App.toggleTask('${t.id}')">
        <div class="task-chk">✓</div>
        <span class="task-tag">${typeNames[t.type] || '⚡'}</span>
        <span>${t.content}</span>
        <span style="margin-left:auto;color:var(--t3);font-size:11px">${t.hours}h</span>
      </div>
    `).join('');
  },

  renderRecentRecords(records) {
    const el = document.getElementById('recList');
    if (!el) return;
    if (records.length === 0) {
      el.innerHTML = '<div class="task-empty">暂无记录</div>';
      return;
    }

    const typeNames = {
      jlx: '🍳 词汇',
      yf: '📖 语法',
      yd: '👂 听力',
      ydx: '📄 阅读',
      gs: '📐 高数',
      zy: '📚 专业课',
      other: '⚡ 其他'
    };

    el.innerHTML = records.map(r => `
      <div class="rec-item" onclick="App.showRecord('${r.id}')">
        <div class="rec-date">${r.date}</div>
        <span class="rec-type">${typeNames[r.type] || '⚡'}</span>
        <span class="rec-content">${r.content}</span>
        <span style="margin-left:auto;color:var(--t3);font-size:11px">${r.hours}h</span>
      </div>
    `).join('');
  },

  saveRecord() {
    const date = document.getElementById('rDate').value;
    const type = document.getElementById('rType').value;
    const content = document.getElementById('rContent').value.trim();
    const notes = document.getElementById('rNotes').value.trim();
    const hours = document.getElementById('rHours').value;

    if (!date || !content) {
      UI.showNotify('请填写日期和内容');
      return;
    }

    Storage.addRecord({ date, type, content, notes, hours, done: false });
    UI.closeAddModal();
    UI.showNotify('✅ 记录已保存');
    this.init();
  },

  deleteRecord() {
    if (!this.currentRecordId) return;
    UI.showConfirm('确定删除这条记录？', () => {
      Storage.deleteRecord(this.currentRecordId);
      UI.showNotify('🗑️ 已删除');
      this.currentRecordId = null;
      this.loadAllRecords();
      UI.switchView('recs');
    });
  },

  showRecord(id) {
    const data = Storage.getData();
    const record = data.records.find(r => r.id === id);
    if (!record) return;

    this.currentRecordId = id;

    const typeNames = {
      jlx: '🍳 词汇',
      yf: '📖 语法',
      yd: '👂 听力',
      ydx: '📄 阅读',
      gs: '📐 高数',
      zy: '📚 专业课',
      other: '⚡ 其他'
    };

    document.getElementById('dtDate').textContent = record.date;
    document.getElementById('dtMeta').textContent = `${typeNames[record.type] || '⚡'} · ${record.hours}小时`;
    document.getElementById('dtTl').innerHTML = `
      <div class="tl-item">
        <div class="tl-text">${record.content}</div>
      </div>
    `;
    document.getElementById('dtNotes').textContent = record.notes || '无备注';

    UI.switchView('detail');
  },

  showDateRecords(date) {
    const records = Storage.getData().records.filter(r => r.date === date);
    if (records.length === 0) {
      UI.showNotify('这天没有记录');
      return;
    }
    this.renderAllRecords(records);
    UI.switchView('recs');
  },

  loadAllRecords() {
    const records = Storage.getData().records;
    this.renderAllRecords(records);
  },

  renderAllRecords(records) {
    const typeNames = {
      jlx: '🍳 词汇',
      yf: '📖 语法',
      yd: '👂 听力',
      ydx: '📄 阅读',
      gs: '📐 高数',
      zy: '📚 专业课',
      other: '⚡ 其他'
    };

    const el = document.getElementById('allList');
    if (!el) return;
    document.getElementById('totalTxt').textContent = records.length;

    if (records.length === 0) {
      el.innerHTML = '<div class="task-empty">暂无记录，添加一个吧～</div>';
      return;
    }

    el.innerHTML = [...records].reverse().map(r => `
      <div class="rec-item" onclick="App.showRecord('${r.id}')">
        <div class="rec-date">${r.date}</div>
        <span class="rec-type">${typeNames[r.type] || '⚡'}</span>
        <span class="rec-content">${r.content}</span>
        <span style="margin-left:auto;color:var(--t3);font-size:11px">${r.hours}h</span>
      </div>
    `).join('');
  },

  generateWeekly() {
    const input = document.getElementById('wkPick').value;
    if (!input) {
      UI.showNotify('请选择周次');
      return;
    }

    const [year, rest] = input.split('-W');
    const week = parseInt(rest);

    const records = Storage.getRecordsByWeek(parseInt(year), week);
    if (records.length === 0) {
      UI.showNotify('这周没有记录');
      return;
    }

    const report = Weekly.generate(records, parseInt(year), week);
    document.getElementById('wkContent').innerHTML = Weekly.renderReport(report);
    UI.closeWeeklyModal();
    UI.showNotify('📊 周报已生成');
  },

  changeCalendar(delta) {
    Calendar.changeMonth(delta);
  },

  exportData() {
    Storage.exportData();
    UI.showNotify('📤 数据已导出');
  },

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      Storage.importData(e.target.files[0])
        .then(() => {
          UI.showNotify('📥 数据已导入');
          this.init();
        })
        .catch(() => UI.showNotify('❌ 导入失败'));
    };
    input.click();
  },

  clearAllConfirm() {
    UI.showConfirm('确定清除所有数据？此操作不可恢复！', () => {
      Storage.clearAll();
      UI.showNotify('🗑️ 数据已清除');
      this.init();
    });
  },

  // ========== 每日记录功能 ==========

  loadDailyRecords() {
    const records = Storage.getDailyRecords();
    this.renderDailyRecords(records);
  },

  renderDailyRecords(records) {
    const el = document.getElementById('dailyList');
    if (!el) return;

    if (records.length === 0) {
      el.innerHTML = '<div class="task-empty">暂无记录，点击「记录今日」开始～</div>';
      return;
    }

    el.innerHTML = [...records].reverse().map(r => {
      const score = parseInt(r.score) || 0;
      const scoreClass = score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low';
      const timeline = r.timeline.split('\n').slice(0, 3).join('；');
      return `
        <div class="rec-item" onclick="App.showDailyRecord('${r.id}')">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="rec-date">${r.date}</div>
            <div class="score-badge ${scoreClass}" style="font-size:14px;padding:4px 10px">${score}分</div>
          </div>
          <div class="rec-content" style="margin-top:6px">${timeline}${r.timeline.split('\n').length > 3 ? '...' : ''}</div>
        </div>
      `;
    }).join('');
  },

  showDailyRecord(id) {
    const record = Storage.getDailyRecord(id);
    if (!record) return;

    this.currentDailyId = id;

    const score = parseInt(record.score) || 0;
    document.getElementById('ddDate').textContent = record.date;
    document.getElementById('ddMeta').textContent = `自评 ${score} 分`;
    
    const scoreClass = score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low';
    document.getElementById('ddScore').textContent = score + '分';
    document.getElementById('ddScore').className = 'score-badge ' + scoreClass;

    // 时间线
    const timelineHtml = record.timeline.split('\n').map(line => {
      const match = line.match(/^(\d{1,2}:\d{2})\s*[-–]\s*(.+)$/);
      if (match) {
        return `<div class="tl-item"><div class="tl-time">${match[1]}</div><div class="tl-text">${match[2]}</div></div>`;
      }
      return `<div class="tl-item"><div class="tl-text">${line}</div></div>`;
    }).join('');
    document.getElementById('ddTl').innerHTML = timelineHtml;
    document.getElementById('ddNotes').textContent = record.notes || '无备注';
    
    // AI 评价
    const aiAuditEl = document.getElementById('ddAiAudit');
    if (aiAuditEl && record.aiAudit) {
      aiAuditEl.style.display = 'block';
      aiAuditEl.innerHTML = `<div style="background:rgba(108,92,231,.1);padding:12px;border-radius:8px;margin-top:8px"><strong style="color:var(--ac2)">🤖 uiki 评价</strong><p style="margin-top:8px;white-space:pre-wrap">${record.aiAudit}</p></div>`;
    } else if (aiAuditEl) {
      aiAuditEl.style.display = 'none';
    }

    UI.switchView('dailyDetail');
  },

  saveDailyRecord() {
    const date = document.getElementById('dailyDate').value;
    const timeline = document.getElementById('dailyTimeline').value.trim();
    const notes = document.getElementById('dailyNotes').value.trim();
    const score = parseInt(document.getElementById('dailyScore').value) || 80;
    const aiAudit = document.getElementById('dailyAIAudit').value.trim();

    if (!date || !timeline) {
      UI.showNotify('请填写日期和时间线');
      return;
    }

    Storage.addDailyRecord({ date, timeline, notes, score, aiAudit });
    UI.closeDailyModal();
    UI.showNotify('✅ 每日记录已保存');
    this.init();
    this.loadDailyRecords();
  },

  deleteDailyRecord() {
    if (!this.currentDailyId) return;
    UI.showConfirm('确定删除这条记录？', () => {
      Storage.deleteDailyRecord(this.currentDailyId);
      UI.showNotify('🗑️ 已删除');
      this.currentDailyId = null;
      this.loadDailyRecords();
      UI.switchView('daily');
    });
  },

  toggleTask(id) {
    const data = Storage.getData();
    const idx = data.records.findIndex(r => r.id === id);
    if (idx !== -1) {
      data.records[idx].done = !data.records[idx].done;
      Storage.saveData(data);
      this.init();
    }
  }
};

// Init on load
document.addEventListener('DOMContentLoaded', () => App.init());
