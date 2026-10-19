/**
 * HỆ THỐNG TRẮC NGHIỆM TRỰC TUYẾN GOOGLE APPS SCRIPT
 * - Quản lý câu hỏi qua "DeThi" (Lớp 10), "Dethi11" và "Dethi12"
 * - Thời gian mỗi câu đọc từ ô B1 của sheet "cai-dat"
 * - Tự động chấm điểm và lưu kết quả về Sheet "KetQuaThi"
 */

// Tên các trang tính quản lý
const SHEET_DE_THI_10 = "DeThi";
const SHEET_DE_THI_11 = "Dethi11";
const SHEET_DE_THI_12 = "Dethi12";
const SHEET_CAI_DAT = "cai-dat";
const DEFAULT_TIME_LIMIT_SECONDS = 15;
const SHEET_KET_QUA = "KetQuaThi";
const DEVICE_WARNING_HEADER = "Cảnh Báo Thiết Bị / F12";

// 1. DỮ LIỆU ĐỀ THI GDQP-AN LỚP 10
const DEFAULT_QUESTIONS_10 = [
  [
    1,
    "Ngày đầu thành lập Đội Việt Nam Tuyên truyền Giải phóng quân có bao nhiêu người",
    "32",
    "33",
    "34",
    "35",
    "C"
  ],
  [
    2,
    "Cách đánh chủ yếu của Dân quân tự vệ trong thời chống Pháp và chống Mỹ là:",
    "Hiệp đồng binh chủng.",
    "Du kích.",
    "Tác chiến bằng các binh đoàn chủ lực.",
    "Đánh nhanh, thắng nhanh",
    "B"
  ],
  [
    3,
    "Anh hùng lực lượng vũ trang nào sau đây thuộc Công an nhân dân?",
    "Võ Thị Sáu",
    "Nguyễn Viết Xuân",
    "Anh hùng Lê Mã Lương",
    "Phạm Tuân",
    "A"
  ],
  [
    4,
    "Luật Giáo dục quốc phòng và an ninh năm 2013, gồm:",
    "8 chương, 47 điều",
    "8 chương, 57 điều",
    "9 chương, 57 điều",
    "9 chương, 47 điều",
    "A"
  ],
  [
    5,
    "Một trong những nguồn bổ sung cho sĩ quan tại ngũ của Quân đội?",
    "Sĩ quan dự bị",
    "Đảng viên Đảng Cộng sản Việt Nam",
    "Dân quân tự vệ",
    "Đoàn viên thanh niên Cộng sản Hồ Chí Minh",
    "A"
  ],
  [
    6,
    "Công dân trong độ tuổi gọi nhập ngũ được tuyển chọn vào phục vụ trong Công an nhân dân với thời hạn:",
    "12 tháng",
    "24 tháng",
    "36 tháng",
    "6 tháng",
    "B"
  ],
  [
    7,
    "Người nghiện ma túy thường bị ảo giác, hoang tưởng, kích động, rối loạn về nhận thức, cảm xúc là tác hại của ma túy gây tổn hại về:",
    "Tinh thần",
    "Sức khỏe",
    "Kinh tế",
    "Thể chất",
    "A"
  ],
  [
    8,
    "Ma tuý xâm nhâm vào cơ thể con người bằng cách nào:",
    "Qua hệ hô hấp, hệ tuần hoàn",
    "Qua hệ hô hấp, hệ tuần hoàn, hệ tiêu hoá",
    "Qua hệ hô hấp, hệ tuần hoàn, hệ bài tiết",
    "Qua hệ hô hấp, hệ tuần hoàn, hệ tiêu hóa và hệ bài tiết",
    "B"
  ],
  [
    9,
    "Thuốc lắc là dạng ma tuý",
    "Ma tuý công nghiệp",
    "Ma tuý tự nhiên",
    "Ma tuý tổng hợp",
    "Ma tuý bán tổng hợp",
    "C"
  ],
  [
    10,
    "Quá trình nghiện ma túy thường trải qua các giai đoạn nào?",
    "Sử dụng ma túy – nghiện ma túy – sử dụng thường xuyên",
    "Sử dụng ma túy – sử dụng lần đầu – sử dụng thường xuyên",
    "Sử dụng ma túy – lạm dụng ma túy – lệ thuộc ma túy",
    "Sử dụng ma túy – sử dụng thường xuyên – lệ thuộc ma túy",
    "C"
  ]
];

// 2. DỮ LIỆU ĐỀ THI GDQP-AN LỚP 11
const DEFAULT_QUESTIONS_11 = [
  [
    1,
    "Vùng nước tiếp giáp với bờ biển, ở phía trong đường cơ sở được gọi là",
    "Thềm lục địa",
    "Nội thủy",
    "Vùng tiếp giáp lãnh hải",
    "Lãnh hải",
    "B"
  ],
  [
    2,
    "Một trong những quan điểm chỉ đạo của Đảng về Chiến lược bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa trong tình hình mới là",
    "Chỉ chú trọng xây dựng sức mạnh của đất nước về văn hóa - xã hội",
    "Coi ngoại lực là nhân tố quyết định mọi thắng lợi, thành công",
    "Kiên định mục tiêu độc lập dân tộc gắn liền với chủ nghĩa xã hội",
    "Kết hợp chặt chẽ hai nhiệm vụ chiến lược: kháng chiến và kiến quốc",
    "C"
  ],
  [
    3,
    "Việt Nam có đường biên giới chung trên đất liền với những quốc gia nào?",
    "Lào, Thái Lan, Philippin",
    "Mianma, Malaixia, Inđônêxia",
    "Lào, Campuchia, Thái Lan",
    "Trung Quốc, Lào, Campuchia",
    "D"
  ],
  [
    4,
    "Luật Biển Việt Nam năm 2012 bao gồm",
    "36 điều và 8 phụ lục",
    "320 điều và 9 phụ lục",
    "9 chương với 62 điều",
    "7 chương với 55 điều",
    "D"
  ],
  [
    5,
    "Công dân thuộc trường hợp nào sau đây được công nhận hoàn thành nghĩa vụ quân sự tại ngũ trong thời bình?",
    "Phục vụ trên tàu kiểm ngư từ đủ 36 tháng trở lên",
    "Tham gia Công an xã liên tục từ đủ 24 tháng trở lên",
    "Phục vụ trên tàu kiểm ngư từ đủ 12 tháng trở lên",
    "Dân quân thường trực có ít nhất 24 tháng phục vụ",
    "D"
  ],
  [
    6,
    "Ban Chỉ huy quân sự cấp xã chuyển Lệnh gọi đăng kí nghĩa vụ quân sự đến công dân cư trú tại địa phương trước thời hạn đăng kí nghĩa vụ quân sự bao nhiêu ngày?",
    "8 ngày",
    "9 ngày",
    "10 ngày",
    "11 ngày",
    "C"
  ],
  [
    7,
    "Đối tượng được tuyển chọn thực hiện nghĩa vụ tham gia công an nhân dân là công dân nam",
    "Từ 18 đến hết 27 tuổi, thuộc trường hợp miễn gọi nhập ngũ",
    "Từ 18 đến hết 45 tuổi, thuộc trường hợp tạm hoãn gọi nhập ngũ",
    "Ngoài độ tuổi gọi nhập ngũ đã hoàn thành nghĩa vụ quân sự",
    "Trong độ tuổi gọi nhập ngũ đã đăng kí nghĩa vụ quân sự",
    "D"
  ],
  [
    8,
    "Công dân trực tiếp đăng kí nghĩa vụ quân sự tại",
    "Ban Chỉ huy quân sự cấp xã",
    "Ban Chỉ huy quân sự cấp tỉnh",
    "Ban Chỉ huy quân sự quận",
    "Ban Chỉ huy quân sự cấp huyện",
    "A"
  ],
  [
    9,
    "Câu ca dao “Thầy đề cho số tào lao/ Thầy bói nói dựa, chỗ nào cũng ma” phản ánh về loại tệ nạn xã hội nào dưới đây?",
    "Tệ nạn mê tín dị đoan",
    "Tệ nạn ma túy",
    "Tệ nạn mại dâm",
    "Tệ nạn cờ bạc",
    "A"
  ],
  [
    10,
    "Hành vi đánh bạc trái phép chưa đến mức truy cứu trách nhiệm hình sự sẽ bị xử phạt theo hình thức nào sau đây?",
    "Phạt tù chung thân",
    "Phạt tù có thời thời hạn",
    "Phạt vi phạm hành chính",
    "Phạt cải tạo không giam giữ",
    "C"
  ]
];

/**
 * Thêm menu tiện ích vào Google Sheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🎓 Quản Lý Bài Thi")
    .addItem("1. Khởi tạo Sheet 'DeThi' (Đề Lớp 10)", "initDeThiSheet")
    .addItem("2. Khởi tạo Sheet 'Dethi11' (Đề Lớp 11)", "initDeThi11Sheet")
    .addItem("3. Chuẩn bị Sheet 'Dethi12' (giữ dữ liệu đã có)", "initDeThi12Sheet")
    .addItem("4. Khởi tạo các Sheet (Lớp 10, 11 & 12)", "initAllSheets")
    .addItem("5. Làm mới Sheet 'KetQuaThi'", "initKetQuaSheet")
    .addToUi();
}

/**
 * Khởi tạo đề 10/11 và chuẩn bị sheet đề 12, không thay nội dung đề 12 đã có.
 */
function initAllSheets() {
  initDeThiSheet();
  initDeThi11Sheet();
  initDeThi12Sheet();
  initKetQuaSheet();
}

/**
 * Khởi tạo sheet DeThi (Lớp 10)
 */
function initDeThiSheet() {
  return createExamSheet(SHEET_DE_THI_10, DEFAULT_QUESTIONS_10, "#1E40AF");
}

/**
 * Khởi tạo sheet Dethi11 (Lớp 11)
 */
function initDeThi11Sheet() {
  return createExamSheet(SHEET_DE_THI_11, DEFAULT_QUESTIONS_11, "#047857");
}

/** Chỉ tạo tiêu đề nếu sheet đề 12 chưa có dữ liệu. */
function initDeThi12Sheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DE_THI_12);
  if (sheet && sheet.getLastRow() > 0) return sheet;
  return createExamSheet(SHEET_DE_THI_12, [], "#7C3AED");
}

/**
 * Hàm chung tạo và định dạng sheet đề thi
 */
function createExamSheet(sheetName, defaultData, headerColor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  const headers = [
    "STT",
    "Nội dung câu hỏi",
    "Đáp án A",
    "Đáp án B",
    "Đáp án C",
    "Đáp án D",
    "Đáp án đúng"
  ];

  sheet.clear();
  sheet.appendRow(headers);

  // Định dạng hàng tiêu đề
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground(headerColor)
             .setFontColor("#FFFFFF")
             .setFontWeight("bold")
             .setHorizontalAlignment("center")
             .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);

  // Thêm danh sách câu hỏi
  defaultData.forEach(row => {
    sheet.appendRow(row);
  });

  // Căn lề & độ rộng cột
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 7, lastRow - 1, 1).setHorizontalAlignment("center").setFontWeight("bold").setFontColor("#15803D");
  }

  sheet.setColumnWidth(1, 60);   // STT
  sheet.setColumnWidth(2, 420);  // Câu hỏi
  sheet.setColumnWidth(3, 200);  // A
  sheet.setColumnWidth(4, 200);  // B
  sheet.setColumnWidth(5, 200);  // C
  sheet.setColumnWidth(6, 200);  // D
  sheet.setColumnWidth(7, 120);  // Đáp án đúng

  sheet.getRange(1, 1, lastRow, headers.length).setWrap(true);
  sheet.setFrozenRows(1);

  return sheet;
}

/**
 * Đọc toàn bộ câu hỏi và đáp án từ sheet chỉ định (mặc định: DeThi)
 */
function loadQuestionsFromSheet(sheetName) {
  const targetSheetName = [SHEET_DE_THI_11, SHEET_DE_THI_12].indexOf(sheetName) >= 0 ? sheetName : SHEET_DE_THI_10;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(targetSheetName);

  if (!sheet || sheet.getLastRow() < 2) {
    // Đề 12 là tùy chọn: không tạo đề mẫu hoặc lấy nhầm đề 10 khi chưa có dữ liệu.
    if (targetSheetName === SHEET_DE_THI_12) return [];
    sheet = targetSheetName === SHEET_DE_THI_11 ? initDeThi11Sheet() : initDeThiSheet();
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  const questions = [];

  values.forEach((row, index) => {
    const stt = row[0] || (index + 1);
    const questionText = String(row[1] || "").trim();
    if (!questionText) return;

    const optA = String(row[2] || "").trim();
    const optB = String(row[3] || "").trim();
    const optC = String(row[4] || "").trim();
    const optD = String(row[5] || "").trim();
    const rawCorrect = String(row[6] || "").trim().toUpperCase();

    let correctIdx = 0;
    if (rawCorrect === "B" || rawCorrect === "2") correctIdx = 1;
    else if (rawCorrect === "C" || rawCorrect === "3") correctIdx = 2;
    else if (rawCorrect === "D" || rawCorrect === "4") correctIdx = 3;
    else if (rawCorrect === "A" || rawCorrect === "1") correctIdx = 0;
    else {
      const opts = [optA, optB, optC, optD];
      const foundIdx = opts.findIndex(o => o.toLowerCase() === rawCorrect.toLowerCase());
      if (foundIdx >= 0) correctIdx = foundIdx;
    }

    questions.push({
      id: stt,
      question: questionText,
      options: [optA, optB, optC, optD].filter(o => o !== ""),
      correctIndex: correctIdx,
      rawCorrect: rawCorrect || "A"
    });
  });

  return questions;
}

/**
 * Phục vụ giao diện HTML khi truy cập web app
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Bài Kiểm Tra Trắc Nghiệm Trực Tuyến")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Trả về danh sách câu hỏi theo khối lớp 10/11/12 - ẨN ĐÁP ÁN ĐÚNG.
 * Giữ endpoint cũ để các bản giao diện trước vẫn gọi được.
 */
function getQuizQuestions(grade) {
  return getQuizData(grade).questions;
}

function normalizeGrade_(grade) {
  const value = String(grade || "10");
  return ["10", "11", "12"].indexOf(value) >= 0 ? value : "10";
}

function getExamSheetName_(grade) {
  const names = { "10": SHEET_DE_THI_10, "11": SHEET_DE_THI_11, "12": SHEET_DE_THI_12 };
  return names[normalizeGrade_(grade)];
}

/** Đọc lại B1 mỗi lần tải đề; chỉ nhận số nguyên dương tính bằng giây. */
function getQuizSettings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CAI_DAT);
  const raw = sheet ? sheet.getRange("B1").getValue() : "";
  const seconds = typeof raw === "number" || typeof raw === "string" ? Number(raw) : NaN;
  return {
    timeLimitSeconds: Number.isSafeInteger(seconds) && seconds > 0 ? seconds : DEFAULT_TIME_LIMIT_SECONDS
  };
}

/** Trả cấu hình và câu hỏi cùng một lần để thời gian hiển thị khớp với đề tải về. */
function getQuizData(grade) {
  const normalizedGrade = normalizeGrade_(grade);
  const sheetName = getExamSheetName_(normalizedGrade);
  const settings = getQuizSettings();
  const fullQuestions = loadQuestionsFromSheet(sheetName);
  const questions = fullQuestions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    timeLimit: settings.timeLimitSeconds
  }));
  return { grade: normalizedGrade, timeLimitSeconds: settings.timeLimitSeconds, questions: questions };
}

/**
 * Nhận bài thi, đối chiếu đáp án với sheet tương ứng (DeThi hoặc Dethi11) và ghi vào KetQuaThi
 */
function submitQuizResults(payload) {
  try {
    const studentInfo = payload.studentInfo || {};
    const answers = payload.answers || {};
    const grade = normalizeGrade_(studentInfo.grade);
    const sheetName = getExamSheetName_(grade);

    // Đọc đáp án chuẩn từ sheet tương ứng
    const questionsFromSheet = loadQuestionsFromSheet(sheetName);
    const totalQuestions = questionsFromSheet.length;
    if (totalQuestions === 0) throw new Error("Đề thi Khối " + grade + " chưa có câu hỏi. Không thể chấm và lưu điểm.");
    let correctCount = 0;
    const detailedResults = [];

    questionsFromSheet.forEach(q => {
      const ansObj = answers[q.id];
      let userChoiceIndex = -1;
      let userAnswerText = "Hết giờ / Bỏ qua";

      if (ansObj !== undefined && ansObj !== null && ansObj !== -1) {
        if (typeof ansObj === "object") {
          userChoiceIndex = ansObj.originalIndex !== undefined ? ansObj.originalIndex : -1;
          userAnswerText = ansObj.text || (userChoiceIndex >= 0 ? q.options[userChoiceIndex] : "Đã chọn");
        } else if (typeof ansObj === "number") {
          userChoiceIndex = ansObj;
          userAnswerText = (userChoiceIndex >= 0 && q.options[userChoiceIndex]) ? q.options[userChoiceIndex] : "Đã chọn";
        } else if (typeof ansObj === "string") {
          userAnswerText = ansObj;
          userChoiceIndex = q.options.findIndex(opt => opt.trim().toLowerCase() === ansObj.trim().toLowerCase());
        }
      }

      // So khớp đáp án
      const isCorrect = (userChoiceIndex >= 0 && userChoiceIndex === q.correctIndex) ||
                        (userAnswerText && q.options[q.correctIndex] && 
                         userAnswerText.trim().toLowerCase() === q.options[q.correctIndex].trim().toLowerCase());
      
      if (isCorrect) correctCount++;

      detailedResults.push({
        id: q.id,
        question: q.question,
        userChoice: userChoiceIndex,
        userAnswerText: userAnswerText,
        correctIndex: q.correctIndex,
        correctAnswerText: q.options[q.correctIndex] || `Đáp án ${q.rawCorrect}`,
        isCorrect: isCorrect
      });
    });

    const score = totalQuestions > 0 ? ((correctCount / totalQuestions) * 10).toFixed(1) : 0;
    const timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");

    // Ghi vào Sheet "KetQuaThi"
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheetResult = ss.getSheetByName(SHEET_KET_QUA);

    if (!sheetResult) {
      sheetResult = initKetQuaSheet();
    }
    const deviceWarningColumn = ensureDeviceWarningColumn_(sheetResult);
    const deviceWarning = formatDeviceWarning_(payload.deviceAudit);

    const summaryText = detailedResults.map(r => {
      const optLetter = r.userChoice >= 0 ? String.fromCharCode(65 + r.userChoice) : "HếtGiờ";
      return `C${r.id}: ${optLetter} (${r.isCorrect ? "Đúng" : "Sai"})`;
    }).join(" | ");

    const rowData = [
      timestamp,
      studentInfo.fullName || "Ẩn danh",
      studentInfo.studentCode || "",
      `Lớp ${grade}`,
      studentInfo.phone || "",
      Number(score),
      correctCount,
      totalQuestions,
      `${Math.round((correctCount / totalQuestions) * 100)}%`,
      summaryText
    ];
    while (rowData.length < deviceWarningColumn) rowData.push("");
    rowData[deviceWarningColumn - 1] = deviceWarning;

    sheetResult.appendRow(rowData);
    sheetResult.autoResizeColumns(1, 9);

    return {
      success: true,
      score: score,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      grade: grade,
      deviceWarning: deviceWarning,
      detailedResults: detailedResults
    };
  } catch (error) {
    Logger.log("Lỗi submit bài thi: " + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Chỉ ghi dấu hiệu nhận được, không kết luận thí sinh gian lận hoặc đã mở F12.
 * Dùng nhãn cố định, không ghi chuỗi tùy ý do trình duyệt gửi vào ô tính.
 */
function formatDeviceWarning_(audit) {
  const flagNames = ["desktopUaSeen", "mobileDesktopMismatch", "f12Pressed", "devtoolsShortcutPressed"];
  if (!audit || audit.version !== 1 || typeof audit.phoneReported !== "boolean" || !audit.flags ||
      flagNames.some(name => typeof audit.flags[name] !== "boolean")) {
    return "Không có đủ thông tin kiểm tra thiết bị (bản cũ hoặc dữ liệu không hợp lệ)";
  }
  const notes = [];
  if (audit.flags.desktopUaSeen) notes.push("Đã truy cập với nhận diện máy tính trong phiên này");
  if (audit.flags.mobileDesktopMismatch) notes.push("Nghi vấn máy tính giả lập điện thoại: nhận diện điện thoại nhưng nền tảng máy tính");
  if (audit.flags.f12Pressed) notes.push("Trang nhận được phím F12; chưa xác nhận DevTools đã mở");
  if (audit.flags.devtoolsShortcutPressed) notes.push("Trang nhận được phím tắt công cụ phát triển");
  if (!audit.phoneReported) notes.push("Không khai báo thiết bị điện thoại khi nộp bài");
  return notes.length ? "CẦN KIỂM TRA: " + notes.join(" | ") : "Không ghi nhận dấu hiệu nghi vấn (không xác minh thiết bị thật)";
}

/** Thêm cột cảnh báo mà không xóa bài thi cũ hoặc ghi đè cột người dùng tự thêm. */
function ensureDeviceWarningColumn_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 10);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const existingIndex = headers.indexOf(DEVICE_WARNING_HEADER);
  if (existingIndex >= 0) return existingIndex + 1;

  const column = lastColumn + 1;
  const maxColumns = sheet.getMaxColumns();
  if (column > maxColumns) sheet.insertColumnsAfter(maxColumns, column - maxColumns);
  sheet.getRange(1, column).setValue(DEVICE_WARNING_HEADER)
    .setBackground("#f59e0b").setFontColor("#111827").setFontWeight("bold")
    .setNote("Thông tin do trình duyệt gửi; chỉ là dấu hiệu để kiểm tra, không chứng minh mở DevTools hoặc gian lận.");
  sheet.setColumnWidth(column, 420);
  return column;
}

/**
 * Tạo và định dạng bảng kết quả thi
 */
function initKetQuaSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_KET_QUA);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_KET_QUA);
  }

  const headers = [
    "Thời Gian Nộp",
    "Họ và Tên",
    "Mã SV / Lớp",
    "Khối Thi",
    "Số Điện Thoại",
    "Điểm Số (Thang 10)",
    "Số Câu Đúng",
    "Tổng Số Câu",
    "Tỉ Lệ Đúng (%)",
    "Chi Tiết Câu Trả Lời"
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
       .setBackground("#2563EB")
       .setFontColor("#FFFFFF")
       .setFontWeight("bold")
       .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 35);
  ensureDeviceWarningColumn_(sheet);
  return sheet;
}
