/**
 * API GET /api/quiz?grade=10
 * Trả về danh sách câu hỏi cho học sinh (KHÔNG chứa đáp án đúng)
 * và thời gian làm bài mỗi câu được cấu hình từ D1.
 */
export async function onRequestGet(context) {
  const { request, env } = context;

  // Header CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8"
  };

  try {
    const url = new URL(request.url);
    const rawGrade = url.searchParams.get("grade") || "10";
    const grade = ["10", "11", "12"].includes(rawGrade) ? rawGrade : "10";

    // 1. Đọc cài đặt từ bảng settings
    let timeLimitSeconds = 15;
    let googleClientId = "";
    let requireGoogleLogin = true;
    try {
      const { results: settingsRows } = await env.DB.prepare("SELECT key, value FROM settings").all();
      (settingsRows || []).forEach(row => {
        if (row.key === "time_limit_seconds") {
          const parsed = parseInt(row.value, 10);
          if (!isNaN(parsed) && parsed > 0) timeLimitSeconds = parsed;
        } else if (row.key === "google_client_id") {
          googleClientId = row.value || "";
        } else if (row.key === "require_google_login") {
          requireGoogleLogin = row.value !== "false";
        }
      });
    } catch (e) {
      console.warn("Lỗi đọc settings:", e);
    }

    // 2. Đọc câu hỏi theo khối (KHÔNG trả về correct_option để chống gian lận)
    const { results } = await env.DB.prepare(
      `SELECT id, question_num, question, option_a, option_b, option_c, option_d 
       FROM questions 
       WHERE grade = ? 
       ORDER BY question_num ASC`
    ).bind(grade).all();

    const questions = (results || []).map(row => ({
      id: row.id,
      question: row.question,
      options: [row.option_a, row.option_b, row.option_c, row.option_d],
      timeLimit: timeLimitSeconds
    }));

    return new Response(JSON.stringify({
      success: true,
      grade: grade,
      timeLimitSeconds: timeLimitSeconds,
      googleClientId: googleClientId,
      requireGoogleLogin: requireGoogleLogin,
      questions: questions
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: "Lỗi máy chủ khi tải đề thi: " + error.message
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
