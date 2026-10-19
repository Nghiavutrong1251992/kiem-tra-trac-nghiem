// Run with: node tests/quiz-browser-smoke.cjs
// Uses an isolated headless Chrome profile, never the user's browser session.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'Index.html'), 'utf8');
const scripts = Array.from(html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi));
scripts.forEach((match, index) => new vm.Script(match[1], { filename: 'Index-script-' + (index + 1) }));
const serverCode = fs.readFileSync(path.join(root, 'Code.gs'), 'utf8');
new vm.Script(serverCode, { filename: 'Code.gs' });

// The HTML has no template scriptlets; doGet must serve it without evaluation.
const htmlCalls = [];
const output = {};
['setTitle', 'addMetaTag', 'setXFrameOptionsMode'].forEach(name => {
  output[name] = function () { return output; };
});
const serverContext = vm.createContext({
  HtmlService: {
    createHtmlOutputFromFile(name) { htmlCalls.push(name); return output; },
    XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' }
  }
});
vm.runInContext(serverCode, serverContext);
assert.equal(vm.runInContext('doGet({})', serverContext), output);
assert.deepEqual(htmlCalls, ['Index']);

async function browserTests() {
  const results = [];
  const failures = [];
  const userAgents = {
    android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    ipad: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    androidTablet: 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  };
  const platforms = { android: 'Linux armv8l', iphone: 'iPhone', desktop: 'Win32', mac: 'MacIntel', linux: 'Linux x86_64', ipad: 'iPad', androidTablet: 'Linux armv8l' };
  const hintsPlatforms = { android: 'Android', iphone: 'iOS', desktop: 'Windows', mac: 'macOS', linux: 'Linux', ipad: 'iOS', androidTablet: 'Android' };
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  function check(condition, message) {
    if (!condition) throw new Error(message);
  }
  async function mount(options = {}) {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    frame.style.width = (options.width || 390) + 'px';
    frame.style.height = '844px';
    document.body.appendChild(frame);
    let source = window.quizSource;
    let setupSource = 'Object.defineProperty(navigator, "userAgent", {configurable:true,value:' + JSON.stringify(userAgents[options.device || 'android']) + '});';
    setupSource += 'Object.defineProperty(navigator, "platform", {configurable:true,value:' + JSON.stringify(options.platform || platforms[options.device || 'android']) + '});';
    setupSource += 'Object.defineProperty(navigator, "userAgentData", {configurable:true,value:{platform:' + JSON.stringify(hintsPlatforms[options.device || 'android']) + '}});';
    setupSource += 'try { sessionStorage.removeItem("quizDeviceAudit.v1"); } catch (error) {}';
    if (options.savedAudit) {
      setupSource += 'sessionStorage.setItem("quizDeviceAudit.v1", ' + JSON.stringify(JSON.stringify(options.savedAudit)) + ');';
    }
    if (options.setup) {
      setupSource += '(' + options.setup.toString() + ')();';
    }
    source = source.replace('<head>', '<head><script>' + setupSource + '<\/script>');
    if (options.syntaxError) {
      source = source.replace('const LOCAL_FALLBACK_QUESTIONS_10 = [', 'const LOCAL_FALLBACK_QUESTIONS_10 = @ [');
    }
    const doc = frame.contentDocument;
    doc.open();
    doc.write(source);
    doc.close();
    await pause(30);
    const win = frame.contentWindow;
    return { frame, doc, win, get: id => doc.getElementById(id) };
  }
  async function test(name, run) {
    try {
      await run();
      results.push('PASS: ' + name);
    } catch (error) {
      failures.push(name + ': ' + error.message);
    } finally {
      document.querySelectorAll('iframe').forEach(frame => frame.remove());
    }
  }
  async function answerWarmup(app) {
    for (let index = 0; index < 3; index++) {
      const button = app.doc.querySelector('.opt-btn');
      check(button, 'Warm-up answer is missing');
      button.click();
      await pause(650);
    }
    check(app.get('screen-warmup-done').classList.contains('active'), 'Warm-up did not finish');
  }

  for (const device of ['desktop', 'mac', 'linux', 'ipad', 'androidTablet']) {
    await test('blocks ' + device + ' even when start functions are called directly', async () => {
      const app = await mount({ device, width: 1200 });
      check(app.win.quizAppReady, 'Application did not initialize');
      check(app.get('screen-device-blocked').classList.contains('active'), 'Device was not blocked');
      check(app.get('btn-start').disabled, 'Start button was enabled');
      app.win.startQuiz();
      app.win.restartWarmup();
      app.win.startOfficialQuiz();
      app.win.showScreen('screen-quiz');
      app.get('btn-recheck-device').click();
      check(app.get('screen-device-blocked').classList.contains('active'), 'Device bypassed the block');
      check(app.doc.querySelectorAll('.opt-btn').length === 0, 'Blocked device loaded question options');
      check(app.get('app-error').hidden, 'Device check produced an error');
    });
  }

  await test('small screen and touch support do not unblock a Windows laptop', async () => {
    const app = await mount({ device: 'desktop', width: 390, setup: function () {
      Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 10 });
    } });
    check(app.win.innerWidth <= 390, 'Narrow viewport was not configured');
    check(app.get('screen-device-blocked').classList.contains('active'), 'Touch laptop bypassed the block');
  });

  await test('iPhone opens the welcome screen and can start warm-up', async () => {
    const app = await mount({ device: 'iphone' });
    check(app.get('screen-welcome').classList.contains('active'), 'iPhone was blocked');
    app.get('btn-start').click();
    check(app.get('screen-quiz').classList.contains('active'), 'iPhone could not start');
    check(app.doc.querySelectorAll('.opt-btn').length === 4, 'iPhone answers were not rendered');
    check(Object.values(app.win.collectDeviceAudit().flags).every(flag => flag === false), 'Normal iPhone was flagged');
  });

  await test('mobile identity on a desktop platform is reported as suspicious', async () => {
    const app = await mount({ device: 'android', platform: 'Win32' });
    check(app.win.collectDeviceAudit().flags.mobileDesktopMismatch, 'Mobile/desktop mismatch was not reported');
    check(app.get('screen-welcome').classList.contains('active'), 'Suspicion alone incorrectly blocked the quiz');
  });

  await test('desktop and F12 observations survive a mobile-emulation reload', async () => {
    const desktop = await mount({ device: 'desktop' });
    desktop.doc.dispatchEvent(new desktop.win.KeyboardEvent('keydown', { key: 'F12', code: 'F12', bubbles: true }));
    const saved = JSON.parse(desktop.win.sessionStorage.getItem('quizDeviceAudit.v1'));
    check(saved.desktopUaSeen && saved.f12Pressed, 'Desktop/F12 observations were not saved');
    desktop.frame.remove();
    const phone = await mount({ device: 'android', savedAudit: saved });
    const audit = phone.win.collectDeviceAudit();
    check(audit.phoneReported && audit.flags.desktopUaSeen && audit.flags.f12Pressed, 'Reload lost earlier desktop/F12 observations');
  });

  await test('unavailable session storage does not break starting the quiz', async () => {
    const app = await mount({ setup: function () {
      Object.defineProperty(window, 'sessionStorage', { configurable: true, get() { throw new Error('Storage unavailable'); } });
    } });
    app.doc.dispatchEvent(new app.win.KeyboardEvent('keydown', { key: 'F12', bubbles: true }));
    app.get('btn-start').click();
    check(app.get('screen-quiz').classList.contains('active'), 'Storage failure prevented starting');
    check(app.win.collectDeviceAudit().flags.f12Pressed, 'Current-page signal was lost without storage');
    check(app.get('app-error').hidden, 'Storage failure showed an application error');
  });

  await test('Android clicks, both grades, warm-up retry and official start', async () => {
    const app = await mount();
    check(app.win.quizAppReady, 'Application did not initialize');
    check(!app.get('btn-start').disabled, 'Start button stayed disabled');
    app.get('btn-grade-11').click();
    check(app.get('grade-badge').textContent.includes('11'), 'Grade 11 click did not work');
    app.get('btn-grade-10').click();
    check(app.get('grade-badge').textContent.includes('10'), 'Grade 10 click did not work');
    app.get('btn-grade-11').click();
    app.get('input-name').value = 'Kiểm thử';
    app.get('btn-start').querySelector('span').click();
    check(app.get('screen-quiz').classList.contains('active'), 'Start click did not open quiz');
    check(app.get('q-text').textContent === '1. 1 + 1 = ?', 'First warm-up question is wrong');
    check(app.doc.querySelectorAll('.opt-btn').length === 4, 'Four answers were not rendered');
    await answerWarmup(app);
    app.get('btn-restart-warmup').click();
    check(app.get('screen-quiz').classList.contains('active'), 'Retry click did not start warm-up');
    await answerWarmup(app);
    app.get('btn-official').querySelector('span').click();
    check(app.get('q-progress').textContent === 'Câu 1 / 10', 'Official quiz did not start');
    check(app.get('timer-val').textContent === '15s', 'Official timer did not reset');
    check(app.get('app-error').hidden, 'Unexpected error: ' + app.get('app-error').textContent);
  });

  await test('15-second timeout preserves timer and advances to the next question', async () => {
    const app = await mount();
    app.get('btn-start').click();
    await pause(15800);
    check(app.get('q-progress').textContent.includes('2 / 3'), 'Timeout did not advance to question 2');
    check(app.get('timer-val'), 'Timeout removed the timer element');
    check(app.get('timer-val').textContent === '15s', 'Next question timer did not reset');
    check(app.get('app-error').hidden, 'Timeout produced an error: ' + app.get('app-error').textContent);
    app.doc.querySelector('.opt-btn').click();
    await pause(650);
    check(app.get('q-progress').textContent.includes('3 / 3'), 'Answer after timeout did not advance');
  });

  await test('Apps Script bridge loads questions and completes a submission', async () => {
    const app = await mount({ setup: function () {
      const run = {
        withSuccessHandler(handler) { this.success = handler; return this; },
        withFailureHandler(handler) { this.failure = handler; return this; },
        getQuizData(grade) {
          const done = this.success;
          setTimeout(function () {
            done({ grade, timeLimitSeconds: 15, questions: [{ id: 101, question: 'Đề máy chủ khối ' + grade, options: ['<b>Giữ nguyên chữ</b>', 'B', 'C', 'D'], timeLimit: 15 }] });
          }, 10);
        },
        submitQuizResults(payload) {
          window.submittedQuiz = payload;
          this.success({ success: true, score: '10.0', correctCount: 1, totalQuestions: 1, detailedResults: [{ question: '<b>Câu máy chủ</b>', userAnswerText: '<b>Giữ nguyên chữ</b>', correctAnswerText: 'B', isCorrect: false }] });
        }
      };
      window.google = { script: { run: run } };
    } });
    app.get('btn-grade-11').click();
    await pause(20);
    app.get('btn-start').click();
    await answerWarmup(app);
    app.get('btn-official').click();
    check(app.get('q-text').textContent.includes('Đề máy chủ khối 11'), 'Official quiz ignored server questions');
    check(!app.doc.querySelector('.opt-text b'), 'Answer text was interpreted as HTML');
    check(!app.win.collectDeviceAudit().flags.mobileDesktopMismatch, 'Normal Android was flagged');
    app.doc.dispatchEvent(new app.win.KeyboardEvent('keydown', { key: 'F12', code: 'F12', bubbles: true }));
    app.doc.dispatchEvent(new app.win.KeyboardEvent('keydown', { key: 'I', ctrlKey: true, shiftKey: true, bubbles: true }));
    app.doc.querySelector('.opt-btn').click();
    await pause(650);
    check(app.win.submittedQuiz.studentInfo.grade === '11', 'Submission used the wrong grade');
    check(Object.keys(app.win.submittedQuiz.answers).length === 1, 'Warm-up answers leaked into submission');
    check(app.win.submittedQuiz.deviceAudit.flags.f12Pressed, 'Submission omitted the F12 observation');
    check(app.win.submittedQuiz.deviceAudit.flags.devtoolsShortcutPressed, 'Submission omitted the DevTools shortcut observation');
    check(app.get('screen-result').classList.contains('active'), 'Result screen did not open');
    check(!app.doc.querySelector('.review-q b'), 'Review text was interpreted as HTML');
    check(app.get('review-list').textContent.includes('Đáp án đúng: B'), 'Correct answer was not rendered');
    check(app.get('app-error').hidden, 'Submission produced an error');
  });

  await test('configured two-second timer applies to warm-up, grade 12 and its submission', async () => {
    const app = await mount({ setup: function () {
      const run = {
        withSuccessHandler(handler) { this.success = handler; return this; },
        withFailureHandler(handler) { this.failure = handler; return this; },
        getQuizData(grade) {
          const done = this.success;
          setTimeout(function () {
            done({ grade, timeLimitSeconds: 2, questions: [{ id: 1201, question: 'Đề riêng Khối ' + grade, options: ['A', 'B', 'C', 'D'], timeLimit: 2 }] });
          }, 10);
        },
        submitQuizResults(payload) {
          window.submittedQuiz = payload;
          this.success({ success: true, score: '10.0', correctCount: 1, totalQuestions: 1, detailedResults: [] });
        }
      };
      window.google = { script: { run } };
    } });
    app.get('btn-grade-12').click();
    await pause(20);
    check(app.get('grade-badge').textContent.includes('12'), 'Grade 12 could not be selected');
    check(Array.from(app.doc.querySelectorAll('.question-time-limit')).every(element => element.textContent === '2'), 'Rules did not reflect the configured time');
    app.get('btn-start').click();
    check(app.get('timer-val').textContent === '2s', 'Warm-up timer ignored configuration');
    check(app.get('time-bar').style.width === '100%', 'Time bar did not start at 100%');
    await pause(2800);
    check(app.get('q-progress').textContent.includes('2 / 3'), 'Configured timeout did not advance');
    for (let index = 0; index < 2; index++) {
      app.doc.querySelector('.opt-btn').click();
      await pause(650);
    }
    check(app.get('screen-warmup-done').classList.contains('active'), 'Warm-up did not finish');
    app.get('btn-official').click();
    check(app.get('q-text').textContent.includes('Đề riêng Khối 12'), 'Wrong exam was loaded for grade 12');
    check(app.get('timer-val').textContent === '2s', 'Official timer ignored configuration');
    app.doc.querySelector('.opt-btn').click();
    await pause(650);
    check(app.win.submittedQuiz.studentInfo.grade === '12', 'Grade 12 was not submitted correctly');
    check(app.win.submittedQuiz.answers[1201], 'Grade 12 question id was not preserved');
    check(app.get('screen-result').classList.contains('active'), 'Grade 12 result did not open');
    check(app.get('app-error').hidden, 'Configured grade 12 quiz produced an error');
  });

  await test('empty grade 12 never falls back to grade 10', async () => {
    const app = await mount();
    app.get('btn-grade-12').click();
    check(app.get('btn-start').disabled, 'Empty grade 12 enabled starting');
    check(app.get('quiz-load-status').textContent.includes('chưa có câu hỏi'), 'Missing grade 12 was not explained');
    app.win.startQuiz();
    app.win.startOfficialQuiz();
    check(app.get('screen-welcome').classList.contains('active'), 'Empty grade 12 opened a quiz');
    check(app.doc.querySelectorAll('.opt-btn').length === 0, 'Grade 12 loaded fallback questions');
    app.get('btn-grade-10').click();
    check(!app.get('btn-start').disabled, 'Switching back to a valid grade did not recover');
  });

  await test('slow and stale requests cannot replace the selected grade or its time limit', async () => {
    const app = await mount({ setup: function () {
      const run = {
        withSuccessHandler(handler) { this.success = handler; return this; },
        withFailureHandler(handler) { this.failure = handler; return this; },
        getQuizData(grade) {
          const done = this.success;
          const delay = grade === '12' ? 120 : grade === '10' ? 80 : 20;
          setTimeout(function () {
            done({ grade, timeLimitSeconds: grade === '11' ? 30 : 2, questions: [{ id: Number(grade), question: 'Câu Khối ' + grade, options: ['A', 'B', 'C', 'D'] }] });
          }, delay);
        }
      };
      window.google = { script: { run } };
    } });
    check(app.get('btn-start').disabled, 'Start was enabled before loading finished');
    app.win.startQuiz();
    check(app.get('screen-welcome').classList.contains('active'), 'Started before configuration was ready');
    app.get('btn-grade-12').click();
    app.get('btn-grade-11').click();
    await pause(150);
    check(app.get('quiz-load-status').textContent.includes('30 giây'), 'Stale response changed the time limit');
    app.get('btn-start').click();
    check(app.get('timer-val').textContent === '30s', 'Warm-up did not use 30 seconds');
    check(app.get('time-bar').style.width === '100%', 'Thirty-second bar used the wrong denominator');
    app.win.startOfficialQuiz();
    check(app.get('q-text').textContent.includes('Câu Khối 11'), 'Stale response changed the selected exam');
    check(app.get('timer-val').textContent === '30s', 'Official quiz did not use 30 seconds');
  });

  await test('failed loading keeps start disabled and retry recovers', async () => {
    const app = await mount({ setup: function () {
      let attempts = 0;
      const run = {
        withSuccessHandler(handler) { this.success = handler; return this; },
        withFailureHandler(handler) { this.failure = handler; return this; },
        getQuizData(grade) {
          attempts++;
          if (attempts === 1) { this.failure(new Error('Network unavailable')); return; }
          this.success({ grade, timeLimitSeconds: 20, questions: [{ id: 1, question: 'Đề đã tải lại', options: ['A', 'B', 'C', 'D'] }] });
        }
      };
      window.google = { script: { run } };
    } });
    check(app.get('btn-start').disabled, 'Failed load enabled starting');
    check(!app.get('btn-reload-data').hidden, 'Retry was not offered');
    app.get('btn-reload-data').click();
    check(!app.get('btn-start').disabled, 'Retry did not recover');
    check(app.get('quiz-load-status').textContent.includes('20 giây'), 'Retry did not update configuration');
  });

  await test('syntax errors in the main script appear as a visible message', async () => {
    const app = await mount({ syntaxError: true });
    check(!app.win.quizAppReady, 'Invalid script unexpectedly initialized');
    check(!app.get('app-error').hidden, 'Syntax error was not shown');
    check(app.get('app-error').textContent.includes('Không thể chạy bài thi'), 'Error message is missing');
  });

  const report = document.getElementById('test-results');
  report.textContent = JSON.stringify({ results, failures });
  report.dataset.done = 'true';
}

const sourceWithoutFonts = html.replace(/<link\b[^>]*>/gi, '');
const serializedSource = JSON.stringify(sourceWithoutFonts).replace(/</g, '\\u003c');
const fixture = '<!doctype html><html><body><pre id="test-results"></pre><script>window.quizSource=' + serializedSource + ';(' + browserTests.toString() + ')().catch(function(error){document.getElementById("test-results").textContent=JSON.stringify({failures:[error.message]});document.getElementById("test-results").dataset.done="true";});<\/script></body></html>';
const server = http.createServer((_request, response) => {
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(fixture);
});
server.listen(0, '127.0.0.1', () => {
  const chrome = process.env.QUIZ_TEST_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-chrome-test-'));
  const child = spawn(chrome, [
    '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--user-data-dir=' + profile,
    '--virtual-time-budget=45000', '--dump-dom',
    'http://127.0.0.1:' + server.address().port
  ], { windowsHide: true });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', data => { stdout += data; });
  child.stderr.on('data', data => { stderr += data; });
  child.on('error', error => {
    console.error(error.message);
    server.close();
    process.exitCode = 1;
  });
  child.on('close', () => {
    server.close();
    const match = stdout.match(/<pre id="test-results" data-done="true">([\s\S]*?)<\/pre>/);
    if (!match) {
      console.error('Chrome did not return a completed test report.\n' + stderr.slice(-2500));
      process.exitCode = 1;
      return;
    }
    const decoded = match[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const report = JSON.parse(decoded);
    (report.results || []).forEach(line => console.log(line));
    report.failures.forEach(line => console.error('FAIL: ' + line));
    process.exitCode = report.failures.length ? 1 : 0;
  });
});
