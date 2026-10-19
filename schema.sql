-- SCHEMA CHO HỆ THỐNG TRẮC NGHIỆM CLOUDFLARE D1 (CHỊU TẢI 700+ HỌC SINH ĐỒNG THỜI)

-- 1. Bảng cấu hình hệ thống
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- 2. Bảng ngân hàng câu hỏi đề thi theo khối (10, 11, 12)
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grade TEXT NOT NULL,          -- '10', '11', '12'
    question_num INTEGER NOT NULL, -- STT trong đề
    question TEXT NOT NULL,        -- Nội dung câu hỏi
    option_a TEXT NOT NULL,        -- Đáp án A
    option_b TEXT NOT NULL,        -- Đáp án B
    option_c TEXT NOT NULL,        -- Đáp án C
    option_d TEXT NOT NULL,        -- Đáp án D
    correct_option TEXT NOT NULL,  -- 'A', 'B', 'C', 'D'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng lưu kết quả thi của học sinh (đáp ứng 700+ học sinh)
CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    timestamp_vn TEXT NOT NULL,      -- Giờ Việt Nam dd/MM/yyyy HH:mm:ss
    full_name TEXT NOT NULL,         -- Họ và tên
    email TEXT,                      -- Email Gmail học sinh xác thực
    student_code TEXT,               -- Mã SV / Lớp
    grade TEXT NOT NULL,             -- Khối thi ('10', '11', '12')
    phone TEXT,                      -- Số điện thoại
    score REAL NOT NULL,             -- Điểm số (thang 10, ví dụ 8.5)
    correct_count INTEGER NOT NULL,  -- Số câu đúng
    total_questions INTEGER NOT NULL,-- Tổng số câu
    percentage TEXT NOT NULL,        -- Tỉ lệ đúng (ví dụ 85%)
    summary_text TEXT,               -- Tóm tắt các câu (C1: A (Đúng) | C2: B (Sai)...)
    detailed_results TEXT,           -- JSON chi tiết từng câu
    device_warning TEXT,             -- Cảnh báo thiết bị / F12
    ip_address TEXT,                 -- IP nộp bài
    user_agent TEXT                  -- Trình duyệt
);

-- 4. Tạo chỉ mục (Index) để truy vấn & xuất danh sách siêu tốc
CREATE INDEX IF NOT EXISTS idx_questions_grade ON questions(grade);
CREATE INDEX IF NOT EXISTS idx_results_grade ON results(grade);
CREATE INDEX IF NOT EXISTS idx_results_email ON results(email);
CREATE INDEX IF NOT EXISTS idx_results_student_code ON results(student_code);
CREATE INDEX IF NOT EXISTS idx_results_submitted_at ON results(submitted_at);
