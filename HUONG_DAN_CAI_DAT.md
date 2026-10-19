# HƯỚNG DẪN CÀI ĐẶT BÀI THI TRẮC NGHIỆM KHỐI 10, 11 VÀ 12

Hệ thống hỗ trợ thi trắc nghiệm riêng biệt cho **Khối 10, 11 và 12**:
- Sheet `DeThi`: Quản lý 10 câu hỏi đề thi Lớp 10.
- Sheet `Dethi11`: Quản lý 10 câu hỏi đề thi Lớp 11.
- Sheet `Dethi12`: Đề Lớp 12 do giáo viên nhập, có thể để trống khi chưa có đề.
- Sheet `cai-dat`: Ô **B1** là số giây cho mỗi câu, áp dụng cả khởi động và thi chính thức.
- Sheet `KetQuaThi`: Tự động ghi nhận điểm thi, có cột phân loại "Khối Thi" (Lớp 10, 11 hoặc 12).
- 🔀 **Random đề thi cho từng thí sinh**: Xáo trộn ngẫu nhiên thứ tự câu hỏi và thứ tự đáp án (A, B, C, D).
- 📱 **Chỉ làm bài trên điện thoại**: PC/laptop và máy tính bảng bị chặn. Không có nút bỏ qua cho giáo viên; thu nhỏ cửa sổ máy tính không mở được bài thi.
- **Cảnh báo thiết bị/F12:** Thêm cột `Cảnh Báo Thiết Bị / F12` vào Sheet `KetQuaThi`, ghi cùng dòng họ tên và điểm khi nộp bài. Ghi nhận nhận diện máy tính trước đó trong cùng tab, dấu hiệu giả lập điện thoại và thao tác F12/phím tắt mà trang nhận được.
- 🎯 **3 câu khởi động không tính điểm**: Làm quen thời gian được cấu hình trong B1 và thao tác ấn khóa luôn, có nút vòng lại làm lại nếu chưa hiểu.

---

## CẤU TRÚC CÁC SHEET ĐỀ THI

Các Sheet `DeThi` (Lớp 10), `Dethi11` (Lớp 11) và `Dethi12` (Lớp 12) đều có cùng định dạng chuẩn:

| Cột A (STT) | Cột B (Nội dung câu hỏi) | Cột C (Đáp án A) | Cột D (Đáp án B) | Cột E (Đáp án C) | Cột F (Đáp án D) | Cột G (Đáp án đúng) |
|:---:|---|---|---|---|---|:---:|
| 1 | Vùng nước tiếp giáp với bờ biển... | Thềm lục địa | Nội thủy | Vùng tiếp giáp lãnh hải | Lãnh hải | **B** |
| 2 | Một trong những quan điểm chỉ đạo... | ... | ... | ... | ... | **C** |

> **Lưu ý:** Cột G chỉ cần điền chữ cái `A`, `B`, `C` hoặc `D`.

### Chỉnh thời gian làm bài

Trong sheet `cai-dat`, điền **số nguyên dương** vào ô **B1**, ví dụ `30` nghĩa là mỗi câu có 30 giây. Có thể ghi `Số giây mỗi câu` vào A1 để dễ nhớ; chương trình chỉ đọc B1. Nếu B1 trống, không phải số nguyên dương hoặc sheet chưa tồn tại, chương trình dùng mặc định **15 giây**.

Sau khi sửa B1, học sinh tải lại trang hoặc tải lại đề để nhận cấu hình mới; không cần triển khai lại mã. Thời gian của lượt đang làm được giữ theo cấu hình đã tải, không đổi giữa chừng.

Sheet `Dethi12` đã có dữ liệu sẽ được giữ nguyên. Nếu sheet không có hoặc chưa có câu hỏi từ hàng 2, giao diện báo chưa có đề Khối 12, không cho bắt đầu và không lấy đề Khối 10 thay thế. Có thể dùng nút **Tải lại đề thi** sau khi bổ sung câu hỏi.

---

## CÁC BƯỚC CÀI ĐẶT

### Bước 1: Dán mã nguồn vào Google Apps Script
1. Mở bảng tính Google Sheet của bạn.
2. Bấm menu: **Tiện ích mở rộng** (*Extensions*) ➔ **Apps Script**.
3. Mở file [Code.gs](file:///d:/bai-tap-trac-nghiem/Code.gs), sao chép toàn bộ và dán vào file `Mã.gs` trên Apps Script.
4. Bấm dấu **`+`** (bên cạnh Tệp) ➔ Chọn **HTML** ➔ Đặt tên là `Index` ➔ Mở [Index.html](file:///d:/bai-tap-trac-nghiem/Index.html), sao chép toàn bộ dán vào.
5. Nhấn **Ctrl + S** để lưu.

### Bước 2: Chuẩn bị các Sheet đề thi (chỉ dành cho lần cài mới)
- Trong giao diện Apps Script, tại thanh công cụ chọn hàm `initAllSheets` rồi bấm nút **Chạy** (*Run*).
- Cấp quyền lần đầu nếu Google yêu cầu.
- Quay lại Google Sheet bạn sẽ thấy đã tự động xuất hiện:
  - Sheet **DeThi** (10 câu Lớp 10 màu xanh dương).
  - Sheet **Dethi11** (10 câu Lớp 11 màu xanh lá).
  - Sheet **Dethi12** (tiêu đề đề Lớp 12 màu tím; giữ nguyên dữ liệu nếu đã có).
  - Sheet **KetQuaThi** (Lưu điểm của cả 3 khối).
- Tạo sheet **cai-dat** nếu chưa có, nhập số giây mỗi câu vào **B1**. Không chạy lại `initAllSheets` chỉ để cập nhật tính năng: hàm này tạo lại nội dung đề 10/11.

### Bước 3: Triển khai Web App
1. Nhấn nút **Triển khai** (*Deploy*) ➔ **Tùy chọn triển khai mới** (*New deployment*).
2. Chọn biểu tượng ⚙️ ➔ Chọn **Ứng dụng web** (*Web app*).
3. Thiết lập:
   - **Thực thi dưới dạng** (*Execute as*): **Tôi** (*Me*).
   - **Ai có quyền truy cập** (*Who has access*): **Bất kỳ ai** (*Anyone*).
4. Nhấn **Triển khai** ➔ Copy link **Ứng dụng web URL** gửi cho học sinh.

### Mẹo chia sẻ link trực tiếp theo khối lớp:
- **Link thi Lớp 10 mặc định:** `https://script.google.com/macros/s/.../exec`
- **Link mở sẵn đề Lớp 11:** Thêm `?lop=11` vào đuôi link:
  `https://script.google.com/macros/s/.../exec?lop=11` (Khi học sinh mở link này, hệ thống tự động chọn sẵn đề Lớp 11).
- **Đề Lớp 12:** Chọn nút **Đề Lớp 12** trên giao diện.

### Cập nhật bản sửa lỗi không bấm được nút

1. Thay toàn bộ nội dung **cả `Index.html` và `Code.gs`** bằng hai file mới, rồi lưu. `Index` phải là file HTML, không dán kèm dấu ba backtick của khối mã Markdown.
2. Chọn **Triển khai → Quản lý các tùy chọn triển khai → Chỉnh sửa → Phiên bản mới → Triển khai**.
3. Mở lại đường link `/exec`. Cuối trang phải hiện **Bản 2026.10.18.6 · Chỉ điện thoại**; nếu chưa có thì đường link chưa phục vụ bản này.
4. Trên điện thoại iPhone/Android, chọn thử Khối 10/11/12, kiểm tra số giây khớp `cai-dat!B1`, bấm **Bắt Đầu**, làm 3 câu khởi động rồi bấm bắt đầu bài thi chính thức. Trên PC/laptop phải hiện màn hình yêu cầu dùng điện thoại. Nếu điện thoại đang bật “Trang web cho máy tính”, hãy tắt chế độ đó.
5. Nếu mã JavaScript vẫn lỗi, đầu trang sẽ hiện thông báo lỗi cụ thể. Có thể mở **Triển khai → Kiểm tra các tùy chọn triển khai → Ứng dụng web** để kiểm tra mã đã lưu bằng link `/dev` (chỉ người có quyền chỉnh sửa dự án truy cập được).

Giới hạn thiết bị dựa vào nhận diện trình duyệt. Máy tính giả lập hoặc giả mạo nhận diện điện thoại vẫn có thể vượt qua; đây không phải cơ chế xác minh thiết bị tuyệt đối.

Cột cảnh báo tự được thêm khi nộp bài hoặc khi chạy `initKetQuaSheet`, giữ nguyên các dòng kết quả cũ. Các cột do bạn tự thêm được giữ nguyên. Không cần chạy lại `initAllSheets` để cập nhật (hàm đó tạo lại đề thi).

Lịch sử nhận diện được giữ trong cùng tab khi tải lại trang nếu trình duyệt cho phép sessionStorage. Lượt PC bị chặn chưa nộp bài không tạo dòng điểm; nếu sau đó đổi sang giả lập điện thoại và nộp bài trong cùng phiên, dấu hiệu trước đó được ghi vào dòng kết quả. Khi không có dấu hiệu, cột ghi “Không ghi nhận dấu hiệu nghi vấn”, không khẳng định thiết bị là điện thoại thật.

F12/phím tắt chỉ được ghi khi sự kiện đến được trang. Mở DevTools bằng menu, mở trước khi tải trang, chặn JavaScript hoặc giả mạo toàn bộ thông tin thiết bị có thể không bị phát hiện. Cảnh báo là thông tin để giáo viên kiểm tra, không tự trừ điểm và không kết luận học sinh cố tình gian lận.
