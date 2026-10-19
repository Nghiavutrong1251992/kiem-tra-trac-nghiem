const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the real Apps Script functions against an in-memory sheet.
class Sheet {
  constructor(rows = []) {
    this.rows = rows.map(row => row.slice());
    this.maxColumns = Math.max(26, ...this.rows.map(row => row.length));
  }
  getLastColumn() { return Math.max(0, ...this.rows.map(row => row.length)); }
  getMaxColumns() { return this.maxColumns; }
  insertColumnsAfter(_after, count) { this.maxColumns += count; }
  getRange(row, column, height = 1, width = 1) {
    const sheet = this;
    const range = {
      getValues() {
        return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => (sheet.rows[row - 1 + y] || [])[column - 1 + x] || ''));
      },
      setValue(value) { return this.setValues([[value]]); },
      setValues(values) {
        values.forEach((valuesRow, y) => valuesRow.forEach((value, x) => {
          if (!sheet.rows[row - 1 + y]) sheet.rows[row - 1 + y] = [];
          sheet.rows[row - 1 + y][column - 1 + x] = value;
        }));
        return this;
      }
    };
    ['setBackground', 'setFontColor', 'setFontWeight', 'setHorizontalAlignment', 'setNote'].forEach(name => {
      range[name] = function () { return this; };
    });
    return range;
  }
  setColumnWidth() {}
  setFrozenRows() {}
  setRowHeight() {}
  autoResizeColumns() {}
  appendRow(row) { this.rows.push(Array.from(row)); }
}

const source = fs.readFileSync(path.join(__dirname, '..', 'Code.gs'), 'utf8');
const oldHeaders = ['Thời Gian Nộp', 'Họ và Tên', 'Mã SV / Lớp', 'Khối Thi', 'Số Điện Thoại', 'Điểm Số (Thang 10)', 'Số Câu Đúng', 'Tổng Số Câu', 'Tỉ Lệ Đúng (%)', 'Chi Tiết Câu Trả Lời'];
function contextFor(sheet) {
  const context = vm.createContext({
    SpreadsheetApp: { getActiveSpreadsheet() { return { getSheetByName() { return sheet; } }; } },
    Utilities: { formatDate() { return '18/10/2026 23:00:00'; } },
    Logger: { log(message) { throw new Error(message); } }
  });
  vm.runInContext(source, context);
  context.loadQuestionsFromSheet = function () {
    return [{ id: 1, question: 'Câu kiểm thử', options: ['A', 'B', 'C', 'D'], correctIndex: 0 }];
  };
  return context;
}
function audit(flags = {}) {
  return { version: 1, phoneReported: true, flags: Object.assign({ desktopUaSeen: false, mobileDesktopMismatch: false, f12Pressed: false, devtoolsShortcutPressed: false }, flags) };
}

const oldRow = ['Hôm trước', 'Thí sinh cũ', '10A1', 'Lớp 10', '', 8, 8, 10, '80%', 'Kết quả cũ'];
const sheet = new Sheet([oldHeaders, oldRow]);
const context = contextFor(sheet);
const result = context.submitQuizResults({ studentInfo: { fullName: 'Kiểm thử', grade: '10' }, answers: { 1: { originalIndex: 0, text: 'A' } }, deviceAudit: audit({ mobileDesktopMismatch: true, f12Pressed: true }) });
assert.equal(result.success, true);
assert.equal(result.score, '10.0');
assert.deepEqual(sheet.rows[1], oldRow);
assert.equal(sheet.rows[0][10], 'Cảnh Báo Thiết Bị / F12');
assert.match(sheet.rows[2][10], /Nghi vấn máy tính giả lập điện thoại/);
assert.match(sheet.rows[2][10], /nhận được phím F12/);
assert.equal(sheet.rows[2][1], 'Kiểm thử');
assert.equal(sheet.rows[2][5], 10);
console.log('PASS: warning is saved with the correct pupil and score; old results are preserved');

const customHeaders = oldHeaders.concat('Ghi chú riêng');
const customRow = oldRow.concat('Không được sửa');
const customSheet = new Sheet([customHeaders, customRow]);
const customContext = contextFor(customSheet);
assert.equal(customContext.ensureDeviceWarningColumn_(customSheet), 12);
assert.equal(customContext.ensureDeviceWarningColumn_(customSheet), 12);
assert.equal(customSheet.rows[0][10], 'Ghi chú riêng');
assert.deepEqual(customSheet.rows[1], customRow);
assert.equal(customSheet.rows[0].filter(value => value === 'Cảnh Báo Thiết Bị / F12').length, 1);
console.log('PASS: schema update preserves custom columns and does not duplicate the warning column');

const fullSheet = new Sheet([Array.from({ length: 26 }, (_, index) => 'Cột riêng ' + index)]);
const fullContext = contextFor(fullSheet);
assert.equal(fullContext.ensureDeviceWarningColumn_(fullSheet), 27);
assert.equal(fullSheet.getMaxColumns(), 27);
console.log('PASS: warning column is added even when all existing grid columns are occupied');

assert.match(context.formatDeviceWarning_(audit()), /^Không ghi nhận dấu hiệu nghi vấn/);
assert.match(context.formatDeviceWarning_(undefined), /^Không có đủ thông tin/);
assert.match(context.formatDeviceWarning_({ version: 1, flags: {} }), /^Không có đủ thông tin/);
const hostileInput = audit({ desktopUaSeen: true });
hostileInput.reason = '=IMPORTXML("https://example.invalid", "//data")';
assert.doesNotMatch(context.formatDeviceWarning_(hostileInput), /IMPORTXML|example.invalid/);
assert.match(context.formatDeviceWarning_(hostileInput), /nhận diện máy tính/);
console.log('PASS: absent audit data is explicit and client-provided strings are not written to cells');

let gradedSheetName;
context.loadQuestionsFromSheet = function (sheetName) {
  gradedSheetName = sheetName;
  return [{ id: 1201, question: 'Câu Lớp 12', options: ['A', 'B', 'C', 'D'], correctIndex: 2 }];
};
const grade12Result = context.submitQuizResults({ studentInfo: { fullName: 'Thí sinh 12', grade: '12' }, answers: { 1201: { originalIndex: 2, text: 'C' } }, deviceAudit: audit() });
assert.equal(grade12Result.success, true);
assert.equal(grade12Result.score, '10.0');
assert.equal(gradedSheetName, 'Dethi12');
assert.equal(sheet.rows[sheet.rows.length - 1][3], 'Lớp 12');
console.log('PASS: grade 12 is graded against Dethi12 and saved as Lớp 12');
