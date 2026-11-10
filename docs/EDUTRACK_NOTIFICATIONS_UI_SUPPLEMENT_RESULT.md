# EduTrack — Kết quả 3 yêu cầu UI bổ sung cho Notifications

Ngày: 10/11/2026 (Asia/Bangkok). Branch: `Duy`.

Đây là phần bổ sung cho [báo cáo Notifications tổng thể](EDUTRACK_NOTIFICATIONS_UX_PROPAGATION_RESULT.md). Các yêu cầu và thay đổi NTF-01 trước đó được giữ lại.

## 1. CM/AD Dashboard — Empty State

Đã dùng chung `NotificationEmptyState` cho Dashboard của bốn vai trò:

- SVG dấu tích xanh, không phụ thuộc tải icon font ngoài.
- Tiêu đề: **Bạn đã đọc hết thông báo**.
- Mô tả: **Không có thông báo mới nào chưa đọc vào lúc này.**
- Căn giữa, spacing gọn; card không còn ép min-height 440px ở Teaching khi rỗng.
- Empty State chỉ xuất hiện khi đã có snapshot hợp lệ và `quick.length === 0`; loading/error vẫn có trạng thái riêng.

Không thay đổi `quickNotifications`, timer/store hay nghiệp vụ backend để tạo empty state. Quy tắc tối đa 5 item, unread không hết hạn và read tồn tại 5 phút từ ReadAt vẫn được dùng chung.

**Kết quả:** PASS trên CM/AD tại 1440, 768, 390px. Test gửi một thông báo mới bằng HTTP thật vào MySQL cô lập, mở Dashboard, Read All, xác nhận unread = 0 nhưng vẫn có 5 item hợp lệ; trước 5 phút vẫn có item, sau hạn mới hiện empty state. Inbox và toàn bộ ReadAt không đổi khi timer hết hạn. Test kiểm tra đúng chữ, icon xanh, card cao 150–380px và containment theo viewport.

## 2. Teacher/TA Dashboard — Click toàn item

`NotificationsSection` của Teacher/TA hiện dùng `TeachingDashboardNotifications`, giữ phong cách Teaching:

- Avatar tròn 38px, ảnh người gửi nếu có, fallback initials/màu như component trước; giữ tên người gửi, tiêu đề, nội dung, thời gian và badge **Mới!**.
- Toàn hàng là React Router Link tới `/{role}/notifications?notificationId={id}`. Click avatar hoặc nội dung đều mở đúng detail.
- Enter dùng hành vi native của link; Space kích hoạt cùng link và chặn cuộn trang.
- Hover nền sáng, focus outline rõ; không có handler đánh dấu đọc trong Dashboard.
- Badge Mới! dựa trên `isRead` từng recipient. Header unread count, Bell, Inbox và Dashboard dùng cùng `useNotificationInbox`/store.
- Đã bỏ request Notifications bằng ID Teacher/TA cố định và đoạn filter unread-only/tối đa 4 item trong Dashboard page. Các KPI, hồ sơ, Schedule và Today Classes không đổi nghiệp vụ.
- Bổ sung trường tùy chọn `senderAvatarUrl` trong DTO/snapshot để giữ ảnh người gửi từ `users.avatar_url`; query đã include Sender sẵn. Đây là metadata hiển thị, không thay đổi logic nhận/đọc hay schema.

**Kết quả:** PASS trên Teacher/TA tại 1440, 768, 390, 360px. Kiểm tra click avatar/nội dung, Space ở tablet, Enter ở mobile, đúng NotificationId, avatar ảnh từ snapshot, fallback initials, focus và badge. So sánh Inbox trước/sau mở Dashboard xác nhận không có thao tác read. Detail mới đánh dấu đọc; quay lại Dashboard vẫn giữ item trong grace, bỏ Mới!, không reset ReadAt của item đã đọc.

Dashboard và Bell được đối chiếu cùng danh sách ID, tối đa 5. Bộ empty-state/grace cũng chạy với Teacher/TA tại 1440/768/390px.

## 3. Form gửi — Nhãn Student/Parent

Mapping dành riêng cho đối tượng gửi:

```text
value: student
label: Học viên / Phụ huynh (Student / Parent)
helper: Thông báo gửi đến học viên cũng được gửi cho phụ huynh liên kết.
```

- Chỉ đổi option Student trong phạm vi Theo vai trò; bốn nhãn role khác giữ nguyên.
- Nhãn tài khoản Student trong combobox/thông tin người dùng vẫn là Học viên (Student), tránh mô tả sai role thật của tài khoản.
- Dropdown vẫn có đúng năm role, không thêm Parent hoặc `student_parent`.
- Helper liên kết bằng aria-describedby và có dòng nhãn đầy đủ tự wrap để dễ đọc trên mobile.
- Backend giữ `targetRole: student`; chỉ mở rộng tới phụ huynh active, có tài khoản/role Parent hợp lệ và liên kết với Student thực sự nhận, theo NTF-01 đã triển khai. Không gửi độc lập tới toàn bộ Parent.

**Kết quả:** PASS với form CM/AD ở 1440, 768, 390, 360px. Kiểm tra option label/value, helper, containment, đúng năm role và các nhãn còn lại. Unit test xác nhận mapping đối tượng gửi không đổi mapping role tài khoản. Bộ integration cũ vẫn kiểm tra propagation user/role/class/all, dedup, self-exclusion và trạng thái recipient độc lập.

## 4. File thay đổi trong lần bổ sung

Đường dẫn từ repository root:

| File | Nội dung |
|---|---|
| `Capstone2/frontend/src/GUIs/components/shared/notifications/NotificationEmptyState.tsx` | Empty State dùng chung |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/TeachingDashboardNotifications.tsx` | Card Teaching dùng store chung, avatar, link, bàn phím |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/NotificationQuickViews.tsx` | Dùng Empty State cho CM/AD Dashboard |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/notifications.css` | Styling giới hạn trong Notifications |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/ComposeNotificationModal.tsx` | Mapping audience và helper Student/Parent |
| `Capstone2/frontend/src/BLL/services/notificationPresentation.ts` | Nhãn audience riêng, giữ role tài khoản |
| `Capstone2/frontend/src/BLL/models/NotificationDto.ts` | Avatar metadata tùy chọn |
| `Capstone2/frontend/src/GUIs/components/teacher/Teacher/dashboard/NotificationsSection.tsx` | Tích hợp card dùng chung |
| `Capstone2/frontend/src/GUIs/components/teacher/TeachingAssistant/dashboard/NotificationsSection.tsx` | Tích hợp card dùng chung |
| `Capstone2/frontend/src/GUIs/pages/teacher/Teacher/TeacherDashboardPage.tsx` | Bỏ nguồn/filter Notifications riêng |
| `Capstone2/frontend/src/GUIs/pages/teacher/TeachingAssistant/TeachingAssistantDashboardPage.tsx` | Bỏ nguồn/filter Notifications riêng |
| `Capstone2/backend/Models/DTOs/NotificationDto.cs` | Trường SenderAvatarUrl tùy chọn |
| `Capstone2/backend/Services/Notifications/NotificationInboxService.cs` | Map avatar từ Sender, không sửa quy tắc quick view/read |
| `Capstone2/backend.Tests/Notifications/Program.cs` | Avatar fixture tổng hợp trong DB cô lập và assertion metadata |
| `Capstone2/frontend/tests/notificationCompose.test.mjs` | Kiểm tra mapping nhãn mới |
| `Capstone2/frontend/tests/notifications.http.browser.mjs` | Dashboard bốn vai trò, keyboard/deep-link/grace/empty/role helper |
| Hai báo cáo Markdown Notifications | Báo cáo tổng thể và phần bổ sung này |

## 5. Kiểm thử tổng hợp và giới hạn

| Nhóm | Kết quả |
|---|---|
| Lint, typecheck, production build frontend | PASS |
| Frontend unit tests | 164 PASS, 0 fail/skip |
| Backend/harness build | PASS; full compile có nullable warning cũ ngoài phần thay đổi |
| HTTP/MySQL integration cùng bộ NTF-01 trước | 115 assertions PASS |
| Browser acceptance tổng thể | 58 nhóm PASS, không có failure |

Bằng chứng lượt chốt:

- `%TEMP%/edutrack-notifications-browser-jayRwl/results.json`: 58/58 nhóm PASS, `failures: []`, trong đó 12 nhóm empty-state/grace; ảnh bốn Dashboard, card rỗng và form chọn Student/Parent theo viewport.
- `%TEMP%/edutrack-notification-supplement-http.log`: 115 assertions PASS; schema `edutrack_notify_test_db67f980571448ebb83de8ac174685a1` đã dọn.
- `%TEMP%/edutrack-notification-supplement-lint.log`, `edutrack-notification-supplement-unit.log`, `edutrack-notification-supplement-build.log`, `edutrack-notification-supplement-backend-build.log`.
- Datadir test `%TEMP%/edutrack-enrollment-mysql-38fd41c5c45c4076b54b93fa13771991/`; runner xác nhận dừng đúng process test 8008.

Hover được kiểm tra bằng mouse event thật và computed background sau transition; focus bằng bàn phím. Ảnh empty state được chụp sau khi cuộn tức thời và xác nhận card nằm trọn trong viewport. Đã xem ảnh CM desktop, AD mobile, Teacher mobile, TA tablet và nhãn Student/Parent mobile.

Các thao tác ghi chỉ dùng server MySQL độc lập port 33308/datadir Temp được xác minh và schema tên ngẫu nhiên. Schema test đã được dọn, server test được dừng. Không gửi thông báo thử hoặc chạy migration trên `edutrack_db`.

Notifications thành công dùng HTTP và database thật. Fixture avatar là ảnh SVG tổng hợp chỉ ở test. Request của module khác ngoài fixture bị chặn/trả lỗi; vì vậy các KPI/biểu đồ khác có thể báo lỗi hoặc dùng fallback legacy trong ảnh. Không coi các phần đó là đã nghiệm thu. Không đưa fallback/mock Notifications vào luồng production mới.

Thời gian grace được kiểm tra bằng clock/timer điều khiển ở test, không thay đổi production clock. Chưa kiểm toán screen reader, Firefox/Safari hoặc benchmark hàng nghìn tài khoản.

Không cần migration, không đổi Approval Requests, không khôi phục Authentication/Authorization, không đổi Schedule, không tạo PDF/Word. Không stage/commit/push/merge/PR.

Git tổng thể sau task gốc và phần bổ sung: 33 file (23 modified, 10 untracked), gồm 19 frontend source, 8 backend source, 4 file test và 2 báo cáo Markdown. Danh sách đầy đủ nằm trong báo cáo tổng thể. Không còn blocker trong phạm vi ba yêu cầu UI này.
