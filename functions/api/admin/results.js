/**
 * API GET & DELETE /api/admin/results
 * Quản lý danh sách kết quả bài thi của học sinh
 */
export async function onRequestGet(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8"
  };

  if (!(await checkAdminAuth(request, env))) {
    return new Response(JSON.stringify({ success: false, message: "Không có quyền truy cập!" }), {
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    const url = new URL(request.url);
    const grade = url.searchParams.get("grade") || "";
    const search = (url.searchParams.get("search") || "").trim();

    let query = `
      SELECT id, submitted_at, timestamp_vn, full_name, email, student_code, grade, phone,
             score, correct_count, total_questions, percentage, summary_text,
             detailed_results, device_warning, ip_address
      FROM results
      WHERE 1=1
    `;
    const params = [];

    if (grade && grade !== "all") {
      query += " AND (grade = ? OR grade = ?)";
      params.push(grade, `Lớp ${grade}`);
    }

    if (search) {
      query += " AND (full_name LIKE ? OR student_code LIKE ? OR phone LIKE ? OR email LIKE ?)";
      const wild = `%${search}%`;
      params.push(wild, wild, wild, wild);
    }

    query += " ORDER BY id DESC LIMIT 2000";

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    // Thống kê nhanh
    const totalCount = (results || []).length;
    let avgScore = 0;
    let passedCount = 0;
    let warningCount = 0;

    if (totalCount > 0) {
      const sumScore = results.reduce((acc, r) => acc + (parseFloat(r.score) || 0), 0);
      avgScore = (sumScore / totalCount).toFixed(1);
      passedCount = results.filter(r => (parseFloat(r.score) || 0) >= 5.0).length;
      warningCount = results.filter(r => r.device_warning && r.device_warning.startsWith("CẦN KIỂM TRA")).length;
    }

    return new Response(JSON.stringify({
      success: true,
      stats: {
        totalSubmissions: totalCount,
        avgScore: avgScore,
        passedRate: totalCount > 0 ? `${Math.round((passedCount / totalCount) * 100)}%` : "0%",
        warningCount: warningCount
      },
      results: results || []
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8"
  };

  if (!(await checkAdminAuth(request, env))) {
    return new Response(JSON.stringify({ success: false, message: "Không có quyền!" }), {
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const clearAll = url.searchParams.get("clearAll");

    if (clearAll === "true") {
      await env.DB.prepare("DELETE FROM results").run();
      return new Response(JSON.stringify({ success: true, message: "Đã xóa toàn bộ kết quả thi!" }), {
        status: 200,
        headers: corsHeaders
      });
    } else if (id) {
      await env.DB.prepare("DELETE FROM results WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true, message: "Đã xóa kết quả #" + id }), {
        status: 200,
        headers: corsHeaders
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: "Thiếu tham số id hoặc clearAll" }), {
        status: 400,
        headers: corsHeaders
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
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
      "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

async function checkAdminAuth(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  let adminPass = "giaovien2026";
  try {
    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_password'").first();
    if (row && row.value) adminPass = row.value;
  } catch (e) {}

  const expectedToken = "Bearer " + btoa("admin:" + adminPass);
  return authHeader === expectedToken;
}
