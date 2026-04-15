// Storage Module
const Storage = {
  KEY: 'exam_tracker_data',

  getData() {
    const d = localStorage.getItem(this.KEY);
    return d ? JSON.parse(d) : { records: [], settings: {} };
  },

  saveData(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  addRecord(record) {
    const data = this.getData();
    data.records.push({
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    });
    this.saveData(data);
    return data;
  },

  deleteRecord(id) {
    const data = this.getData();
    data.records = data.records.filter(r => r.id !== id);
    this.saveData(data);
    return data;
  },

  getRecordsByDate(date) {
    const data = this.getData();
    return data.records.filter(r => r.date === date);
  },

  getRecordsByWeek(year, week) {
    const data = this.getData();
    const startOfWeek = this.getWeekStart(year, week);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return data.records.filter(r => {
      const d = new Date(r.date);
      return d >= startOfWeek && d <= endOfWeek;
    });
  },

  getWeekStart(year, week) {
    const jan4 = new Date(year, 0, 4);
    const days = (week - 1) * 7;
    const diff = jan4.getDay() - 1;
    return new Date(jan4.getTime() + (days - diff) * 86400000);
  },

  exportData() {
    const data = this.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-tracker-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          this.saveData(data);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  // ========== 每日记录 ==========

  getDailyRecords() {
    const data = this.getData();
    return data.dailyRecords || [];
  },

  getDailyRecord(id) {
    const records = this.getDailyRecords();
    return records.find(r => r.id === id);
  },

  addDailyRecord(record) {
    const data = this.getData();
    if (!data.dailyRecords) data.dailyRecords = [];
    data.dailyRecords.push({
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      score: parseInt(record.score) || 80,
      aiAudit: record.aiAudit || ''
    });
    this.saveData(data);
    return data;
  },

  deleteDailyRecord(id) {
    const data = this.getData();
    if (data.dailyRecords) {
      data.dailyRecords = data.dailyRecords.filter(r => r.id !== id);
    }
    this.saveData(data);
    return data;
  },

  clearAll() {
    localStorage.removeItem(this.KEY);
  }
};
