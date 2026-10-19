const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'Code.gs'), 'utf8');
const headers = ['STT', 'Nội dung câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng'];
function readOnlySheet(rows) {
  return {
    getLastRow() { return rows.length; },
    getRange(row, column, height = 1, width = 1) {
      if (row === 'B1') return { getValue() { return (rows[0] || [])[1]; } };
      return { getValues() {
        return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => (rows[row - 1 + y] || [])[column - 1 + x]));
      } };
    }
  };
}

let rawSeconds = 30;
const exam12 = readOnlySheet([headers, [1201, 'Câu riêng Lớp 12', 'A12', 'B12', 'C12', 'D12', 'C']]);
const sheets = {
  'cai-dat': { getRange(cell) { assert.equal(cell, 'B1'); return { getValue() { return rawSeconds; } }; } },
  DeThi: readOnlySheet([headers, [1, 'Câu riêng Lớp 10', 'A10', 'B10', 'C10', 'D10', 'B']]),
  Dethi11: readOnlySheet([headers, [1, 'Câu riêng Lớp 11', 'A11', 'B11', 'C11', 'D11', 'D']]),
  Dethi12: exam12
};
const logs = [];
const context = vm.createContext({
  SpreadsheetApp: { getActiveSpreadsheet() { return {
    getSheetByName(name) { return sheets[name] || null; },
    insertSheet() { throw new Error('Reading configuration/exams must not create or overwrite sheets'); }
  }; } },
  Logger: { log(message) { logs.push(message); } }
});
vm.runInContext(source, context);

for (const [raw, expected] of [[30, 30], ['45', 45], [' 20 ', 20], [1, 1], ['', 15], [null, 15], [0, 15], [-3, 15], ['abc', 15], [1.5, 15], [true, 15], [Infinity, 15]]) {
  rawSeconds = raw;
  assert.equal(context.getQuizSettings().timeLimitSeconds, expected, 'Unexpected time for B1=' + String(raw));
}
const settingsSheet = sheets['cai-dat'];
delete sheets['cai-dat'];
assert.equal(context.getQuizSettings().timeLimitSeconds, 15);
sheets['cai-dat'] = settingsSheet;
console.log('PASS: cai-dat!B1 accepts positive whole seconds and defaults safely to 15');

rawSeconds = 30;
for (const grade of ['10', '11', '12', 12]) {
  const data = context.getQuizData(grade);
  assert.equal(data.grade, String(grade));
  assert.equal(data.timeLimitSeconds, 30);
  assert.equal(data.questions.length, 1);
  assert.equal(data.questions[0].question, 'Câu riêng Lớp ' + grade);
  assert.equal(data.questions[0].timeLimit, 30);
  assert.equal(data.questions[0].correctIndex, undefined);
}
assert.equal(context.getQuizQuestions('12')[0].id, 1201);
assert.equal(context.getQuizData('unknown').grade, '10');
rawSeconds = 45;
assert.equal(context.getQuizData('12').timeLimitSeconds, 45);
assert.equal(context.initDeThi12Sheet(), exam12);
console.log('PASS: all three grades use the correct existing sheet, hide answers and read fresh settings');

delete sheets.Dethi12;
assert.equal(context.getQuizData('12').questions.length, 0);
sheets.Dethi12 = readOnlySheet([headers]);
assert.equal(context.getQuizQuestions('12').length, 0);
sheets.Dethi12 = readOnlySheet([headers, ['', '', '', '', '', '', '']]);
assert.equal(context.getQuizData('12').questions.length, 0);
const emptySubmission = context.submitQuizResults({ studentInfo: { grade: '12' }, answers: {} });
assert.equal(emptySubmission.success, false);
assert.match(emptySubmission.message, /Khối 12 chưa có câu hỏi/);
console.log('PASS: missing or empty grade 12 neither falls back to grade 10 nor creates a zero-question result');
