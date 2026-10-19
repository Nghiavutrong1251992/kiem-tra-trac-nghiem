# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG TRẮC NGHIỆM LÊN CLOUDFLARE PAGES & D1
*(Đảm bảo chịu tải 700 - 5.000 học sinh nộp bài cùng 1 lúc không giật lag)*

---

## 1. Thông tin đã được cấu hình sẵn trong dự án

* **GitHub Repository**: `https://github.com/NghiaVu12051992/kiem-tra-trac-nghiem`
* **Cloudflare D1 Name**: `kiemtratracnghiem`
* **Cloudflare D1 ID**: `d442ac0f-fdb0-4eab-af11-15342cf8226f`
* **Mật khẩu trang quản trị giáo viên mặc định**: `giaovien2026`

---

## 2. Bước 1: Khởi tạo bảng dữ liệu trên Cloudflare D1 (Làm 1 lần)

Bạn có thể chọn **1 trong 2 cách** sau:

### Cách 1: Làm trực tiếp trên giao diện Web (Khuyên dùng - Rất nhanh & dễ)
1. Mở link D1 của bạn: [Cloudflare D1 Dashboard](https://dash.cloudflare.com/79796f16746ba5b49a4b8690c253a8b9/workers/d1/databases/d442ac0f-fdb0-4eab-af11-15342cf8226f)
2. Bấm vào tab **Console** (ở phía trên bên phải).
3. Mở file [schema.sql](file:///d:/bai-tap-trac-nghiem/schema.sql) trong máy tính của bạn, copy toàn bộ nội dung và dán vào ô nhập lệnh của Console -> bấm **Execute**.
4. Tiếp tục mở file [seed.sql](file:///d:/bai-tap-trac-nghiem/seed.sql), copy toàn bộ nội dung và dán vào Console -> bấm **Execute**.
*(Xong bước này, database đã có đủ bảng câu hỏi Khối 10, 11, 12 và bảng lưu điểm).*

### Cách 2: Chạy lệnh từ Terminal máy tính
Mở PowerShell tại thư mục dự án và gõ:
```bash
npx wrangler login
npm run db:init:remote
```

---

## 3. Bước 2: Đẩy toàn bộ mã nguồn lên GitHub

Mở Terminal tại thư mục `d:\bai-tap-trac-nghiem` và chạy 3 dòng lệnh sau:

```bash
git add .
git commit -m "He thong trac nghiem Cloudflare Pages va D1 chiu tai 700 hoc sinh"
git branch -M main
git push -u origin main
```
*(Nếu GitHub hỏi đăng nhập, bạn xác thực tài khoản GitHub của mình).*

---

## 4. Bước 3: Tạo trang Web trên Cloudflare Pages

1. Vào [Cloudflare Dashboard](https://dash.cloudflare.com/) -> Chọn mục **Workers & Pages** ở menu bên trái.
2. Bấm nút **Create application** -> Chọn tab **Pages** -> Bấm **Connect to Git**.
3. Chọn tài khoản GitHub của bạn và chọn Repository: `NghiaVu12051992/kiem-tra-trac-nghiem`.
4. Ở phần **Set up builds and deployments**:
   - **Framework preset**: Chọn `None`.
   - **Build output directory**: Điền `public`.
5. Bấm **Save and Deploy**.

---

## 5. Bước 4: Liên kết D1 Database với Cloudflare Pages (Rất quan trọng)

Để trang web đọc được câu hỏi và lưu điểm của 700 học sinh vào D1:
1. Trong màn hình Project Pages vừa tạo trên Cloudflare, vào tab **Settings** -> chọn mục **Functions** ở menu bên trái.
2. Cuộn xuống phần **D1 database bindings** -> bấm **Add binding**.
   - **Variable name**: Nhập chính xác chữ `DB` (viết hoa).
   - **D1 database**: Chọn database `kiemtratracnghiem`.
3. Bấm **Save**.
4. Vào tab **Deployments** -> Ở bản deploy gần nhất, bấm dấu ba chấm `...` -> Chọn **Retry deployment** (để hệ thống kích hoạt kết nối D1).

---

## 6. Đường dẫn sử dụng

Sau khi Cloudflare cấp tên miền miễn phí (dạng `https://kiem-tra-trac-nghiem.pages.dev`):

* 📱 **Link dành cho Học sinh làm bài**:
  * `https://<ten-project>.pages.dev`
  * Khối 10, 11, 12 có thể thi chung link hoặc chia theo link:
    * `https://<ten-project>.pages.dev?grade=10`
    * `https://<ten-project>.pages.dev?grade=11`
    * `https://<ten-project>.pages.dev?grade=12`
* 💻 **Link dành cho Giáo viên quản lý & Xuất Excel**:
  * `https://<ten-project>.pages.dev/admin.html`
  * Mật khẩu đăng nhập mặc định: `giaovien2026`
  * Tính năng trên trang Admin:
    * Xem điểm thi và bài nộp theo thời gian thực (Real-time).
    * Lọc theo Khối, tìm kiếm theo tên hoặc mã học sinh.
    * Xem chi tiết từng câu làm đúng/sai của bất kỳ học sinh nào.
    * Kiểm tra học sinh có bị cảnh báo phím F12 hoặc đổi thiết bị hay không.
    * **Bấm 1 nút "Xuất File Excel (.xlsx)"** để tải về bảng điểm hoàn chỉnh.
    * Đổi thời gian làm bài mỗi câu (mặc định 15s) và đổi mật khẩu quản trị.
