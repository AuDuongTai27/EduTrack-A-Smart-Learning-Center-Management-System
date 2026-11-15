using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using EduTrack.API.Helpers.Auth;
using EduTrack.API.Helpers.DependencyInjection;
using EduTrack.API.Models.EF;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Pomelo MySQL Provider
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<EduTrackDbContext, EduTrackRuntimeDbContext>(options =>
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

builder.Services
    .AddAuthentication("Bearer")
    .AddScheme<AuthenticationSchemeOptions, JwtAuthenticationHandler>("Bearer", null);

builder.Services.AddAuthorization();

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
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EduTrack API",
        Version = "v1",
        Description = "Hệ thống quản lý trung tâm học tập thông minh EduTrack. Gọi POST /api/auth/login để lấy token, sau đó bấm nút Authorize (Bearer) để lưu token."
    });

    var bearerScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Nhập JWT Token lấy từ API `/api/auth/login` (chỉ cần dán chuỗi token, không cần gõ chữ Bearer).",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    options.AddSecurityDefinition("Bearer", bearerScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { bearerScheme, Array.Empty<string>() }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        // Lưu giữ Bearer Token trên Swagger UI kể cả khi F5 tải lại trang
        options.EnablePersistAuthorization();

        // Tự động nhận diện và lưu Bearer Token ngay khi gọi POST /api/auth/login thành công trên Swagger
        options.UseResponseInterceptor(
            "(res) => { try { if (res && res.url && res.url.includes('/api/auth/login') && res.status === 200 && res.body && res.body.token && window.ui) { window.ui.preauthorizeApiKey('Bearer', res.body.token); } } catch (e) {} return res; }"
        );
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseStaticFiles();

app.UseAuthentication();
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
