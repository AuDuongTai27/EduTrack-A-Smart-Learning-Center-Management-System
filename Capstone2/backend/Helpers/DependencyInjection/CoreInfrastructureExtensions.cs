using Microsoft.Extensions.DependencyInjection;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Repositories.Implementation;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Implementation;

namespace EduTrack.API.Helpers.DependencyInjection
{
    /// <summary>
    /// Đăng ký toàn bộ Repositories và Shared Services nền tảng (Core Infrastructure)
    /// </summary>
    public static class CoreInfrastructureExtensions
    {
        public static IServiceCollection AddCoreInfrastructure(this IServiceCollection services)
        {
            // 1. Generic Repository dùng chung cho toàn bộ Entity
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

            // 2. Specific Repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUserRoleRepository, UserRoleRepository>();
            services.AddScoped<ISubjectRepository, SubjectRepository>();
            services.AddScoped<IClassRepository, ClassRepository>();
            services.AddScoped<ITeacherClassRepository, TeacherClassRepository>();
            services.AddScoped<ITaClassRepository, TaClassRepository>();
            services.AddScoped<IStudentClassRepository, StudentClassRepository>();
            services.AddScoped<IClassScheduleRepository, ClassScheduleRepository>();
            services.AddScoped<IClassSessionRepository, ClassSessionRepository>();
            services.AddScoped<IContentUnitRepository, ContentUnitRepository>();
            services.AddScoped<IAttendanceRepository, AttendanceRepository>();
            services.AddScoped<IAssignmentRepository, AssignmentRepository>();
            services.AddScoped<ISubmissionRepository, SubmissionRepository>();
            services.AddScoped<IAiEvaluationRepository, AiEvaluationRepository>();
            services.AddScoped<IProgressNoteRepository, ProgressNoteRepository>();
            services.AddScoped<ITuitionInvoiceRepository, TuitionInvoiceRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();
            services.AddScoped<IApprovalRequestRepository, ApprovalRequestRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IParentStudentRepository, ParentStudentRepository>();
            services.AddScoped<ICenterSettingRepository, CenterSettingRepository>();

            // 3. Base Application Services (Shared Queries & Domain Services)
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IRoleService, RoleService>();
            services.AddScoped<IUserRoleService, UserRoleService>();
            services.AddScoped<ISubjectService, SubjectService>();
            services.AddScoped<IClassService, ClassService>();
            services.AddScoped<ITeacherClassService, TeacherClassService>();
            services.AddScoped<ITaClassService, TaClassService>();
            services.AddScoped<IStudentClassService, StudentClassService>();
            services.AddScoped<IClassScheduleService, ClassScheduleService>();
            services.AddScoped<IClassSessionService, ClassSessionService>();
            services.AddScoped<IContentUnitService, ContentUnitService>();
            services.AddScoped<IAttendanceService, AttendanceService>();
            services.AddScoped<IAssignmentService, AssignmentService>();
            services.AddScoped<ISubmissionService, SubmissionService>();
            services.AddScoped<IAiEvaluationService, AiEvaluationService>();
            services.AddScoped<IProgressNoteService, ProgressNoteService>();
            services.AddScoped<ITuitionInvoiceService, TuitionInvoiceService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IApprovalRequestService, ApprovalRequestService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IParentStudentService, ParentStudentService>();
            services.AddScoped<ICenterSettingService, CenterSettingService>();

            return services;
        }
    }
}
