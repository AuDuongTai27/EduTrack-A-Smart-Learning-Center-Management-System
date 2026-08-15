/**
 * EduTrack - Class Detail JavaScript Data & Renderer
 */

const CLASSES_DATA = [
  {
    id: 1,
    name: "Toán Nâng Cao",
    subject: "Toán",
    subjectClass: "subject-toan",
    grad: "linear-gradient(135deg, #1E40AF 0%, #2563EB 60%, #3B82F6 100%)",
    accent: "#2563EB",
    teacher: "Nguyễn Văn An",
    teacherInitials: "NA",
    schedule: "Thứ 2 - 4 - 6, 15:00 – 16:30",
    room: "P.201",
    email: "nv.an@edutrack.vn",
    phone: "0901 234 567",
    description: "Lớp Toán Nâng Cao tập trung vào các kỹ năng giải toán chuyên sâu, luyện đề thi học sinh giỏi cấp tỉnh và chuẩn bị thi đại học. Học sinh sẽ được tiếp cận các dạng bài khó, phát triển tư duy phân tích và sáng tạo.",
    studentCount: 12
  },
  {
    id: 2,
    name: "Vật Lý Cơ Bản",
    subject: "Vật Lý",
    subjectClass: "subject-vat-ly",
    grad: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #8B5CF6 100%)",
    accent: "#7C3AED",
    teacher: "Trần Thị Mai",
    teacherInitials: "TM",
    schedule: "Thứ 3 - 5, 17:00 – 18:30",
    room: "P.103",
    email: "tt.mai@edutrack.vn",
    phone: "0912 345 678",
    description: "Khóa học Vật Lý Cơ Bản cung cấp nền tảng vững chắc về cơ học, điện học và quang học. Học sinh được thực hành qua các bài tập thực nghiệm và giải thích hiện tượng vật lý trong đời sống.",
    studentCount: 9
  },
  {
    id: 3,
    name: "Tiếng Anh Giao Tiếp",
    subject: "Tiếng Anh",
    subjectClass: "subject-tieng-anh",
    grad: "linear-gradient(135deg, #065F46 0%, #059669 60%, #10B981 100%)",
    accent: "#059669",
    teacher: "Lê Hoàng Nam",
    teacherInitials: "LN",
    schedule: "Thứ 7, 09:00 – 11:00",
    room: "P.305",
    email: "lh.nam@edutrack.vn",
    phone: "0923 456 789",
    description: "Lớp Tiếng Anh Giao Tiếp tập trung phát triển kỹ năng nói và nghe theo phương pháp immersion. Học sinh được thực hành hội thoại thực tế, phát âm chuẩn và xây dựng vốn từ vựng đa dạng.",
    studentCount: 15
  },
  {
    id: 4,
    name: "Hóa Học 11",
    subject: "Hóa Học",
    subjectClass: "subject-hoa-hoc",
    grad: "linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)",
    accent: "#DC2626",
    teacher: "Phạm Thu Hà",
    teacherInitials: "PH",
    schedule: "Thứ 2 - 4, 16:00 – 17:30",
    room: "P.202",
    email: "pt.ha@edutrack.vn",
    phone: "0934 567 890",
    description: "Khóa Hóa Học 11 bám sát chương trình THPT với trọng tâm hóa hữu cơ và phản ứng oxi hóa khử. Học sinh làm bài tập trắc nghiệm, giải thích cơ chế phản ứng và luyện kỹ năng tính toán.",
    studentCount: 10
  },
  {
    id: 5,
    name: "Ngữ Văn Nâng Cao",
    subject: "Ngữ Văn",
    subjectClass: "subject-ngu-van",
    grad: "linear-gradient(135deg, #92400E 0%, #D97706 60%, #F59E0B 100%)",
    accent: "#D97706",
    teacher: "Đỗ Minh Khoa",
    teacherInitials: "ĐK",
    schedule: "Thứ 6, 14:00 – 16:00",
    room: "P.101",
    email: "dm.khoa@edutrack.vn",
    phone: "0945 678 901",
    description: "Lớp Ngữ Văn Nâng Cao rèn luyện kỹ năng đọc hiểu văn bản, phân tích tác phẩm và viết văn nghị luận. Học sinh được hướng dẫn xây dựng lập luận chặt chẽ và diễn đạt mạch lạc.",
    studentCount: 8
  },
  {
    id: 6,
    name: "Sinh Học Đại Cương",
    subject: "Sinh Học",
    subjectClass: "subject-sinh-hoc",
    grad: "linear-gradient(135deg, #164E63 0%, #0891B2 60%, #06B6D4 100%)",
    accent: "#0891B2",
    teacher: "Vũ Thị Lan",
    teacherInitials: "VL",
    schedule: "Thứ 3 - 5, 15:30 – 17:00",
    room: "P.204",
    email: "vt.lan@edutrack.vn",
    phone: "0956 789 012",
    description: "Sinh Học Đại Cương khám phá các khái niệm cốt lõi về tế bào, di truyền học và tiến hóa. Lớp học kết hợp lý thuyết với hình ảnh minh họa và sơ đồ tư duy giúp học sinh ghi nhớ hiệu quả.",
    studentCount: 11
  }
];

const MATERIALS_DATA = [
  // Toán Nâng Cao
  { id: 1, classId: 1, type: "PDF", fileName: "Lý thuyết Hàm số - Chương 1.pdf", description: "Tổng hợp lý thuyết hàm số bậc nhất và bậc hai", uploadDate: "10/07/2026", uploadedBy: "Nguyễn Văn An", sizeMb: 2.4 },
  { id: 2, classId: 1, type: "DOC", fileName: "Bài tập rèn luyện tháng 7.docx", description: "60 bài tập tổng hợp từ cơ bản đến nâng cao", uploadDate: "12/07/2026", uploadedBy: "Nguyễn Văn An", sizeMb: 1.1 },
  { id: 3, classId: 1, type: "PDF", fileName: "Đề thi thử - Lần 1.pdf", description: "Đề kiểm tra 45 phút, có đáp án và hướng dẫn giải", uploadDate: "20/07/2026", uploadedBy: "Nguyễn Văn An", sizeMb: 3.6 },
  { id: 4, classId: 1, type: "IMG", fileName: "Sơ đồ phân loại dạng bài.png", description: "Mindmap phân loại 12 dạng bài toán nâng cao", uploadDate: "25/07/2026", uploadedBy: "Nguyễn Văn An", sizeMb: 0.8 },

  // Vật Lý Cơ Bản
  { id: 5, classId: 2, type: "PDF", fileName: "Cơ học - Lý thuyết cơ bản.pdf", description: "Tổng hợp công thức và định luật cơ học", uploadDate: "08/07/2026", uploadedBy: "Trần Thị Mai", sizeMb: 1.9 },
  { id: 6, classId: 2, type: "DOC", fileName: "Bài tập điện học.docx", description: "Bài tập về mạch điện, tụ điện và điện trở", uploadDate: "15/07/2026", uploadedBy: "Trần Thị Mai", sizeMb: 0.9 },
  { id: 7, classId: 2, type: "PPT", fileName: "Slide quang học - buổi 5.pptx", description: "Thấu kính, gương cầu và hiện tượng khúc xạ", uploadDate: "22/07/2026", uploadedBy: "Trần Thị Mai", sizeMb: 5.2 },

  // Tiếng Anh Giao Tiếp
  { id: 8, classId: 3, type: "PDF", fileName: "Vocabulary Unit 3 - Travel.pdf", description: "200 từ vựng chủ đề du lịch và giao tiếp hằng ngày", uploadDate: "05/07/2026", uploadedBy: "Lê Hoàng Nam", sizeMb: 1.3 },
  { id: 9, classId: 3, type: "DOC", fileName: "Conversation Scripts - Week 2.docx", description: "Các đoạn hội thoại mẫu để luyện nói theo cặp", uploadDate: "12/07/2026", uploadedBy: "Lê Hoàng Nam", sizeMb: 0.6 },
  { id: 10, classId: 3, type: "IMG", fileName: "Pronunciation Chart - IPA.png", description: "Bảng phiên âm IPA đầy đủ với ví dụ minh họa", uploadDate: "19/07/2026", uploadedBy: "Lê Hoàng Nam", sizeMb: 0.4 },

  // Hóa Học 11
  { id: 11, classId: 4, type: "PDF", fileName: "Hóa hữu cơ - Alkane & Alkene.pdf", description: "Phân loại, tính chất và phản ứng của hidrocacbon", uploadDate: "09/07/2026", uploadedBy: "Phạm Thu Hà", sizeMb: 2.1 },
  { id: 12, classId: 4, type: "DOC", fileName: "Bài tập phản ứng oxi hóa khử.docx", description: "40 bài tập cân bằng phương trình và tính toán", uploadDate: "16/07/2026", uploadedBy: "Phạm Thu Hà", sizeMb: 1.0 },
  { id: 13, classId: 4, type: "PPT", fileName: "Slide thí nghiệm hóa học.pptx", description: "Video và hình ảnh các phản ứng thực nghiệm", uploadDate: "24/07/2026", uploadedBy: "Phạm Thu Hà", sizeMb: 8.4 },

  // Ngữ Văn Nâng Cao
  { id: 14, classId: 5, type: "PDF", fileName: "Phân tích Truyện Kiều - Trích đoạn.pdf", description: "Phân tích chi tiết các đoạn trích quan trọng", uploadDate: "07/07/2026", uploadedBy: "Đỗ Minh Khoa", sizeMb: 2.7 },
  { id: 15, classId: 5, type: "DOC", fileName: "Đề cương nghị luận xã hội.docx", description: "Dàn ý 15 chủ đề nghị luận thường gặp trong đề thi", uploadDate: "18/07/2026", uploadedBy: "Đỗ Minh Khoa", sizeMb: 0.7 },

  // Sinh Học Đại Cương
  { id: 16, classId: 6, type: "PDF", fileName: "Tế bào học - Cấu trúc và chức năng.pdf", description: "Lý thuyết tế bào nhân thực, nhân sơ và màng tế bào", uploadDate: "06/07/2026", uploadedBy: "Vũ Thị Lan", sizeMb: 3.2 },
  { id: 17, classId: 6, type: "IMG", fileName: "Sơ đồ phân bào - Mitosis.png", description: "Hình ảnh chi tiết các giai đoạn nguyên phân", uploadDate: "14/07/2026", uploadedBy: "Vũ Thị Lan", sizeMb: 1.1 },
  { id: 18, classId: 6, type: "DOC", fileName: "Bài tập di truyền học Mendel.docx", description: "Bài tập lai một cặp tính trạng và hai cặp tính trạng", uploadDate: "21/07/2026", uploadedBy: "Vũ Thị Lan", sizeMb: 0.9 }
];

const ASSIGNMENTS_DATA = [
  // Toán Nâng Cao
  { id: 1, classId: 1, title: "Bài tập Hàm số - Tuần 3", dueDate: "16/08/2026", status: "Chưa nộp" },
  { id: 2, classId: 1, title: "Kiểm tra 15 phút - Đạo hàm", dueDate: "10/08/2026", status: "Đã nộp" },
  { id: 3, classId: 1, title: "Bài tập về nhà - Bất phương trình", dueDate: "05/08/2026", status: "Đã nộp" },
  { id: 4, classId: 1, title: "Ôn tập chương 2 - Lượng giác", dueDate: "28/07/2026", status: "Quá hạn" },

  // Vật Lý Cơ Bản
  { id: 5, classId: 2, title: "Bài tập Cơ học - Tuần 4", dueDate: "17/08/2026", status: "Chưa nộp" },
  { id: 6, classId: 2, title: "Bài thực hành đo vận tốc", dueDate: "09/08/2026", status: "Đã nộp" },
  { id: 7, classId: 2, title: "Bài tập điện học nâng cao", dueDate: "02/08/2026", status: "Quá hạn" },

  // Tiếng Anh Giao Tiếp
  { id: 8, classId: 3, title: "Speaking Practice - Topic: Hobbies", dueDate: "16/08/2026", status: "Chưa nộp" },
  { id: 9, classId: 3, title: "Vocabulary Quiz - Unit 3", dueDate: "09/08/2026", status: "Đã nộp" },
  { id: 10, classId: 3, title: "Listening Exercise - BBC Learning", dueDate: "03/08/2026", status: "Đã nộp" },

  // Hóa Học 11
  { id: 11, classId: 4, title: "Bài tập Hidrocacbon - Tổng hợp", dueDate: "15/08/2026", status: "Chưa nộp" },
  { id: 12, classId: 4, title: "Cân bằng phương trình oxi hóa khử", dueDate: "08/08/2026", status: "Đã nộp" },
  { id: 13, classId: 4, title: "Bài kiểm tra viết - 45 phút", dueDate: "29/07/2026", status: "Quá hạn" },

  // Ngữ Văn Nâng Cao
  { id: 14, classId: 5, title: "Viết văn nghị luận - Chủ đề tự chọn", dueDate: "15/08/2026", status: "Chưa nộp" },
  { id: 15, classId: 5, title: "Phân tích đoạn thơ - Xuân Diệu", dueDate: "07/08/2026", status: "Đã nộp" },

  // Sinh Học Đại Cương
  { id: 16, classId: 6, title: "Bài tập di truyền - Tuần 5", dueDate: "14/08/2026", status: "Chưa nộp" },
  { id: 17, classId: 6, title: "Sơ đồ tư duy - Tế bào học", dueDate: "07/08/2026", status: "Đã nộp" },
  { id: 18, classId: 6, title: "Bài tập nguyên phân & giảm phân", dueDate: "30/07/2026", status: "Quá hạn" }
];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Get Class ID from URL (default to 1)
  const urlParams = new URLSearchParams(window.location.search);
  let classId = parseInt(urlParams.get('id'), 10);
  if (!classId || isNaN(classId) || classId < 1 || classId > 6) {
    classId = 1;
  }

  const cls = CLASSES_DATA.find(c => c.id === classId) || CLASSES_DATA[0];
  const materials = MATERIALS_DATA.filter(m => m.classId === cls.id);
  const assignments = ASSIGNMENTS_DATA.filter(a => a.classId === cls.id);

  // 2. Set Page Title & Theme Class
  document.title = `${cls.name} – EduTrack`;
  const container = document.getElementById('classDetailApp');
  if (container) {
    container.className = `app-container ${cls.subjectClass}`;
  }

  // 3. Render Hero Banner
  const heroBanner = document.getElementById('heroBanner');
  if (heroBanner) {
    heroBanner.style.background = cls.grad;
  }

  const breadcrumbClass = document.getElementById('breadcrumbClass');
  if (breadcrumbClass) breadcrumbClass.textContent = cls.name;

  const heroSubject = document.getElementById('heroSubject');
  if (heroSubject) heroSubject.textContent = cls.subject;

  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) heroTitle.textContent = `${cls.name} – ${cls.subject}`;

  const heroMeta = document.getElementById('heroMeta');
  if (heroMeta) {
    heroMeta.innerHTML = `
      <span>Giáo viên: <strong>${cls.teacher}</strong></span>
      <span class="opacity-50">·</span>
      <span>Phòng ${cls.room}</span>
    `;
  }

  const statStudents = document.getElementById('statStudents');
  if (statStudents) statStudents.textContent = cls.studentCount;

  const statMaterials = document.getElementById('statMaterials');
  if (statMaterials) statMaterials.textContent = materials.length;

  const statAssignments = document.getElementById('statAssignments');
  if (statAssignments) statAssignments.textContent = assignments.length;

  // 4. Render Class Info Card
  const teacherAvatar = document.getElementById('teacherAvatar');
  if (teacherAvatar) {
    teacherAvatar.textContent = cls.teacherInitials;
    teacherAvatar.style.background = cls.grad;
  }

  const teacherName = document.getElementById('teacherName');
  if (teacherName) teacherName.textContent = cls.teacher;

  const teacherEmail = document.getElementById('teacherEmail');
  if (teacherEmail) teacherEmail.textContent = cls.email;

  const teacherPhone = document.getElementById('teacherPhone');
  if (teacherPhone) teacherPhone.textContent = cls.phone;

  const classSchedule = document.getElementById('classSchedule');
  if (classSchedule) classSchedule.textContent = cls.schedule;

  const classRoom = document.getElementById('classRoom');
  if (classRoom) classRoom.textContent = `Phòng ${cls.room}`;

  const classStudentCount = document.getElementById('classStudentCount');
  if (classStudentCount) classStudentCount.textContent = `${cls.studentCount} học sinh`;

  const classDesc = document.getElementById('classDesc');
  if (classDesc) classDesc.textContent = cls.description;

  // 5. Render Materials Section
  const materialsCountBadge = document.getElementById('materialsCountBadge');
  if (materialsCountBadge) materialsCountBadge.textContent = `${materials.length} tài liệu`;

  const materialsList = document.getElementById('materialsList');
  if (materialsList) {
    materialsList.innerHTML = materials.map(mat => {
      let tagClass = 'file-tag-pdf';
      let icon = 'bi-file-earmark-text';
      if (mat.type === 'DOC') { tagClass = 'file-tag-doc'; icon = 'bi-file-earmark-word'; }
      else if (mat.type === 'PPT') { tagClass = 'file-tag-ppt'; icon = 'bi-file-earmark-slides'; }
      else if (mat.type === 'IMG') { tagClass = 'file-tag-img'; icon = 'bi-file-earmark-image'; }

      return `
        <div class="material-row">
          <div class="file-type-tag ${tagClass}">
            <i class="bi ${icon}"></i>
            <span>${mat.type}</span>
          </div>
          <div class="material-details">
            <h4 class="material-filename" title="${mat.fileName}">${mat.fileName}</h4>
            <p class="material-desc">${mat.description}</p>
          </div>
          <div class="material-meta">
            <p class="material-date">${mat.uploadDate}</p>
            <p class="material-uploader">bởi ${mat.uploadedBy} · ${mat.sizeMb} MB</p>
          </div>
          <a href="#" class="btn-download-mat" onclick="alert('Đang tải xuống tài liệu: ${mat.fileName}'); return false;">
            <i class="bi bi-download"></i>
            <span>Tải xuống</span>
          </a>
        </div>
      `;
    }).join('');
  }

  // 6. Render Assignments Section
  const assignmentsCountBadge = document.getElementById('assignmentsCountBadge');
  if (assignmentsCountBadge) assignmentsCountBadge.textContent = `${assignments.length} bài`;

  const asgCounts = {
    submitted: assignments.filter(a => a.status === "Đã nộp").length,
    pending: assignments.filter(a => a.status === "Chưa nộp").length,
    overdue: assignments.filter(a => a.status === "Quá hạn").length
  };

  const asgSummaryBadges = document.getElementById('asgSummaryBadges');
  if (asgSummaryBadges) {
    asgSummaryBadges.innerHTML = `
      <span class="asg-status-badge asg-status-danop">${asgCounts.submitted} Đã nộp</span>
      <span class="asg-status-badge asg-status-chuanop">${asgCounts.pending} Chưa nộp</span>
      <span class="asg-status-badge asg-status-quahan">${asgCounts.overdue} Quá hạn</span>
    `;
  }

  const assignmentsList = document.getElementById('assignmentsList');
  if (assignmentsList) {
    assignmentsList.innerHTML = assignments.map(asg => {
      let statusClass = 'asg-status-chuanop';
      let icon = 'bi-exclamation-triangle';
      let iconBoxStyle = 'background-color: #FFFBEB; color: #B45309; border: 1px solid #FDE68A;';

      if (asg.status === 'Đã nộp') {
        statusClass = 'asg-status-danop';
        icon = 'bi-check-circle';
        iconBoxStyle = 'background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0;';
      } else if (asg.status === 'Quá hạn') {
        statusClass = 'asg-status-quahan';
        icon = 'bi-x-circle';
        iconBoxStyle = 'background-color: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA;';
      }

      return `
        <a href="assignment-detail.html?id=${asg.id}" class="assignment-row" title="Xem chi tiết bài tập ${asg.title}">
          <div class="asg-icon-box" style="${iconBoxStyle}">
            <i class="bi bi-clipboard-check"></i>
          </div>
          <div class="asg-details">
            <h4 class="asg-title">${asg.title}</h4>
            <div class="asg-due">
              <i class="bi bi-clock"></i>
              <span>Hạn nộp: ${asg.dueDate}</span>
            </div>
          </div>
          <span class="asg-status-badge ${statusClass}">
            <i class="bi ${icon}"></i>
            <span>${asg.status}</span>
          </span>
          <i class="bi bi-chevron-right asg-chevron"></i>
        </a>
      `;
    }).join('');
  }
});
