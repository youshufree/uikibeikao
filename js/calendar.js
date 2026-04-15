// Calendar Module
const Calendar = {
  currentDate: new Date(),
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),

  init(miniCalId, fullCalId) {
    this.miniCalId = miniCalId;
    this.fullCalId = fullCalId;
    this.renderMini();
    this.renderFull();
  },

  renderMini() {
    const el = document.getElementById(this.miniCalId);
    if (!el) return;

    const d = new Date(this.calYear, this.calMonth, 1);
    const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const startDay = d.getDay() || 7;
    const records = Storage.getData().records;
    const recordDates = new Set(records.map(r => r.date));
    const today = new Date().toISOString().split('T')[0];

    document.getElementById('calLbl').textContent = `${this.calYear}年${this.calMonth + 1}月`;

    let html = '<div class="cal-head">一</div><div class="cal-head">二</div><div class="cal-head">三</div><div class="cal-head">四</div><div class="cal-head">五</div><div class="cal-head">六</div><div class="cal-head">日</div>';

    for (let i = 1; i < startDay; i++) {
      html += `<div class="cal-day other"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.calYear}-${String(this.calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let cls = 'cal-day';
      if (dateStr === today) cls += ' today';
      if (recordDates.has(dateStr)) cls += ' has-record';
      html += `<div class="${cls}">${day}</div>`;
    }

    el.innerHTML = html;
  },

  renderFull() {
    const el = document.getElementById(this.fullCalId);
    if (!el) return;

    document.getElementById('calVm').textContent = `${this.calYear}年${this.calMonth + 1}月`;

    const d = new Date(this.calYear, this.calMonth, 1);
    const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const startDay = d.getDay() || 7;
    const records = Storage.getData().records;
    const recordDates = new Set(records.map(r => r.date));
    const today = new Date().toISOString().split('T')[0];

    let html = '<div class="cal-head">一</div><div class="cal-head">二</div><div class="cal-head">三</div><div class="cal-head">四</div><div class="cal-head">五</div><div class="cal-head">六</div><div class="cal-head">日</div>';

    for (let i = 1; i < startDay; i++) {
      html += `<div class="cal-day other"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.calYear}-${String(this.calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let cls = 'cal-day';
      if (dateStr === today) cls += ' today';
      if (recordDates.has(dateStr)) cls += ' has-record';
      html += `<div class="${cls}" onclick="App.showDateRecords('${dateStr}')">${day}</div>`;
    }

    el.innerHTML = html;
  },

  changeMonth(delta) {
    this.calMonth += delta;
    if (this.calMonth > 11) {
      this.calMonth = 0;
      this.calYear++;
    } else if (this.calMonth < 0) {
      this.calMonth = 11;
      this.calYear--;
    }
    this.renderMini();
    this.renderFull();
  }
};
