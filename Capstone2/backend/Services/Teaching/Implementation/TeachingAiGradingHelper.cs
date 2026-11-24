using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml.Linq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace EduTrack.API.Services.Teaching.Implementation
{
    /// <summary>
    /// Hỗ trợ trích xuất văn bản từ file PDF / Word (.docx, .doc, .pdf, .txt) và gọi OpenAI API để chấm bài nháp (Human-in-the-loop).
    /// Có cơ chế bảo mật khóa API và thông báo lỗi thân thiện khi hết hạn mức hoặc lỗi kết nối.
    /// </summary>
    public static class TeachingAiGradingHelper
    {
        private static readonly HttpClient SharedHttpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(60)
        };

        public static string? ResolvePhysicalPath(IWebHostEnvironment? env, string? fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl) || fileUrl == "#") return null;

            var cleanUrl = fileUrl.Trim();
            if (cleanUrl.StartsWith("https://storage.edutrack.edu.vn/", StringComparison.OrdinalIgnoreCase))
            {
                var fileName = cleanUrl.Split('/').LastOrDefault();
                if (!string.IsNullOrWhiteSpace(fileName))
                {
                    cleanUrl = $"/uploads/teaching/{fileName}";
                }
            }

            var relativePath = cleanUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var webRoot = env?.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            var candidate1 = Path.Combine(webRoot, relativePath);
            if (File.Exists(candidate1)) return candidate1;

            // Fallback: check uploads/teaching or uploads/submissions by filename
            var baseFileName = Path.GetFileName(relativePath);
            if (!string.IsNullOrWhiteSpace(baseFileName))
            {
                var teachingPath = Path.Combine(webRoot, "uploads", "teaching", baseFileName);
                if (File.Exists(teachingPath)) return teachingPath;

                var subPath = Path.Combine(webRoot, "uploads", "submissions", baseFileName);
                if (File.Exists(subPath)) return subPath;

                var frontendPublicPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "frontend", "public", relativePath));
                if (File.Exists(frontendPublicPath)) return frontendPublicPath;
            }

            return null;
        }

        public static string ExtractDocumentText(string? physicalPath)
        {
            if (string.IsNullOrWhiteSpace(physicalPath) || !File.Exists(physicalPath))
            {
                return string.Empty;
            }

            var ext = Path.GetExtension(physicalPath).ToLowerInvariant();
            try
            {
                if (ext == ".docx")
                {
                    return ExtractDocxText(physicalPath);
                }
                if (ext == ".pdf")
                {
                    return ExtractPdfText(physicalPath);
                }
                if (ext == ".txt" || ext == ".md" || ext == ".csv" || ext == ".json")
                {
                    return File.ReadAllText(physicalPath, Encoding.UTF8);
                }
                if (ext == ".doc")
                {
                    return ExtractLegacyDocText(physicalPath);
                }
            }
            catch
            {
                // Ignore extraction failure and fallback to attachment/metadata
            }

            return string.Empty;
        }

        private static string ExtractDocxText(string filePath)
        {
            using var archive = ZipFile.OpenRead(filePath);
            var entry = archive.GetEntry("word/document.xml");
            if (entry == null) return string.Empty;

            using var stream = entry.Open();
            var xdoc = XDocument.Load(stream);
            XNamespace w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

            var paragraphs = new List<string>();
            foreach (var p in xdoc.Descendants(w + "p"))
            {
                var texts = p.Descendants(w + "t").Select(t => t.Value);
                var line = string.Concat(texts).Trim();
                if (!string.IsNullOrWhiteSpace(line))
                {
                    paragraphs.Add(line);
                }
            }

            return string.Join("\n", paragraphs);
        }

        private static string ExtractLegacyDocText(string filePath)
        {
            var bytes = File.ReadAllBytes(filePath);
            var raw = Encoding.UTF8.GetString(bytes);
            var matches = Regex.Matches(raw, @"[\p{L}\p{N}\p{P}\p{Zs}]{4,}");
            var sb = new StringBuilder();
            foreach (Match m in matches)
            {
                var val = m.Value.Trim();
                if (val.Length >= 4) sb.AppendLine(val);
            }
            var result = sb.ToString();
            return result.Length > 15000 ? result[..15000] : result;
        }

        private static string ExtractPdfText(string filePath)
        {
            var bytes = File.ReadAllBytes(filePath);
            var latin = Encoding.Latin1.GetString(bytes);
            var sb = new StringBuilder();

            // 1. Decompress FlateDecode streams and extract text inside (...) Tj / [...] TJ
            var streamRegex = new Regex(@"stream\r?\n([\s\S]*?)\r?\nendstream", RegexOptions.Compiled);
            foreach (Match match in streamRegex.Matches(latin))
            {
                var streamContent = match.Groups[1].Value;
                var streamBytes = Encoding.Latin1.GetBytes(streamContent);
                string decodedStream = TryInflatePdfStream(streamBytes) ?? streamContent;

                ExtractPdfTextTokens(decodedStream, sb);
            }

            if (sb.Length < 20)
            {
                ExtractPdfTextTokens(latin, sb);
            }

            var cleaned = Regex.Replace(sb.ToString(), @"\s+", " ").Trim();
            return cleaned.Length > 18000 ? cleaned[..18000] : cleaned;
        }

        private static string? TryInflatePdfStream(byte[] rawBytes)
        {
            try
            {
                using var ms = new MemoryStream(rawBytes);
                using var zlib = new ZLibStream(ms, CompressionMode.Decompress);
                using var reader = new StreamReader(zlib, Encoding.UTF8);
                return reader.ReadToEnd();
            }
            catch
            {
                try
                {
                    if (rawBytes.Length > 2)
                    {
                        using var ms = new MemoryStream(rawBytes, 2, rawBytes.Length - 2);
                        using var deflate = new DeflateStream(ms, CompressionMode.Decompress);
                        using var reader = new StreamReader(deflate, Encoding.UTF8);
                        return reader.ReadToEnd();
                    }
                }
                catch
                {
                    // Not a compressed Flate stream
                }
            }
            return null;
        }

        private static void ExtractPdfTextTokens(string content, StringBuilder sb)
        {
            var parenMatches = Regex.Matches(content, @"\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*(?:Tj|'|\"")");
            foreach (Match m in parenMatches)
            {
                var token = UnescapePdfString(m.Groups[1].Value);
                if (IsReadableText(token))
                {
                    sb.Append(token).Append(' ');
                }
            }

            var arrayMatches = Regex.Matches(content, @"\[(.*?)\]\s*TJ", RegexOptions.Singleline);
            foreach (Match arr in arrayMatches)
            {
                var innerMatches = Regex.Matches(arr.Groups[1].Value, @"\(([^()\\]*(?:\\.[^()\\]*)*)\)");
                foreach (Match im in innerMatches)
                {
                    var token = UnescapePdfString(im.Groups[1].Value);
                    if (IsReadableText(token))
                    {
                        sb.Append(token);
                    }
                }
                sb.Append(' ');
            }
        }

        private static string UnescapePdfString(string input)
        {
            if (string.IsNullOrEmpty(input)) return string.Empty;
            return input
                .Replace(@"\(", "(")
                .Replace(@"\)", ")")
                .Replace(@"\\", "\\")
                .Replace(@"\n", "\n")
                .Replace(@"\r", " ")
                .Replace(@"\t", " ");
        }

        private static bool IsReadableText(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return false;
            return s.Any(ch => char.IsLetterOrDigit(ch));
        }

        public static async Task<(decimal Score, string Feedback, string RawJson)> CallOpenAiGradingAsync(
            IConfiguration configuration,
            IWebHostEnvironment? env,
            string assignmentTitle,
            string? assignmentDescription,
            decimal maxScore,
            string? assignmentFileUrl,
            string answerKeyFileUrl,
            string? answerKeyNotes,
            string studentName,
            string submissionFileUrl)
        {
            var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY")
                ?? configuration["OpenAI:ApiKey"]?.Trim();

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException(
                    "Chưa cấu hình khóa kết nối AI (OpenAI API Key) trên máy chủ. Vui lòng kiểm tra cấu hình hệ thống hoặc chấm điểm thủ công.");
            }

            var model = configuration["OpenAI:Model"]?.Trim();
            if (string.IsNullOrWhiteSpace(model))
            {
                model = "gpt-4o-mini";
            }

            var assignmentPath = ResolvePhysicalPath(env, assignmentFileUrl);
            var rubricPath = ResolvePhysicalPath(env, answerKeyFileUrl);
            var submissionPath = ResolvePhysicalPath(env, submissionFileUrl);

            var assignmentDocText = ExtractDocumentText(assignmentPath);
            var rubricDocText = ExtractDocumentText(rubricPath);
            var submissionDocText = ExtractDocumentText(submissionPath);

            var systemPrompt =
                "Bạn là trợ lý chấm bài AI chuyên nghiệp của hệ thống giáo dục EduTrack (Human-in-the-loop). " +
                "Nhiệm vụ của bạn là đối chiếu Bài nộp của học sinh với Đề bài và File Rubric / Đáp án & Cách giải của Giáo viên để đưa ra: " +
                $"1. Điểm số ước lượng (aiScore) trong khoảng từ 0 đến {maxScore:0.##} (làm tròn đến 0.25). " +
                "2. Nhận xét chi tiết, rõ ràng, mang tính xây dựng bằng tiếng Việt hoặc tiếng Anh phù hợp với ngôn ngữ bài tập (aiFeedback): nêu rõ những phần/câu học sinh làm đúng, những bước làm tốt được điểm thành phần, và những chỗ sai hoặc thiếu sót cần khắc phục để Giáo viên xem xét trước khi chốt điểm. " +
                "BẮT BUỘC chỉ trả về đúng định dạng JSON: {\"aiScore\": <number>, \"aiFeedback\": \"<string>\"}.";

            var userContentList = new List<object>();

            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("=== 1. THÔNG TIN BÀI TẬP (ASSIGNMENT) ===");
            promptBuilder.AppendLine($"Tiêu đề: {assignmentTitle}");
            promptBuilder.AppendLine($"Thang điểm tối đa: {maxScore:0.##}");
            if (!string.IsNullOrWhiteSpace(assignmentDescription))
                promptBuilder.AppendLine($"Mô tả đề bài: {assignmentDescription}");
            if (!string.IsNullOrWhiteSpace(assignmentDocText))
                promptBuilder.AppendLine($"Nội dung trích xuất từ file đề bài ({Path.GetFileName(assignmentFileUrl)}):\n{assignmentDocText}");

            promptBuilder.AppendLine("\n=== 2. RUBRIC / ĐÁP ÁN & CÁCH GIẢI CỦA GIÁO VIÊN ===");
            promptBuilder.AppendLine($"Tên file Rubric: {Path.GetFileName(answerKeyFileUrl)}");
            if (!string.IsNullOrWhiteSpace(answerKeyNotes))
                promptBuilder.AppendLine($"Lưu ý chấm điểm của Giáo viên: {answerKeyNotes}");
            if (!string.IsNullOrWhiteSpace(rubricDocText))
                promptBuilder.AppendLine($"Nội dung trích xuất từ file Rubric / Đáp án:\n{rubricDocText}");

            promptBuilder.AppendLine("\n=== 3. BÀI NỘP CỦA HỌC SINH (SUBMISSION) ===");
            promptBuilder.AppendLine($"Học sinh: {studentName}");
            promptBuilder.AppendLine($"Tên file bài nộp: {Path.GetFileName(submissionFileUrl)}");
            if (!string.IsNullOrWhiteSpace(submissionDocText))
                promptBuilder.AppendLine($"Nội dung trích xuất từ file bài làm của học sinh:\n{submissionDocText}");

            userContentList.Add(new
            {
                type = "text",
                text = promptBuilder.ToString()
            });

            // Nếu Đề bài, file Rubric hoặc file Bài nộp là Ảnh (.png/.jpg/.jpeg) hoặc PDF scan, đính kèm kèm nhãn rõ ràng để AI Vision phân biệt
            TryAttachFileOrImageForOpenAi("ĐỀ BÀI (ASSIGNMENT QUESTION)", assignmentPath, string.IsNullOrWhiteSpace(assignmentDocText), userContentList);
            TryAttachFileOrImageForOpenAi("RUBRIC / ĐÁP ÁN & LỜI GIẢI MẪU CỦA GIÁO VIÊN (TEACHER RUBRIC / ANSWER KEY)", rubricPath, string.IsNullOrWhiteSpace(rubricDocText), userContentList);
            TryAttachFileOrImageForOpenAi("BÀI LÀM CỦA HỌC SINH (STUDENT SUBMISSION)", submissionPath, string.IsNullOrWhiteSpace(submissionDocText), userContentList);

            var requestBody = new
            {
                model,
                temperature = 0.2,
                response_format = new { type = "json_object" },
                messages = new object[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userContentList }
                }
            };

            using var httpReq = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
            httpReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            httpReq.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            HttpResponseMessage response;
            try
            {
                response = await SharedHttpClient.SendAsync(httpReq);
            }
            catch (TaskCanceledException)
            {
                throw new InvalidOperationException(
                    "Yêu cầu phân tích AI bị quá thời gian chờ (Timeout). Vui lòng thử lại hoặc thực hiện chấm điểm thủ công.");
            }
            catch (Exception)
            {
                throw new InvalidOperationException(
                    "Không thể kết nối tới máy chủ OpenAI. Vui lòng kiểm tra kết nối mạng hoặc thực hiện chấm điểm thủ công.");
            }

            var responseText = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                // Nếu đính kèm file PDF block gặp lỗi định dạng trên model cũ, tự động thử lại chỉ với phần text
                if (response.StatusCode == HttpStatusCode.BadRequest && userContentList.Count > 1)
                {
                    return await RetryTextOnlyOpenAiAsync(apiKey, model, systemPrompt, promptBuilder.ToString(), maxScore);
                }

                throw MapFriendlyOpenAiException(response.StatusCode, responseText);
            }

            return ParseOpenAiGradingResponse(responseText, maxScore);
        }

        private static async Task<(decimal Score, string Feedback, string RawJson)> RetryTextOnlyOpenAiAsync(
            string apiKey,
            string model,
            string systemPrompt,
            string userText,
            decimal maxScore)
        {
            var requestBody = new
            {
                model,
                temperature = 0.2,
                response_format = new { type = "json_object" },
                messages = new object[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userText }
                }
            };

            using var httpReq = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
            httpReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            httpReq.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await SharedHttpClient.SendAsync(httpReq);
            var responseText = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                throw MapFriendlyOpenAiException(response.StatusCode, responseText);
            }

            return ParseOpenAiGradingResponse(responseText, maxScore);
        }

        private static void TryAttachFileOrImageForOpenAi(string sectionLabel, string? physicalPath, bool needPdfAttachment, List<object> contentList)
        {
            if (string.IsNullOrWhiteSpace(physicalPath) || !File.Exists(physicalPath)) return;
            try
            {
                var info = new FileInfo(physicalPath);
                if (info.Length <= 0 || info.Length > 8 * 1024 * 1024) return; // Giới hạn 8MB khi gửi inline

                var ext = info.Extension.ToLowerInvariant();
                if (ext == ".png" || ext == ".jpg" || ext == ".jpeg")
                {
                    var mime = ext == ".png" ? "image/png" : "image/jpeg";
                    var b64 = Convert.ToBase64String(File.ReadAllBytes(physicalPath));
                    contentList.Add(new
                    {
                        type = "text",
                        text = $"[Hình ảnh đính kèm cho mục: {sectionLabel} - Tệp: {info.Name}]"
                    });
                    contentList.Add(new
                    {
                        type = "image_url",
                        image_url = new { url = $"data:{mime};base64,{b64}" }
                    });
                }
                else if (ext == ".pdf" && needPdfAttachment)
                {
                    var b64 = Convert.ToBase64String(File.ReadAllBytes(physicalPath));
                    contentList.Add(new
                    {
                        type = "text",
                        text = $"[Tệp PDF đính kèm cho mục: {sectionLabel} - Tệp: {info.Name}]"
                    });
                    contentList.Add(new
                    {
                        type = "file",
                        file = new
                        {
                            filename = info.Name,
                            file_data = $"data:application/pdf;base64,{b64}"
                        }
                    });
                }
            }
            catch
            {
                // Ignore inline attachment errors
            }
        }

        private static InvalidOperationException MapFriendlyOpenAiException(HttpStatusCode statusCode, string rawBody)
        {
            var lower = (rawBody ?? string.Empty).ToLowerInvariant();

            if (statusCode == HttpStatusCode.Unauthorized || lower.Contains("invalid_api_key"))
            {
                return new InvalidOperationException(
                    "Khóa kết nối AI (OpenAI API Key) không hợp lệ hoặc đã bị thu hồi. Vui lòng kiểm tra lại cấu hình hệ thống hoặc chấm điểm thủ công.");
            }

            if (statusCode == HttpStatusCode.TooManyRequests
                || lower.Contains("insufficient_quota")
                || lower.Contains("billing")
                || lower.Contains("quota"))
            {
                return new InvalidOperationException(
                    "Tài khoản AI (OpenAI API) hiện đã hết hạn mức sử dụng (Quota/Credit) hoặc đang giới hạn tốc độ gọi. Vui lòng nạp thêm hạn mức API hoặc thực hiện chấm điểm thủ công.");
            }

            return new InvalidOperationException(
                "Dịch vụ AI tạm thời không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau giây lát hoặc thực hiện chấm điểm thủ công.");
        }

        private static (decimal Score, string Feedback, string RawJson) ParseOpenAiGradingResponse(string responseText, decimal maxScore)
        {
            try
            {
                using var doc = JsonDocument.Parse(responseText);
                var content = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(content))
                {
                    throw new InvalidOperationException("AI không trả về nội dung đánh giá. Vui lòng thử lại.");
                }

                using var parsed = JsonDocument.Parse(content);
                var root = parsed.RootElement;

                decimal score = 0m;
                if (root.TryGetProperty("aiScore", out var scoreEl))
                {
                    if (scoreEl.ValueKind == JsonValueKind.Number && scoreEl.TryGetDecimal(out var dec))
                    {
                        score = dec;
                    }
                    else if (scoreEl.ValueKind == JsonValueKind.String && decimal.TryParse(scoreEl.GetString(), out var parsedDec))
                    {
                        score = parsedDec;
                    }
                }

                if (score < 0m) score = 0m;
                if (score > maxScore) score = maxScore;
                score = Math.Round(score * 4m, MidpointRounding.AwayFromZero) / 4m;

                string feedback = "Đã phân tích bài làm theo Rubric của giáo viên.";
                if (root.TryGetProperty("aiFeedback", out var fbEl) && fbEl.ValueKind == JsonValueKind.String)
                {
                    var str = fbEl.GetString()?.Trim();
                    if (!string.IsNullOrWhiteSpace(str))
                    {
                        feedback = str;
                    }
                }

                return (score, feedback, content);
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch
            {
                throw new InvalidOperationException(
                    "Không thể đọc định dạng phản hồi từ AI. Vui lòng thử lại hoặc thực hiện chấm điểm thủ công.");
            }
        }
    }
}
