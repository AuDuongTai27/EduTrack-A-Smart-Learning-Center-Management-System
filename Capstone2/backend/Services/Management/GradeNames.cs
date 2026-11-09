using System.Text;
using System.Text.RegularExpressions;

namespace EduTrack.API.Services.Management;

public static class GradeNames
{
    public static string Normalize(string? value) =>
        Regex.Replace((value ?? "").Normalize(NormalizationForm.FormKC), @"\s+", " ").Trim();

    public static string RequireValid(string? value)
    {
        var name = Normalize(value);
        if (name.Length == 0 || name.Length > 50 || name.Any(char.IsControl))
            throw new ArgumentException("Tên khối lớp là bắt buộc, tối đa 50 ký tự và không chứa ký tự điều khiển.");
        return name;
    }
}
