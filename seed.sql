-- DỮ LIỆU BAN ĐẦU CHO HỆ THỐNG TRẮC NGHIỆM TỪ FILE CSV CHÍNH THỨC

-- Cài đặt mặc định
INSERT OR REPLACE INTO settings (key, value) VALUES ('time_limit_seconds', '15');
INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password', 'giaovien2026');
INSERT OR REPLACE INTO settings (key, value) VALUES ('require_google_login', 'true');

-- Đề thi GDQP-AN Khối 10 (Chuẩn từ file Bài Trắc Nghiệm - DeThi.csv)
DELETE FROM questions WHERE grade = '10';
INSERT INTO questions (grade, question_num, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('10', 1, 'Ngày đầu thành lập Đội Việt Nam Tuyên truyền Giải phóng quân có bao nhiêu người?', '32', '33', '34', '35', 'C'),
('10', 2, 'Cách đánh chủ yếu của Dân quân tự vệ trong thời chống Pháp và chống Mỹ là gì?', 'Hiệp đồng binh chủng', 'Du kích', 'Tác chiến bằng các binh đoàn chủ lực', 'Đánh nhanh, thắng nhanh', 'B'),
('10', 3, 'Anh hùng lực lượng vũ trang nào sau đây thuộc Công an nhân dân?', 'Võ Thị Sáu', 'Nguyễn Viết Xuân', 'Anh hùng Lê Mã Lương', 'Phạm Tuân', 'A'),
('10', 4, 'Luật Giáo dục quốc phòng và an ninh năm 2013 gồm bao nhiêu chương, điều?', '8 chương, 47 điều', '8 chương, 57 điều', '9 chương, 57 điều', '9 chương, 47 điều', 'A'),
('10', 5, 'Một trong những nguồn bổ sung cho sĩ quan tại ngũ của Quân đội là gì?', 'Sĩ quan dự bị', 'Đảng viên Đảng Cộng sản Việt Nam', 'Dân quân tự vệ', 'Đoàn viên Thanh niên Cộng sản Hồ Chí Minh', 'A'),
('10', 6, 'Công dân trong độ tuổi gọi nhập ngũ được tuyển chọn vào phục vụ trong Công an nhân dân với thời hạn bao lâu?', '12 tháng', '24 tháng', '36 tháng', '6 tháng', 'B'),
('10', 7, 'Người nghiện ma túy thường bị ảo giác, hoang tưởng, kích động, rối loạn nhận thức và cảm xúc. Đây là tác hại của ma túy gây tổn hại về gì?', 'Tinh thần', 'Sức khỏe', 'Kinh tế', 'Thể chất', 'A'),
('10', 8, 'Ma túy xâm nhập vào cơ thể con người bằng cách nào?', 'Qua hệ hô hấp, hệ tuần hoàn', 'Qua hệ hô hấp, hệ tuần hoàn, hệ tiêu hóa', 'Qua hệ hô hấp, hệ tuần hoàn, hệ bài tiết', 'Qua hệ hô hấp, hệ tuần hoàn, hệ tiêu hóa và hệ bài tiết', 'B'),
('10', 9, 'Thuốc lắc là dạng ma túy nào?', 'Ma túy công nghiệp', 'Ma túy tự nhiên', 'Ma túy tổng hợp', 'Ma túy bán tổng hợp', 'C'),
('10', 10, 'Quá trình nghiện ma túy thường trải qua các giai đoạn nào?', 'Sử dụng ma túy – nghiện ma túy – sử dụng thường xuyên', 'Sử dụng ma túy – sử dụng lần đầu – sử dụng thường xuyên', 'Sử dụng ma túy – lạm dụng ma túy – lệ thuộc ma túy', 'Sử dụng ma túy – sử dụng thường xuyên – lệ thuộc ma túy', 'C');

-- Đề thi GDQP-AN Khối 11 (Chuẩn từ file Bài Trắc Nghiệm - Dethi11.csv)
DELETE FROM questions WHERE grade = '11';
INSERT INTO questions (grade, question_num, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('11', 1, 'Vùng nước tiếp giáp với bờ biển, ở phía trong đường cơ sở được gọi là', 'Thềm lục địa', 'Nội thủy', 'Vùng tiếp giáp lãnh hải', 'Lãnh hải', 'B'),
('11', 2, 'Một trong những quan điểm chỉ đạo của Đảng về Chiến lược bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa trong tình hình mới là', 'Chỉ chú trọng xây dựng sức mạnh của đất nước về văn hóa - xã hội', 'Coi ngoại lực là nhân tố quyết định mọi thắng lợi, thành công', 'Kiên định mục tiêu độc lập dân tộc gắn liền với chủ nghĩa xã hội', 'Kết hợp chặt chẽ hai nhiệm vụ chiến lược: kháng chiến và kiến quốc', 'C'),
('11', 3, 'Việt Nam có đường biên giới chung trên đất liền với những quốc gia nào?', 'Lào, Thái Lan, Philippin', 'Mianma, Malaixia, Inđônêxia', 'Lào, Campuchia, Thái Lan', 'Trung Quốc, Lào, Campuchia', 'D'),
('11', 4, 'Luật Biển Việt Nam năm 2012 bao gồm', '36 điều và 8 phụ lục', '320 điều và 9 phụ lục', '9 chương với 62 điều', '7 chương với 55 điều', 'D'),
('11', 5, 'Công dân thuộc trường hợp nào sau đây được công nhận hoàn thành nghĩa vụ quân sự tại ngũ trong thời bình?', 'Phục vụ trên tàu kiểm ngư từ đủ 36 tháng trở lên', 'Tham gia Công an xã liên tục từ đủ 24 tháng trở lên', 'Phục vụ trên tàu kiểm ngư từ đủ 12 tháng trở lên', 'Dân quân thường trực có ít nhất 24 tháng phục vụ', 'D'),
('11', 6, 'Ban Chỉ huy quân sự cấp xã chuyển Lệnh gọi đăng kí nghĩa vụ quân sự đến công dân cư trú tại địa phương trước thời hạn đăng kí nghĩa vụ quân sự bao nhiêu ngày?', '8 ngày', '9 ngày', '10 ngày', '11 ngày', 'C'),
('11', 7, 'Đối tượng được tuyển chọn thực hiện nghĩa vụ tham gia công an nhân dân là công dân nam', 'Từ 18 đến hết 27 tuổi, thuộc trường hợp miễn gọi nhập ngũ', 'Từ 18 đến hết 45 tuổi, thuộc trường hợp tạm hoãn gọi nhập ngũ', 'Ngoài độ tuổi gọi nhập ngũ đã hoàn thành nghĩa vụ quân sự', 'Trong độ tuổi gọi nhập ngũ đã đăng kí nghĩa vụ quân sự', 'D'),
('11', 8, 'Công dân trực tiếp đăng kí nghĩa vụ quân sự tại', 'Ban Chỉ huy quân sự cấp xã', 'Ban Chỉ huy quân sự cấp tỉnh', 'Ban Chỉ huy quân sự quận', 'Ban Chỉ huy quân sự cấp huyện', 'A'),
('11', 9, 'Câu ca dao “Thầy đề cho số tào lao/ Thầy bói nói dựa, chỗ nào cũng ma” phản ánh về loại tệ nạn xã hội nào dưới đây?', 'Tệ nạn mê tín dị đoan', 'Tệ nạn ma túy', 'Tệ nạn mại dâm', 'Tệ nạn cờ bạc', 'A'),
('11', 10, 'Hành vi đánh bạc trái phép chưa đến mức truy cứu trách nhiệm hình sự sẽ bị xử phạt theo hình thức nào sau đây?', 'Phạt tù chung thân', 'Phạt tù có thời thời hạn', 'Phạt vi phạm hành chính', 'Phạt cải tạo không giam giữ', 'C');

-- Đề thi mẫu GDQP-AN Khối 12
DELETE FROM questions WHERE grade = '12';
INSERT INTO questions (grade, question_num, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('12', 1, 'Nghệ thuật quân sự Việt Nam từ khi có Đảng lãnh đạo gồm những bộ phận nào hợp thành?', 'Chiến lược quân sự, nghệ thuật chiến dịch và chiến thuật', 'Nghệ thuật toàn dân đánh giặc, chiến tranh nhân dân', 'Khởi nghĩa vũ trang và chiến tranh cách mạng', 'Tác chiến du kích và tác chiến chính quy', 'A'),
('12', 2, 'Một trong những nguyên tắc cơ bản trong xây dựng lực lượng vũ trang nhân dân Việt Nam là:', 'Đặt dưới sự lãnh đạo tuyệt đối, trực tiếp về mọi mặt của Đảng Cộng sản Việt Nam', 'Phụ thuộc vào viện trợ quốc tế', 'Tập trung xây dựng quân đội hiện đại trước', 'Ưu tiên phát triển kinh tế rồi mới củng cố quốc phòng', 'A'),
('12', 3, 'Trận quyết chiến chiến lược nào đã kết thúc thắng lợi cuộc kháng chiến chống thực dân Pháp của nhân dân ta?', 'Chiến dịch Điện Biên Phủ (1954)', 'Chiến dịch Biên giới (1950)', 'Chiến dịch Việt Bắc (1947)', 'Chiến dịch Hà Nam Ninh (1951)', 'A'),
('12', 4, 'Chiến dịch Hồ Chí Minh lịch sử giải phóng hoàn toàn miền Nam diễn ra vào năm nào?', '1975', '1973', '1974', '1976', 'A'),
('12', 5, 'Lực lượng vũ trang nhân dân Việt Nam gồm có mấy thành phần chính?', '3 thành phần (Bộ đội chủ lực, Bộ đội địa phương, Dân quân tự vệ)', '2 thành phần', '4 thành phần', '5 thành phần', 'A');
