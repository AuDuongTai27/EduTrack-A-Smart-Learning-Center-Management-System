using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using EduTrack.API.Models.DTOs.Auth;

namespace EduTrack.API.Helpers.Auth
{
    public static class JwtAuthHelper
    {
        public const string LegacySeededHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h";
        public const string DefaultSeedPassword = "123456";
        private const string DefaultJwtSecret = "EduTrack_Smart_Learning_Center_Jwt_Secret_Key_2026_Capstone2!";

        public static string GetSecretKey(IConfiguration? configuration = null)
        {
            var configured = configuration?["Jwt:SecretKey"];
            return string.IsNullOrWhiteSpace(configured) ? DefaultJwtSecret : configured;
        }

        public static string NormalizePhone(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
            var trimmed = raw.Trim();
            var sb = new StringBuilder(trimmed.Length);
            foreach (var ch in trimmed)
            {
                if (char.IsDigit(ch) || (ch == '+' && sb.Length == 0))
                {
                    sb.Append(ch);
                }
            }

            var cleaned = sb.ToString();
            if (cleaned.StartsWith("+84") && cleaned.Length >= 11)
            {
                return "0" + cleaned.Substring(3);
            }
            if (cleaned.StartsWith("84") && cleaned.Length == 11)
            {
                return "0" + cleaned.Substring(2);
            }
            return cleaned;
        }

        public static string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(16);
            var hash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password.Trim()),
                salt,
                10000,
                HashAlgorithmName.SHA256,
                32);
            return $"pbkdf2${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
        }

        public static bool VerifyPassword(string inputPassword, string? storedHash)
        {
            if (string.IsNullOrWhiteSpace(inputPassword) || string.IsNullOrWhiteSpace(storedHash))
            {
                return false;
            }

            var pwd = inputPassword.Trim();

            // 1. Hỗ trợ tài khoản Seed / Mặc định trong DB
            if (storedHash == LegacySeededHash)
            {
                return pwd == DefaultSeedPassword;
            }

            // 2. Hỗ trợ PBKDF2 hash
            if (storedHash.StartsWith("pbkdf2$", StringComparison.Ordinal))
            {
                var parts = storedHash.Split('$');
                if (parts.Length == 3)
                {
                    try
                    {
                        var salt = Convert.FromBase64String(parts[1]);
                        var expectedHash = Convert.FromBase64String(parts[2]);
                        var actualHash = Rfc2898DeriveBytes.Pbkdf2(
                            Encoding.UTF8.GetBytes(pwd),
                            salt,
                            10000,
                            HashAlgorithmName.SHA256,
                            expectedHash.Length);
                        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
                    }
                    catch
                    {
                        return false;
                    }
                }
            }

            // 3. Hỗ trợ trường hợp đổi mật khẩu lưu trực tiếp chuỗi
            return string.Equals(pwd, storedHash.Trim(), StringComparison.Ordinal);
        }

        public static string NormalizeRoleName(string role)
        {
            var r = (role ?? string.Empty).Trim().ToLowerInvariant();
            return r == "ta" ? "teaching_assistant" : r;
        }

        public static string ResolvePrimaryRole(IEnumerable<string> roles)
        {
            var normalized = roles.Select(NormalizeRoleName).Where(r => !string.IsNullOrEmpty(r)).Distinct().ToList();
            string[] priority =
            {
                "center_manager",
                "admin_staff",
                "teacher",
                "teaching_assistant",
                "parent",
                "student"
            };

            foreach (var p in priority)
            {
                if (normalized.Contains(p)) return p;
            }

            return normalized.FirstOrDefault() ?? "student";
        }

        public static string ResolveRedirectPath(string primaryRole)
        {
            return NormalizeRoleName(primaryRole) switch
            {
                "center_manager" => "/center-manager/dashboard",
                "admin_staff" => "/admin-staff/dashboard",
                "teacher" => "/teacher/dashboard",
                "teaching_assistant" => "/teaching-assistant/dashboard",
                "parent" => "/parent/dashboard",
                "student" => "/student/dashboard",
                _ => "/student/dashboard"
            };
        }

        public static string GenerateToken(AuthUserDto user, string? secretKey = null)
        {
            var key = string.IsNullOrWhiteSpace(secretKey) ? DefaultJwtSecret : secretKey;
            var headerJson = JsonSerializer.Serialize(new { alg = "HS256", typ = "JWT" });
            var exp = DateTimeOffset.UtcNow.AddDays(7).ToUnixTimeSeconds();
            var iat = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            var payloadJson = JsonSerializer.Serialize(new
            {
                sub = user.UserId.ToString(),
                userId = user.UserId,
                userCode = user.UserCode,
                fullName = user.FullName,
                email = user.Email ?? string.Empty,
                phone = user.Phone ?? string.Empty,
                role = user.PrimaryRole,
                roles = user.Roles,
                iat,
                exp
            });

            var headerSegment = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
            var payloadSegment = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
            var signingInput = $"{headerSegment}.{payloadSegment}";
            var signatureSegment = ComputeSignature(signingInput, key);

            return $"{signingInput}.{signatureSegment}";
        }

        public static ClaimsPrincipal? ValidateToken(string token, string? secretKey = null)
        {
            if (string.IsNullOrWhiteSpace(token)) return null;
            var parts = token.Trim().Split('.');
            if (parts.Length != 3) return null;

            var key = string.IsNullOrWhiteSpace(secretKey) ? DefaultJwtSecret : secretKey;
            var signingInput = $"{parts[0]}.{parts[1]}";
            var expectedSig = ComputeSignature(signingInput, key);

            if (!CryptographicOperations.FixedTimeEquals(
                Encoding.ASCII.GetBytes(parts[2]),
                Encoding.ASCII.GetBytes(expectedSig)))
            {
                return null;
            }

            try
            {
                var payloadBytes = Base64UrlDecode(parts[1]);
                using var doc = JsonDocument.Parse(payloadBytes);
                var root = doc.RootElement;

                if (root.TryGetProperty("exp", out var expEl) && expEl.TryGetInt64(out var exp))
                {
                    if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > exp)
                    {
                        return null;
                    }
                }

                var claims = new List<Claim>();

                if (root.TryGetProperty("userId", out var userIdEl) && userIdEl.TryGetInt32(out var userId))
                {
                    claims.Add(new Claim(ClaimTypes.NameIdentifier, userId.ToString()));
                    claims.Add(new Claim("userId", userId.ToString()));
                }
                else if (root.TryGetProperty("sub", out var subEl) && subEl.GetString() is string sub)
                {
                    claims.Add(new Claim(ClaimTypes.NameIdentifier, sub));
                    claims.Add(new Claim("userId", sub));
                }

                if (root.TryGetProperty("userCode", out var codeEl) && codeEl.GetString() is string userCode)
                {
                    claims.Add(new Claim("userCode", userCode));
                }

                if (root.TryGetProperty("fullName", out var nameEl) && nameEl.GetString() is string fullName)
                {
                    claims.Add(new Claim(ClaimTypes.Name, fullName));
                }

                if (root.TryGetProperty("email", out var emailEl) && emailEl.GetString() is string email && !string.IsNullOrEmpty(email))
                {
                    claims.Add(new Claim(ClaimTypes.Email, email));
                }

                if (root.TryGetProperty("phone", out var phoneEl) && phoneEl.GetString() is string phone && !string.IsNullOrEmpty(phone))
                {
                    claims.Add(new Claim(ClaimTypes.MobilePhone, phone));
                }

                var addedRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                if (root.TryGetProperty("role", out var roleEl) && roleEl.GetString() is string primaryRole && !string.IsNullOrEmpty(primaryRole))
                {
                    var norm = NormalizeRoleName(primaryRole);
                    claims.Add(new Claim(ClaimTypes.Role, norm));
                    addedRoles.Add(norm);
                }

                if (root.TryGetProperty("roles", out var rolesEl) && rolesEl.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in rolesEl.EnumerateArray())
                    {
                        var r = item.GetString();
                        if (!string.IsNullOrWhiteSpace(r))
                        {
                            var norm = NormalizeRoleName(r);
                            if (addedRoles.Add(norm))
                            {
                                claims.Add(new Claim(ClaimTypes.Role, norm));
                            }
                        }
                    }
                }

                var identity = new ClaimsIdentity(claims, "Bearer");
                return new ClaimsPrincipal(identity);
            }
            catch
            {
                return null;
            }
        }

        private static string ComputeSignature(string signingInput, string secretKey)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(signingInput));
            return Base64UrlEncode(hash);
        }

        private static string Base64UrlEncode(byte[] bytes)
        {
            return Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private static byte[] Base64UrlDecode(string input)
        {
            var padded = input.Replace('-', '+').Replace('_', '/');
            switch (padded.Length % 4)
            {
                case 2: padded += "=="; break;
                case 3: padded += "="; break;
            }
            return Convert.FromBase64String(padded);
        }
    }

    public class JwtAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        private readonly IConfiguration _configuration;

        public JwtAuthenticationHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            IConfiguration configuration)
            : base(options, logger, encoder)
        {
            _configuration = configuration;
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.TryGetValue("Authorization", out var authHeaderValues))
            {
                return Task.FromResult(AuthenticateResult.NoResult());
            }

            var authHeader = authHeaderValues.FirstOrDefault();
            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return Task.FromResult(AuthenticateResult.NoResult());
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var principal = JwtAuthHelper.ValidateToken(token, JwtAuthHelper.GetSecretKey(_configuration));
            if (principal == null)
            {
                return Task.FromResult(AuthenticateResult.Fail("Token đăng nhập không hợp lệ hoặc đã hết hạn."));
            }

            var ticket = new AuthenticationTicket(principal, Scheme.Name);
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
