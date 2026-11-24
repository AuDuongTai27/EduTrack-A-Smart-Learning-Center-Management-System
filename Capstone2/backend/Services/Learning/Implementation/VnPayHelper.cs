using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace EduTrack.API.Services.Learning.Implementation
{
    /// <summary>
    /// Bộ xử lý chuẩn giao thức VNPay Payment Gateway v2.1.0 (Sắp xếp tham số ASCII Ordinal, URL Encode và ký số HMAC-SHA512)
    /// </summary>
    public static class VnPayHelper
    {
        private sealed class VnPayCompare : IComparer<string>
        {
            public int Compare(string? x, string? y)
            {
                if (x == y) return 0;
                if (x == null) return -1;
                if (y == null) return 1;
                return CompareInfo.GetCompareInfo("en-US").Compare(x, y, CompareOptions.Ordinal);
            }
        }

        public static string CreatePaymentUrl(
            string baseUrl,
            string hashSecret,
            SortedList<string, string> requestData)
        {
            var data = new StringBuilder();
            foreach (var kv in requestData)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                }
            }

            string queryString = data.ToString();
            string signData = queryString;
            if (signData.Length > 0)
            {
                signData = signData.Remove(signData.Length - 1, 1);
            }

            string vnpSecureHash = HmacSha512(hashSecret, signData);
            return $"{baseUrl}?{queryString}vnp_SecureHash={vnpSecureHash}";
        }

        public static bool ValidateSignature(
            IDictionary<string, string> queryParams,
            string inputHash,
            string hashSecret)
        {
            if (string.IsNullOrWhiteSpace(inputHash) || string.IsNullOrWhiteSpace(hashSecret))
            {
                return false;
            }

            var responseData = new SortedList<string, string>(new VnPayCompare());
            foreach (var kv in queryParams)
            {
                if (!string.IsNullOrEmpty(kv.Key) &&
                    kv.Key.StartsWith("vnp_", StringComparison.Ordinal) &&
                    !string.Equals(kv.Key, "vnp_SecureHash", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(kv.Key, "vnp_SecureHashType", StringComparison.OrdinalIgnoreCase) &&
                    !string.IsNullOrEmpty(kv.Value))
                {
                    responseData[kv.Key] = kv.Value;
                }
            }

            var data = new StringBuilder();
            foreach (var kv in responseData)
            {
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }

            if (data.Length > 0)
            {
                data.Remove(data.Length - 1, 1);
            }

            string encodedSignData = data.ToString();
            string myChecksum = HmacSha512(hashSecret, encodedSignData);
            if (string.Equals(myChecksum, inputHash.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // Fallback 1: Chuẩn RFC 3986 (Uri.EscapeDataString dùng %20 thay vì '+' cho khoảng trắng)
            var rfcData = new StringBuilder();
            foreach (var kv in responseData)
            {
                rfcData.Append(Uri.EscapeDataString(kv.Key) + "=" + Uri.EscapeDataString(kv.Value) + "&");
            }
            if (rfcData.Length > 0)
            {
                rfcData.Remove(rfcData.Length - 1, 1);
            }
            if (string.Equals(HmacSha512(hashSecret, rfcData.ToString()), inputHash.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // Fallback 2: Trường hợp queryParams truyền vào chưa bị decode hoặc cổng VNPay ký trên chuỗi raw
            var rawData = new StringBuilder();
            foreach (var kv in responseData)
            {
                rawData.Append(kv.Key + "=" + kv.Value + "&");
            }
            if (rawData.Length > 0)
            {
                rawData.Remove(rawData.Length - 1, 1);
            }
            return string.Equals(HmacSha512(hashSecret, rawData.ToString()), inputHash.Trim(), StringComparison.OrdinalIgnoreCase);
        }

        public static bool ValidateRawQueryString(string? rawQueryString, string inputHash, string hashSecret)
        {
            if (string.IsNullOrWhiteSpace(rawQueryString) ||
                string.IsNullOrWhiteSpace(inputHash) ||
                string.IsNullOrWhiteSpace(hashSecret))
            {
                return false;
            }

            string clean = rawQueryString.TrimStart('?');
            var rawPairs = new SortedList<string, string>(new VnPayCompare());
            foreach (var part in clean.Split('&', StringSplitOptions.RemoveEmptyEntries))
            {
                int eqIdx = part.IndexOf('=');
                if (eqIdx <= 0) continue;
                string k = part.Substring(0, eqIdx);
                string v = part.Substring(eqIdx + 1);
                if (k.StartsWith("vnp_", StringComparison.Ordinal) &&
                    !string.Equals(k, "vnp_SecureHash", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(k, "vnp_SecureHashType", StringComparison.OrdinalIgnoreCase) &&
                    !string.IsNullOrEmpty(v))
                {
                    rawPairs[k] = v;
                }
            }

            var sb = new StringBuilder();
            foreach (var kv in rawPairs)
            {
                sb.Append(kv.Key + "=" + kv.Value + "&");
            }
            if (sb.Length > 0)
            {
                sb.Remove(sb.Length - 1, 1);
            }

            string rawSignData = sb.ToString();
            if (string.Equals(HmacSha512(hashSecret, rawSignData), inputHash.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // Thử chuẩn hóa %20 -> '+' trên raw query string của trình duyệt
            string plusNormalized = rawSignData.Replace("%20", "+");
            return string.Equals(HmacSha512(hashSecret, plusNormalized), inputHash.Trim(), StringComparison.OrdinalIgnoreCase);
        }

        public static SortedList<string, string> CreateSortedParameters()
            => new SortedList<string, string>(new VnPayCompare());

        public static string HmacSha512(string key, string inputData)
        {
            var hash = new StringBuilder();
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }

        public static string MapResponseCodeMessage(string? responseCode)
        {
            return (responseCode ?? string.Empty).Trim() switch
            {
                "00" => "Giao dịch thanh toán VNPay thành công.",
                "07" => "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
                "09" => "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
                "10" => "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
                "11" => "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
                "12" => "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
                "13" => "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
                "24" => "Giao dịch không thành công do: Khách hàng đã hủy giao dịch thanh toán trên cổng VNPay.",
                "51" => "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
                "65" => "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
                "75" => "Ngân hàng thanh toán đang bảo trì.",
                "79" => "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
                _ => $"Giao dịch thanh toán VNPay không thành công (Mã lỗi: {responseCode ?? "UNKNOWN"})."
            };
        }
    }
}
