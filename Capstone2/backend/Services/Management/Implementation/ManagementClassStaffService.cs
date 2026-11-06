using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Services.Management.Implementation
{
    public class ManagementClassStaffService : IManagementClassStaffService
    {
        private readonly IClassRepository _classes;
        private readonly IUserRepository _users;
        private readonly ITeacherClassRepository _teachers;
        private readonly ITaClassRepository _assistants;

        public ManagementClassStaffService(IClassRepository classes, IUserRepository users,
            ITeacherClassRepository teachers, ITaClassRepository assistants)
        {
            _classes = classes;
            _users = users;
            _teachers = teachers;
            _assistants = assistants;
        }

        private async Task<(Class Class, User User)> ValidateAsync(int classId, int userId, string role)
        {
            if (classId <= 0 || userId <= 0) throw new ArgumentException("Mã lớp hoặc tài khoản không hợp lệ.");
            var item = await _classes.GetByIdAsync(classId)
                ?? throw new KeyNotFoundException("Không tìm thấy lớp học. Vui lòng tải lại danh sách.");
            var user = await _users.GetByIdAsync(userId)
                ?? throw new ArgumentException("Tài khoản đã chọn không tồn tại.");
            if (!string.Equals(user.Status, "active", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Chỉ phân công tài khoản đang hoạt động.");
            if (!user.UserRoles.Any(link => string.Equals(link.Role?.RoleName, role, StringComparison.OrdinalIgnoreCase)))
                throw new ArgumentException(role == "teacher" ? "Tài khoản đã chọn không phải giáo viên." : "Tài khoản đã chọn không phải trợ giảng.");
            return (item, user);
        }

        public async Task<TeacherClassDto> AssignTeacherAsync(int classId, int userId)
        {
            var (item, user) = await ValidateAsync(classId, userId, "teacher");
            var assignment = await _teachers.FindAssignmentAsync(classId, userId);
            if (string.Equals(assignment?.Status, "active", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Giáo viên này đã được phân công vào lớp.");
            if (assignment == null)
                assignment = await _teachers.AddAsync(new TeacherClass {ClassId = classId, TeacherId = userId});
            else
            {
                assignment.Status = "active";
                assignment.AssignedAt = DateTime.UtcNow;
                assignment = await _teachers.UpdateAsync(assignment);
            }
            return new TeacherClassDto {TeacherClassId = assignment.TeacherClassId, ClassId = classId,
                ClassName = item.ClassName, TeacherId = userId, TeacherName = user.FullName, TeacherCode = user.UserCode,
                AssignedAt = assignment.AssignedAt, Status = assignment.Status};
        }

        public async Task<TaClassDto> AssignAssistantAsync(int classId, int userId)
        {
            var (item, user) = await ValidateAsync(classId, userId, "teaching_assistant");
            var assignment = await _assistants.FindAssignmentAsync(classId, userId);
            if (string.Equals(assignment?.Status, "active", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Trợ giảng này đã được phân công vào lớp.");
            if (assignment == null)
                assignment = await _assistants.AddAsync(new TaClass {ClassId = classId, TaId = userId});
            else
            {
                assignment.Status = "active";
                assignment.AssignedAt = DateTime.UtcNow;
                assignment = await _assistants.UpdateAsync(assignment);
            }
            return new TaClassDto {TaClassId = assignment.TaClassId, ClassId = classId, ClassName = item.ClassName,
                TaId = userId, TaName = user.FullName, TaCode = user.UserCode, AssignedAt = assignment.AssignedAt, Status = assignment.Status};
        }

        public async Task<TeacherClassDto> DeactivateTeacherAsync(int classId, int assignmentId)
        {
            if (classId <= 0 || assignmentId <= 0) throw new ArgumentException("Mã lớp hoặc phân công không hợp lệ.");
            var assignment = await _teachers.DeactivateAsync(classId, assignmentId)
                ?? throw new KeyNotFoundException("Không tìm thấy phân công giáo viên trong lớp này. Vui lòng tải lại.");
            return new TeacherClassDto {TeacherClassId = assignment.TeacherClassId, ClassId = assignment.ClassId,
                ClassName = assignment.Class?.ClassName ?? string.Empty, TeacherId = assignment.TeacherId,
                TeacherName = assignment.Teacher?.FullName ?? string.Empty, TeacherCode = assignment.Teacher?.UserCode ?? string.Empty,
                AssignedAt = assignment.AssignedAt, Status = assignment.Status};
        }

        public async Task<TaClassDto> DeactivateAssistantAsync(int classId, int assignmentId)
        {
            if (classId <= 0 || assignmentId <= 0) throw new ArgumentException("Mã lớp hoặc phân công không hợp lệ.");
            var assignment = await _assistants.DeactivateAsync(classId, assignmentId)
                ?? throw new KeyNotFoundException("Không tìm thấy phân công trợ giảng trong lớp này. Vui lòng tải lại.");
            return new TaClassDto {TaClassId = assignment.TaClassId, ClassId = assignment.ClassId,
                ClassName = assignment.Class?.ClassName ?? string.Empty, TaId = assignment.TaId,
                TaName = assignment.Ta?.FullName ?? string.Empty, TaCode = assignment.Ta?.UserCode ?? string.Empty,
                AssignedAt = assignment.AssignedAt, Status = assignment.Status};
        }
    }
}
