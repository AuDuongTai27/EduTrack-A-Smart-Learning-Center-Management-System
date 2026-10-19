using System;

namespace EduTrack.API.Models.DTOs
{
    public class ProgressNoteDto
    {
        public int NoteId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public string StudentCode { get; set; } = null!;
        public int ClassId { get; set; }
        public string ClassName { get; set; } = null!;
        public int WrittenBy { get; set; }
        public string AuthorName { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string NoteType { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}
