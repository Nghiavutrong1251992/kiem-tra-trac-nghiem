/**
 * API POST /api/submit
 * Nhận bài thi từ học sinh, chấm điểm trực tiếp trên Cloudflare Edge,
 * lưu vào cơ sở dữ liệu D1 (chịu tải 700+ học sinh) và trả kết quả về.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8"
  };

  try {
    const payload = await request.json();
    const studentInfo = payload.studentInfo || {};
    const answers = payload.answers || {};
    const rawGrade = String(studentInfo.grade || "10");
    const grade = ["10", "11", "12"].includes(rawGrade) ? rawGrade : "10";

    // 1. Đọc đáp án chuẩn từ cơ sở dữ liệu D1
    const { results: questionsFromDb } = await env.DB.prepare(
      `SELECT id, question_num, question, option_a, option_b, option_c, option_d, correct_option 
       FROM questions 
       WHERE grade = ? 
       ORDER BY question_num ASC`
    ).bind(grade).all();

    const totalQuestions = (questionsFromDb || []).length;
    if (totalQuestions === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: "Đề thi Khối " + grade + " chưa có câu hỏi trong hệ thống."
      }), { status: 400, headers: corsHeaders });
    }

    let correctCount = 0;
    const detailedResults = [];
    const optionLetters = ["A", "B", "C", "D"];

    questionsFromDb.forEach(q => {
      const options = [q.option_a, q.option_b, q.option_c, q.option_d];
      const correctOptLetter = String(q.correct_option || "A").trim().toUpperCase();
      let correctIndex = optionLetters.indexOf(correctOptLetter);
      if (correctIndex < 0) correctIndex = 0;

      const ansObj = answers[q.id];
      let userChoiceIndex = -1;
      let userAnswerText = "Hết giờ / Bỏ qua";

      if (ansObj !== undefined && ansObj !== null && ansObj !== -1) {
        if (typeof ansObj === "object") {
          userChoiceIndex = ansObj.originalIndex !== undefined ? ansObj.originalIndex : -1;
          userAnswerText = ansObj.text || (userChoiceIndex >= 0 ? options[userChoiceIndex] : "Đã chọn");
        } else if (typeof ansObj === "number") {
          userChoiceIndex = ansObj;
          userAnswerText = (userChoiceIndex >= 0 && options[userChoiceIndex]) ? options[userChoiceIndex] : "Đã chọn";
        } else if (typeof ansObj === "string") {
          userAnswerText = ansObj;
          userChoiceIndex = options.findIndex(opt => opt && opt.trim().toLowerCase() === ansObj.trim().toLowerCase());
        }
      }

      // So khớp đáp án
      const isCorrect = (userChoiceIndex >= 0 && userChoiceIndex === correctIndex) ||
                        (userAnswerText && options[correctIndex] &&
                         userAnswerText.trim().toLowerCase() === options[correctIndex].trim().toLowerCase());

      if (isCorrect) correctCount++;

      detailedResults.push({
        id: q.id,
        question: q.question,
        userChoice: userChoiceIndex,
        userAnswerText: userAnswerText,
        correctIndex: correctIndex,
        correctAnswerText: options[correctIndex] || `Đáp án ${correctOptLetter}`,
        isCorrect: isCorrect
      });
    });

    const scoreNum = totalQuestions > 0 ? ((correctCount / totalQuestions) * 10) : 0;
    const scoreStr = scoreNum.toFixed(1);
    const percentage = `${Math.round((correctCount / totalQuestions) * 100)}%`;

    // Thời gian định dạng giờ Việt Nam (UTC+7)
    const nowUtc = new Date();
    const vnTime = new Date(nowUtc.getTime() + 7 * 60 * 60 * 1000);
    const pad = n => String(n).padStart(2, "0");
    const timestampVn = `${pad(vnTime.getUTCDate())}/${pad(vnTime.getUTCMonth() + 1)}/${vnTime.getUTCFullYear()} ` +
                        `${pad(vnTime.getUTCHours())}:${pad(vnTime.getUTCMinutes())}:${pad(vnTime.getUTCSeconds())}`;

    // Format Cảnh báo thiết bị
    const deviceWarning = formatDeviceWarning(payload.deviceAudit);

    // Tóm tắt câu trả lời (C1: A (Đúng) | C2: B (Sai)...)
    const summaryText = detailedResults.map(r => {
      const optLetter = r.userChoice >= 0 ? String.fromCharCode(65 + r.userChoice) : "HếtGiờ";
      return `C${r.id}: ${optLetter} (${r.isCorrect ? "Đúng" : "Sai"})`;
    }).join(" | ");

    // Thu thập IP và User-Agent để kiểm tra gian lận nếu cần
    const clientIp = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "";
    const userAgent = request.headers.get("user-agent") || "";

    // GHI VÀO CƠ SỞ DỮ LIỆU D1
    await env.DB.prepare(`
      INSERT INTO results (
        timestamp_vn, full_name, email, student_code, grade, phone,
        score, correct_count, total_questions, percentage,
        summary_text, detailed_results, device_warning, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      timestampVn,
      studentInfo.fullName || "Ẩn danh",
      studentInfo.email || "",
      studentInfo.studentCode || "",
      `Lớp ${grade}`,
      studentInfo.phone || "",
      parseFloat(scoreStr),
      correctCount,
      totalQuestions,
      percentage,
      summaryText,
      JSON.stringify(detailedResults),
      deviceWarning,
      clientIp,
      userAgent
    ).run();

    return new Response(JSON.stringify({
      success: true,
      score: scoreStr,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      grade: grade,
      deviceWarning: deviceWarning,
      detailedResults: detailedResults
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error("Lỗi submit:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Lỗi xử lý nộp bài: " + error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

function formatDeviceWarning(audit) {
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
