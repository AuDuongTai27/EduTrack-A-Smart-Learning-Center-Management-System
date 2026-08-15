/**
 * EduTrack - Assignment Detail JavaScript Controller
 */

// Sample assignments database matching class assignments
const ASSIGNMENTS_DB = {
  1: { title: "Bài tập Hàm số - Tuần 3", class: "Toán Nâng Cao — Lớp 11", dueDate: "16/08/2026", defaultStatus: "not-submitted", classId: 1 },
  2: { title: "Kiểm tra 15 phút - Đạo hàm", class: "Toán Nâng Cao — Lớp 11", dueDate: "10/08/2026", defaultStatus: "submitted", classId: 1, score: "9.0 / 10" },
  3: { title: "Bài tập về nhà - Bất phương trình", class: "Toán Nâng Cao — Lớp 11", dueDate: "05/08/2026", defaultStatus: "submitted", classId: 1, score: "8.5 / 10" },
  4: { title: "Ôn tập chương 2 - Lượng giác", class: "Toán Nâng Cao — Lớp 11", dueDate: "28/07/2026", defaultStatus: "overdue", classId: 1 },
  5: { title: "Bài tập Cơ học - Tuần 4", class: "Vật Lý Cơ Bản — Lớp 11", dueDate: "17/08/2026", defaultStatus: "not-submitted", classId: 2 },
  6: { title: "Bài thực hành đo vận tốc", class: "Vật Lý Cơ Bản — Lớp 11", dueDate: "09/08/2026", defaultStatus: "submitted", classId: 2, score: "8.0 / 10" },
  7: { title: "Bài tập điện học nâng cao", class: "Vật Lý Cơ Bản — Lớp 11", dueDate: "02/08/2026", defaultStatus: "overdue", classId: 2 },
  8: { title: "Speaking Practice - Topic: Hobbies", class: "Tiếng Anh Giao Tiếp — Lớp 11", dueDate: "16/08/2026", defaultStatus: "not-submitted", classId: 3 },
  9: { title: "Vocabulary Quiz - Unit 3", class: "Tiếng Anh Giao Tiếp — Lớp 11", dueDate: "09/08/2026", defaultStatus: "submitted", classId: 3, score: "9.5 / 10" },
  10: { title: "Listening Exercise - BBC Learning", class: "Tiếng Anh Giao Tiếp — Lớp 11", dueDate: "03/08/2026", defaultStatus: "submitted", classId: 3, score: "8.5 / 10" },
  11: { title: "Bài tập Hidrocacbon - Tổng hợp", class: "Hóa Học 11 — Lớp 11", dueDate: "15/08/2026", defaultStatus: "not-submitted", classId: 4 },
  12: { title: "Cân bằng phương trình oxi hóa khử", class: "Hóa Học 11 — Lớp 11", dueDate: "08/08/2026", defaultStatus: "submitted", classId: 4, score: "9.0 / 10" },
  13: { title: "Bài kiểm tra viết - 45 phút", class: "Hóa Học 11 — Lớp 11", dueDate: "29/07/2026", defaultStatus: "overdue", classId: 4 },
  14: { title: "Viết văn nghị luận - Chủ đề tự chọn", class: "Ngữ Văn Nâng Cao — Lớp 11", dueDate: "15/08/2026", defaultStatus: "not-submitted", classId: 5 },
  15: { title: "Phân tích đoạn thơ - Xuân Diệu", class: "Ngữ Văn Nâng Cao — Lớp 11", dueDate: "07/08/2026", defaultStatus: "submitted", classId: 5, score: "8.5 / 10" },
  16: { title: "Bài tập di truyền - Tuần 5", class: "Sinh Học Đại Cương — Lớp 11", dueDate: "14/08/2026", defaultStatus: "not-submitted", classId: 6 },
  17: { title: "Sơ đồ tư duy - Tế bào học", class: "Sinh Học Đại Cương — Lớp 11", dueDate: "07/08/2026", defaultStatus: "submitted", classId: 6, score: "9.0 / 10" },
  18: { title: "Bài tập nguyên phân & giảm phân", class: "Sinh Học Đại Cương — Lớp 11", dueDate: "30/07/2026", defaultStatus: "overdue", classId: 6 }
};

const DEFAULT_ASG = {
  title: "Bài tập tuần 3 — Phương trình bậc hai",
  class: "Toán Nâng Cao — Lớp 11",
  dueDate: "20/08/2026",
  defaultStatus: "not-submitted",
  classId: 1,
  score: "8.5 / 10"
};

let currentStatus = "not-submitted";
let currentFile = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Get Assignment ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const asgId = parseInt(urlParams.get('id'), 10);
  const asg = ASSIGNMENTS_DB[asgId] || DEFAULT_ASG;

  // Set back link
  const backLink = document.getElementById('btnBackToClass');
  if (backLink) {
    backLink.href = `class-detail.html?id=${asg.classId || 1}`;
  }

  // Populate Title & Class info
  const titleEl = document.getElementById('asgTitle');
  if (titleEl) titleEl.textContent = asg.title;
  document.title = `${asg.title} – EduTrack`;

  const classInfoEl = document.getElementById('asgClassInfo');
  if (classInfoEl) classInfoEl.textContent = asg.class;

  const dueDateEl = document.getElementById('asgDueDate');
  if (dueDateEl) dueDateEl.textContent = asg.dueDate;

  const scoreValEl = document.getElementById('asgScoreValue');
  if (scoreValEl) scoreValEl.textContent = asg.score || "8.5 / 10";

  // Initial status
  currentStatus = asg.defaultStatus || "not-submitted";
  updateStatusView(currentStatus);

  // 2. Setup Status Demo Switcher Buttons
  const demoButtons = document.querySelectorAll('[data-status-btn]');
  demoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStatus = btn.getAttribute('data-status-btn');
      updateStatusView(targetStatus);
    });
  });

  // 3. Setup File Upload Drag & Drop
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('fileInput');
  const selectedPreview = document.getElementById('selectedFilePreview');
  const selectedName = document.getElementById('selectedFileName');
  const removeFileBtn = document.getElementById('btnRemoveSelectedFile');
  const submitBtn = document.getElementById('btnSubmitAssignment');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  function handleFileSelect(file) {
    currentFile = file;
    if (selectedPreview && selectedName) {
      selectedName.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
      selectedPreview.classList.remove('d-none');
    }
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentFile = null;
      if (fileInput) fileInput.value = '';
      if (selectedPreview) selectedPreview.classList.add('d-none');
    });
  }

  // 4. Submit Assignment Handler
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const filename = currentFile ? currentFile.name : 'Bai_lam_PT_bac2_NguyenHai.pdf';
      const submittedNameEl = document.getElementById('submittedFileName');
      if (submittedNameEl) submittedNameEl.textContent = filename;

      alert('Nộp bài tập thành công!');
      updateStatusView('submitted');
    });
  }

  // 5. Edit and Delete Submission Handlers
  const editBtn = document.getElementById('btnEditSubmission');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });
  }

  const deleteBtn = document.getElementById('btnDeleteSubmission');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn xóa bài nộp này không?')) {
        currentFile = null;
        if (selectedPreview) selectedPreview.classList.add('d-none');
        updateStatusView('not-submitted');
      }
    });
  }
});

/**
 * Update UI view according to submission status
 */
function updateStatusView(status) {
  currentStatus = status;

  // 1. Update Switcher active class
  document.querySelectorAll('[data-status-btn]').forEach(btn => {
    if (btn.getAttribute('data-status-btn') === status) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 2. Update Status Badge at header
  const statusBadge = document.getElementById('asgStatusBadge');
  if (statusBadge) {
    if (status === 'not-submitted') {
      statusBadge.className = 'asg-status-badge asg-status-chuanop';
      statusBadge.innerHTML = '<i class="bi bi-clock"></i><span>Chưa nộp</span>';
    } else if (status === 'submitted') {
      statusBadge.className = 'asg-status-badge asg-status-danop';
      statusBadge.innerHTML = '<i class="bi bi-check-circle"></i><span>Đã nộp</span>';
    } else if (status === 'overdue') {
      statusBadge.className = 'asg-status-badge asg-status-quahan';
      statusBadge.innerHTML = '<i class="bi bi-exclamation-circle"></i><span>Quá hạn</span>';
    }
  }

  // 3. Update Score Card visibility
  const scoreCard = document.getElementById('asgScoreCard');
  if (scoreCard) {
    if (status === 'submitted') {
      scoreCard.classList.remove('d-none');
    } else {
      scoreCard.classList.add('d-none');
    }
  }

  // 4. Update Submission State Sections
  const notSubmittedView = document.getElementById('viewNotSubmitted');
  const submittedView = document.getElementById('viewSubmitted');
  const overdueView = document.getElementById('viewOverdue');

  if (notSubmittedView) notSubmittedView.classList.toggle('d-none', status !== 'not-submitted');
  if (submittedView) submittedView.classList.toggle('d-none', status !== 'submitted');
  if (overdueView) overdueView.classList.toggle('d-none', status !== 'overdue');
}
