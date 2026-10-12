using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;

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

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Tránh vòng lặp tuần hoàn khi lấy quan hệ cha con
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
