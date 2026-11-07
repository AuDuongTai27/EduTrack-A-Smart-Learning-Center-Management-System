using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class AssignParentStudentDto
    {
        [Required(ErrorMessage = "ParentId là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn phụ huynh.")]
        public int ParentId { get; set; }

        [Required(ErrorMessage = "StudentId là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn học sinh.")]
        public int StudentId { get; set; }

        private string _relationship = "Mother";
        [Required(ErrorMessage = "Relationship là bắt buộc")]
        [StringLength(50)]
        public string Relationship
        {
            get => _relationship;
            set { _relationship = value; RelationshipSpecified = true; }
        }

        [System.Text.Json.Serialization.JsonIgnore]
        public bool RelationshipSpecified { get; private set; }

        public bool UpdateExisting { get; set; }

        private bool _isPrimaryContact = true;
        public bool IsPrimaryContact
        {
            get => _isPrimaryContact;
            set { _isPrimaryContact = value; PrimaryContactSpecified = true; }
        }

        [System.Text.Json.Serialization.JsonIgnore]
        public bool PrimaryContactSpecified { get; private set; }
    }
}
