/**
 * API POST /api/admin/auth
 * Xác thực mật khẩu quản trị viên (mặc định: giaovien2026)
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8"
  };

  try {
    const { password } = await request.json();
    if (!password) {
      return new Response(JSON.stringify({ success: false, message: "Vui lòng nhập mật khẩu" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Đọc mật khẩu từ D1 settings
    let adminPass = "giaovien2026";
    try {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_password'").first();
      if (row && row.value) adminPass = row.value;
    } catch (e) {}

    if (password.trim() === adminPass.trim()) {
      // Trả về token đơn giản (chính là token hash hoặc password mã hóa)
      return new Response(JSON.stringify({
        success: true,
        token: btoa("admin:" + adminPass)
      }), {
        status: 200,
        headers: corsHeaders
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: "Mật khẩu không chính xác!"
      }), {
        status: 401,
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
