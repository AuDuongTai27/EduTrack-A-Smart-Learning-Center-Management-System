# EduTrack — GitHub Actions CI

Ngày kiểm tra local: 07/11/2026, Asia/Bangkok.

> Đây là báo cáo thiết lập ban đầu, trước lần push xác minh. Trạng thái của commit được push sau đó phải đối chiếu trực tiếp trên GitHub Actions.

Đã thêm một workflow `.github/workflows/ci.yml` gồm hai job độc lập: **Frontend CI** và **Backend CI**. Chưa commit/push/merge và chưa có lần chạy workflow này trên GitHub. **Các bước local đạt không có nghĩa CI trên GitHub đã đạt.**

## Cấu trúc được kiểm tra

- `Capstone2/frontend`: React 19, TypeScript 6, Vite 8; `package-lock.json` v3 phù hợp và cài sạch được bằng `npm ci`. Script build hiện tại đã có `tsc -b && vite build`; lint dùng Oxlint.
- Có 10 file `tests/*.test.mjs`, tổng 82 test chạy bằng Node test runner. Một số test dùng Vite SSR để nạp module và mock `fetch`; không cần API/MySQL thật.
- Các file `*.browser.mjs` và `*.integration.mjs` là bộ kiểm tra riêng. Chúng không thuộc lệnh unit test CI vì có những script yêu cầu Chrome hoặc API/database test riêng.
- `Capstone2/backend/EduTrack.API.csproj`: ASP.NET Core, target `net8.0`; có EF/Pomelo nhưng build không khởi động ứng dụng.
- Solution hiện có là `Capstone2/backend/EduTrack.API.slnx`. SDK 8.0.427 không đọc được định dạng này trong kiểm tra local, nên workflow restore/build trực tiếp từng `.csproj`.
- `Capstone2/backend.Tests/TuitionPolicy.Tests.csproj`: chương trình console `net8.0`, liên kết trực tiếp `TuitionPolicy.cs`, có 18 assertion thật và ném exception khi sai. Không tham chiếu API host, DbContext hoặc database.
- **Chưa có test project dùng Microsoft.NET.Test.Sdk/xUnit/NUnit/MSTest.** Workflow chạy console harness bằng `dotnet run` với tên bước rõ ràng; không dùng `dotnet test` để báo thành công mà không phát hiện test.
- Trước task chưa có `.github/workflows`; không tạo workflow trùng chức năng.

## Khi workflow chạy

| Sự kiện | Phạm vi |
| --- | --- |
| `push` | Nhánh `Duy` hoặc `main` |
| `pull_request` | PR hướng vào `main`: mở, cập nhật commit, mở lại |
| `workflow_dispatch` | Chạy thủ công khi workflow đã hiện diện trên nhánh mặc định |

Không lọc theo đường dẫn để các required check luôn được tạo. `concurrency` hủy lần chạy cũ cùng event/ref khi có lần mới; push và PR được giữ riêng để không vô tình hủy check của PR. Do yêu cầu chạy cả push `Duy` lẫn PR vào `main`, push lên `Duy` có PR đang mở có thể tạo hai run theo hai event. Đây là cùng một workflow, không phải workflow bị tạo trùng.

Quy tắc trigger, concurrency, quyền và trạng thái bước dựa trên [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax). Điều kiện workflow thủ công phải tồn tại trên nhánh mặc định được mô tả trong [workflow_dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch).

## Hai job

### Frontend CI

Ubuntu hosted runner; Node.js 24 theo `Capstone2/frontend/.nvmrc`. Node 24 phù hợp yêu cầu engine của Vite/Oxlint và các test nhập TypeScript trực tiếp. Dùng npm cache theo hash lockfile, vẫn chạy `npm ci` để kiểm tra cài đặt sạch.

Chạy lần lượt:

```text
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Hai script mới trong package.json là `typecheck: tsc -b` và `test: node --test tests/*.test.mjs`. Giữ nguyên script build để hành vi build local hiện tại không thay đổi; lần kiểm tra TypeScript trong build có thể dùng kết quả incremental trước đó.

### Backend CI

Ubuntu hosted runner; cài SDK `8.0.x`. Tạo `Capstone2/global.json` **chỉ trong checkout của runner** theo phiên bản SDK vừa cài để tránh vô tình chọn SDK mới hơn có sẵn trên runner. Không thêm global.json vào source hoặc ép đổi SDK của workspace local.

```text
dotnet restore backend/EduTrack.API.csproj
dotnet restore backend.Tests/TuitionPolicy.Tests.csproj
dotnet build backend/EduTrack.API.csproj --configuration Release --no-restore
dotnet build backend.Tests/TuitionPolicy.Tests.csproj --configuration Release --no-restore
dotnet run --project backend.Tests/TuitionPolicy.Tests.csproj --configuration Release --no-build --no-restore
```

Hiện chưa có NuGet lockfile nên chưa bật cache của setup-dotnet; tránh cấu hình cache đòi lockfile chưa tồn tại. Có thể bổ sung sau cùng chính sách khóa dependencies. Tham khảo cấu hình chính thức của [setup-node](https://github.com/actions/setup-node) và [setup-dotnet](https://github.com/actions/setup-dotnet).

Hai job không phụ thuộc nhau; một job lỗi không ngăn job còn lại cung cấp kết quả. Các bước dùng Bash fail-fast, không có `continue-on-error`, `|| true` hoặc bước ghi đè trạng thái lỗi. Mỗi job giới hạn 15 phút; log chia theo từng bước cài đặt/lint/typecheck/test/build để xác định lỗi.

## An toàn

- Chỉ dùng GitHub-hosted runner, không dùng máy local làm self-hosted runner.
- Token chỉ có `contents: read`, checkout `persist-credentials: false`.
- Actions chính thức được ghim bằng commit SHA, có comment phiên bản; không chạy script trên nhánh `main` biến động của action.
- Không dùng `pull_request_target`, secrets repository, connection string, dịch vụ MySQL hoặc database credentials.
- Không khởi động API, vì startup hiện tại có AutoDetect connection và DbSeeder. Lệnh `dotnet run` chỉ chạy **TuitionPolicy.Tests.csproj** độc lập.
- Không gọi EF migration/database update, SQL script, restore database hoặc deploy.
- Không chạy integration test cần API/MySQL trong CI này. Nếu thêm sau này phải dựng database độc lập với dữ liệu giả và guard đích, không dùng dump local có dữ liệu thật.
- Các bản sao dùng để kiểm tra local không chứa `.env` hay appsettings local, không thay node_modules của ứng dụng đang chạy. Task CI không kết nối MySQL và không dừng/khởi động lại ứng dụng.

## Kết quả local

Đã kiểm tra từ bản sao source sạch tại thư mục tạm, dùng Windows, Node **24.19.0**, npm **11.17.0**, và SDK **8.0.427** cài riêng trong thư mục tạm. SDK hệ thống không bị thay đổi. Cài đặt package thành công từ lockfile, không sửa lockfile.

| Kiểm tra | Kết quả local |
| --- | --- |
| `actionlint` 1.7.12 trên workflow | Đạt, exit 0; kiểm tra YAML, schema GitHub Actions, biểu thức và tham số action |
| `npm ci` | Đạt, exit 0 |
| `npm run lint` | Đạt, exit 0; **190 warning**, 0 error theo cấu hình hiện tại |
| `npm run typecheck` | Đạt |
| Unit tests qua script npm | **82 pass, 0 fail, 0 skip** |
| `npm run build` | Đạt; cảnh báo bundle trên 500 kB vẫn còn |
| Restore hai project .NET | Đạt |
| API build Release bằng SDK 8 | Đạt; 3 warning CS8601 sẵn có, 0 error |
| Policy harness build Release | Đạt, 0 warning/error |
| Chạy policy harness | **18 assertion đạt**, không truy cập database |
| `git diff --check` | Đạt |

`actionlint` được tải từ release chính thức và đối chiếu SHA-256 với checksum release trước khi sử dụng. Kiểm tra local không mô phỏng runner Ubuntu, token, event, cache hoặc giao diện status check của GitHub.

**Cảnh báo dependency:** `npm ci` báo hai package mức high. Kiểm tra chẩn đoán `npm audit --json` xác nhận `vite` và `source-map-js` có advisory; lệnh audit trả exit 1. Không chạy audit fix, không nâng dependencies trong task này. Đây không phải bước gate hiện tại của workflow; không coi CI xanh là chứng nhận không có lỗ hổng. Cần xử lý dependency ở thay đổi riêng và kiểm thử lại. Lint cũng giữ nguyên chế độ warning hiện tại, không hạ mức lỗi để tạo kết quả pass.

**Chưa kiểm chứng trên GitHub:** cả Frontend CI và Backend CI, bao gồm trigger, checkout/action SHA, cài SDK trên Ubuntu, cache, quyền token và kết quả check gắn với commit/PR. Chỉ có thể kết luận sau khi người dùng push và quan sát run thực tế.

## File thêm/sửa cho task CI

| File | Thay đổi |
| --- | --- |
| `.github/workflows/ci.yml` | Workflow duy nhất, hai job frontend/backend |
| `Capstone2/frontend/.nvmrc` | Chọn Node 24 |
| `Capstone2/frontend/package.json` | Thêm script typecheck/test thật |
| `.gitignore` | Cho phép đưa source harness backend.Tests vào Git; bin/obj vẫn bị bỏ qua |
| `Capstone2/backend.Tests/Program.cs` | Source có sẵn, giữ nguyên nội dung; cần được đưa vào commit để CI chạy 18 assertion |
| `Capstone2/backend.Tests/TuitionPolicy.Tests.csproj` | Project có sẵn, giữ nguyên nội dung; cần được đưa vào commit |
| `docs/EDUTRACK_CI_SETUP.md` | Báo cáo và hướng dẫn này |

`backend.Tests` trước đó bị `.git/info/exclude` trên máy này che khỏi Git. Ngoại lệ trong `.gitignore` khiến hai file source hiện ra cho review/staging mà không sửa `.git/info/exclude`. Đã xác nhận `bin/` và `obj/` vẫn bị ignore. Các thay đổi Task 02/02.1 có sẵn được giữ nguyên; không chỉnh module sản phẩm cho task CI.

## Chạy lại local trước khi push

Trong `Capstone2/frontend`, dùng Node 24 và chạy năm lệnh frontend ở trên. Trong `Capstone2`, dùng SDK 8 và chạy năm lệnh backend ở trên. Không chạy `dotnet run` với project API để thay thế bước kiểm tra. Nếu máy có nhiều SDK và đang chọn SDK 10, các lệnh vẫn có thể build target net8.0 nhưng cần phân biệt với việc đã kiểm tra bằng SDK 8; lần kiểm tra trong báo cáo này dùng đúng SDK 8 riêng.

Trước mỗi lần push:

1. Review `git status --short`, `git diff`, rồi các file staged bằng `git diff --cached`. Kiểm tra các script, đường dẫn project/test, phiên bản Node/.NET và workflow vẫn phù hợp thay đổi task mới.
2. Chạy local build/test; xử lý lỗi thật. Không đổi cấu hình để che lỗi hoặc biến test chưa chạy thành pass.
3. Workspace hiện còn nhiều thay đổi Task 02/02.1 chưa commit. Đảm bảo commit chứa đủ source cần thiết, kể cả các file Grade mới; không chỉ đưa workflow lên trong khi code đang tham chiếu file chưa có trên Git. Không stage backup, secrets, bin/obj/node_modules.
4. Sau khi tự review, stage các file dự định và commit. Task này chưa thực hiện stage/commit/push giúp người dùng.
5. Nếu `origin` là remote dự định và nhánh hiện tại là `Duy`, tự chạy `git push origin Duy`.

## Kiểm tra trên GitHub

1. Mở repository → **Actions** → **EduTrack CI**. Chọn run có đúng branch và commit SHA vừa push.
2. Mở riêng **Frontend CI** và **Backend CI**. Xem từng step, đặc biệt unit test phải thực sự ghi 82 test hoặc số test mới; policy harness phải in số assertion thực tế. Nếu lỗi, mở log step đỏ và dùng lệnh tương ứng để tái hiện; sửa, chạy local rồi push lại.
3. Với PR hướng vào `main`, kiểm tra thêm tab **Checks** của PR và commit mới nhất. Run cũ bị cancel không thay cho kết quả của commit mới.
4. Khi workflow đã có trên nhánh mặc định, có thể vào Actions → EduTrack CI → **Run workflow**, chọn nhánh cần kiểm tra. Trước thời điểm đó, dùng trigger push `Duy`/PR để kiểm chứng.
5. Chỉ đề xuất merge khi **cả Frontend CI và Backend CI của commit mới nhất đều đạt**, cùng các required check khác của repository. Có thể cấu hình ruleset/branch protection cho `main` yêu cầu hai check này sau khi chúng đã chạy và xuất hiện trên GitHub; task này không sửa thiết lập repository.

Không có CD tự động. Chờ người dùng review source và tự quyết định commit/push; chưa tuyên bố GitHub CI thành công.

## Chuẩn bị công bố source sau phê duyệt push

Người dùng đã phê duyệt bước xác minh cuối, commit và push lên `origin/Duy`; không merge/deploy/migration. Nhánh và remote đã được đối chiếu với repository `AuDuongTai27/EduTrack-A-Smart-Learning-Center-Management-System`.

Danh sách chuẩn bị gồm 66 file của Task 02, Task 02.1, các test và CI. Không có backup, dump dữ liệu, `.env` thật, appsettings thật, credentials, bin/obj hoặc node_modules trong danh sách. `.env.example` có sẵn chỉ là template và không thay đổi trong commit này. Đã rà mẫu credential và đối chiếu model trong migration Designer với snapshot.

Do repository public, các báo cáo vận hành dùng placeholder cho định danh máy và đường dẫn profile local. Bản nguyên gốc được giữ trong `Capstone2/db/backups/publication-review-*`, đã Git ignore. SQL postflight công bố là template chỉ đọc, có `REPLACE_WITH_APPROVED_SERVER_UUID`: phải điền UUID được phê duyệt từ preflight trước khi dùng; giữ guard sai đích ở trạng thái dừng. File migration đã kiểm thử `AddGradeClassification.review.sql` giữ nguyên byte/SHA-256. Không thực thi SQL nào khi chuẩn bị push.

Khi review cả file mới trong staged diff, `git diff --cached --check` nhận diện một dòng trống cuối file migration SQL đã phê duyệt. Giữ nguyên dòng này để bảo toàn hash đã kiểm thử; đây là cảnh báo định dạng, không phải lỗi build/test. Những file khác phải qua whitespace check. Không sửa quy tắc CI hoặc tắt kiểm thử để bỏ qua lỗi.

Kiểm tra byte staged còn phát hiện cơ chế đổi line ending của Git làm blob migration khác file đã duyệt dù working file không đổi. Đã thêm `.gitattributes` với `-text` **chỉ cho file migration đã duyệt**, rồi stage lại để blob Git giữ đúng byte gốc, gồm UTF-8 BOM và CRLF. Không sửa SQL; checkout trên hệ điều hành khác vẫn phải giữ SHA-256 `2f4f1371e913ed1e1224d3d4e7f2a163c0cd9885b4f25530482c5578fa117dd4`.

Lần chạy lại trước commit trên snapshot staged sạch: đủ năm bước frontend đạt (82 test, 0 fail/skip), restore/build Release bằng SDK 8.0.427 và 18 assertion backend đạt. Thay đổi bổ sung sau snapshot này chỉ gồm `.gitattributes`, bảo toàn byte SQL và ghi nhận báo cáo; không thay mã ứng dụng hoặc cấu hình gate CI. GitHub Actions của commit cuối vẫn phải được kiểm chứng sau push.
