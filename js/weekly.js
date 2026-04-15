// Weekly Report Module
const Weekly = {
  generate(records, year, week) {
    const typeStats = { jlx: 0, yf: 0, yd: 0, ydx: 0, gs: 0, zy: 0, other: 0 };
    let totalHours = 0;
    let days = new Set();

    records.forEach(r => {
      typeStats[r.type] = (typeStats[r.type] || 0) + (parseFloat(r.hours) || 0);
      totalHours += parseFloat(r.hours) || 0;
      days.add(r.date);
    });

    const typeNames = {
      jlx: '🍳 词汇',
      yf: '📖 语法',
      yd: '👂 听力',
      ydx: '📄 阅读',
      gs: '📐 高数',
      zy: '📚 专业课',
      other: '⚡ 其他'
    };

    const phase = this.getCurrentPhase();
    const analysis = this.getAnalysis(typeStats, totalHours, days.size, phase);

    return {
      year,
      week,
      totalHours: totalHours.toFixed(1),
      days: days.size,
      types: typeStats,
      typeNames,
      analysis
    };
  },

  getCurrentPhase() {
    const now = new Date();
    const month = now.getMonth() + 1;
    if (month >= 4 && month <= 5) return 1;
    if (month >= 6 && month <= 9) return 2;
    if (month >= 10 && month <= 12) return 3;
    return 4;
  },

  getAnalysis(types, totalHours, days, phase) {
    const analyses = [];
    const phaseNames = ['日语四级攻坚', '高数+专业课', '强化冲刺', '冲刺模拟'];

    if (phase === 1) {
      if (types.jlx > 0 || types.yf > 0 || types.yd > 0 || types.ydx > 0) {
        analyses.push({ type: '✅ 日语学习', text: '有日语学习记录，继续保持！' });
      } else {
        analyses.push({ type: '⚠️ 日语提醒', text: '本周日语学习较少，建议增加词汇和听力的时间投入。' });
      }
      if (types.gs > 2) {
        analyses.push({ type: '💡 高数提醒', text: '高数学习较多，但现阶段请以日语为主，高数每天1小时保持感觉即可。' });
      }
    }

    if (totalHours < 10) {
      analyses.push({ type: '⚠️ 学习时长', text: `本周共${totalHours.toFixed(1)}小时，平均每天${(totalHours / 7).toFixed(1)}小时，建议增加到每天3小时。` });
    } else if (totalHours >= 21) {
      analyses.push({ type: '🌟 学习时长', text: `本周${totalHours.toFixed(1)}小时，学习很投入！注意休息，保持效率。` });
    }

    return analyses;
  },

  renderReport(report) {
    let html = `
      <div class="wk-card">
        <div class="wk-hd">
          <h3>${report.year}年第${report.week}周</h3>
          <span style="color:var(--t3);font-size:12px">${report.days}天有学习记录</span>
        </div>
        <div class="wk-stat">
          <div class="wk-stat-item">
            <b>${report.totalHours}</b>
            <small>总学习(小时)</small>
          </div>
          <div class="wk-stat-item">
            <b>${report.days}</b>
            <small>学习天数</small>
          </div>
          <div class="wk-stat-item">
            <b>${report.days > 0 ? (report.totalHours / report.days).toFixed(1) : 0}</b>
            <small>日均(小时)</small>
          </div>
        </div>
        <div style="margin-bottom:12px">
          <div style="font-size:12px;color:var(--t3);margin-bottom:8px">📊 学习分布</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
    `;

    Object.entries(report.types).forEach(([type, hours]) => {
      if (hours > 0) {
        html += `<span style="background:var(--bg3);padding:4px 10px;border-radius:4px;font-size:11px">${report.typeNames[type]}: ${hours.toFixed(1)}h</span>`;
      }
    });

    html += `</div></div>`;

    if (report.analysis.length > 0) {
      html += `<div>`;
      report.analysis.forEach(a => {
        html += `<div class="ana-box"><h5>${a.type}</h5><p>${a.text}</p></div>`;
      });
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  }
};
