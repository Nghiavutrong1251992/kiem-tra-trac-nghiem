/**
 * API GET & POST /api/admin/settings
 * Quản lý cấu hình bài thi (thời gian mỗi câu, đổi mật khẩu giáo viên)
 */
export async function onRequestGet(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    const { results } = await env.DB.prepare("SELECT key, value FROM settings").all();
    const map = {};
    (results || []).forEach(r => {
      if (r.key !== "admin_password") {
        map[r.key] = r.value;
      }
    });

    return new Response(JSON.stringify({
      success: true,
      settings: map
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

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    const data = await request.json();

    if (data.timeLimitSeconds) {
      const val = parseInt(data.timeLimitSeconds, 10);
      if (val > 0) {
        await env.DB.prepare(
          "INSERT OR REPLACE INTO settings (key, value) VALUES ('time_limit_seconds', ?)"
        ).bind(String(val)).run();
      }
    }

    if (data.googleClientId !== undefined) {
      await env.DB.prepare(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('google_client_id', ?)"
      ).bind(data.googleClientId.trim()).run();
    }

    if (data.requireGoogleLogin !== undefined) {
      await env.DB.prepare(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('require_google_login', ?)"
      ).bind(data.requireGoogleLogin ? "true" : "false").run();
    }

    if (data.newPassword && data.newPassword.trim().length >= 4) {
      await env.DB.prepare(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password', ?)"
      ).bind(data.newPassword.trim()).run();
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Cập nhật cài đặt thành công!"
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

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
