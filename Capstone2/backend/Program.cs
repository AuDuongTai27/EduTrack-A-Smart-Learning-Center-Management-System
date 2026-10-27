using Microsoft.EntityFrameworkCore;
using EduTrack.API.Helpers.DependencyInjection;
using EduTrack.API.Models.EF;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Pomelo MySQL Provider
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<EduTrackDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
    }
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Tránh vòng lặp tuần hoàn khi lấy quan hệ cha con
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Đăng ký Dependency Injection theo Bounded Context (Zero Merge Conflict)
builder.Services
    .AddCoreInfrastructure()
    .AddManagementServices()
    .AddTeachingServices()
    .AddLearningServices();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Tự động nạp dữ liệu mẫu (Sample Seed Data) khi khởi chạy ứng dụng
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<EduTrackDbContext>();
        await DbSeeder.SeedAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Đã xảy ra lỗi trong quá trình Seeding dữ liệu.");
    }
}

app.Run();
