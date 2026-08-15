/**
 * EduTrack - Student Profile JavaScript Controller
 */

const profileData = {
  fullName: "Nguyễn Thị Minh Anh",
  dob: "2006-03-15",
  gender: "Nữ",
  enrollDate: "2023-09-01",
  address: "45 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh",
  phone: "0901 234 567",
  email: "minhanh.nguyen@gmail.com",
  avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=240&h=240&fit=crop&auto=format",
};

function formatDate(iso) {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const btnEditProfile = document.getElementById('btnEditProfile');
  const btnCancelProfile = document.getElementById('btnCancelProfile');
  const btnSaveProfile = document.getElementById('btnSaveProfile');
  const profileViewCard = document.getElementById('profileViewCard');
  const profileEditCard = document.getElementById('profileEditCard');
  const profileModeBadge = document.getElementById('profileModeBadge');
  const breadcrumbEdit = document.getElementById('breadcrumbEdit');
  const profileToast = document.getElementById('profileToast');

  // Input Fields
  const inputFullName = document.getElementById('inputFullName');
  const inputDob = document.getElementById('inputDob');
  const inputGender = document.getElementById('inputGender');
  const inputAddress = document.getElementById('inputAddress');
  const inputPhone = document.getElementById('inputPhone');
  const inputEmail = document.getElementById('inputEmail');
  const avatarFileInput = document.getElementById('avatarFileInput');
  const btnChangeAvatar = document.getElementById('btnChangeAvatar');
  const avatarUploadBox = document.getElementById('avatarUploadBox');

  // View Fields
  const viewFullName = document.getElementById('viewFullName');
  const viewDob = document.getElementById('viewDob');
  const viewGender = document.getElementById('viewGender');
  const viewEnrollDate = document.getElementById('viewEnrollDate');
  const viewAddress = document.getElementById('viewAddress');
  const viewPhone = document.getElementById('viewPhone');
  const viewEmail = document.getElementById('viewEmail');
  const viewAvatarImg = document.getElementById('viewAvatarImg');
  const editAvatarImg = document.getElementById('editAvatarImg');
  const sidebarStudentName = document.querySelector('.student-name');

  let pendingAvatarUrl = profileData.avatarUrl;

  function renderView() {
    if (viewFullName) viewFullName.textContent = profileData.fullName;
    if (viewDob) viewDob.textContent = formatDate(profileData.dob);
    if (viewGender) viewGender.textContent = profileData.gender;
    if (viewEnrollDate) viewEnrollDate.textContent = formatDate(profileData.enrollDate);
    if (viewAddress) viewAddress.textContent = profileData.address;
    if (viewPhone) viewPhone.textContent = profileData.phone;
    if (viewEmail) viewEmail.textContent = profileData.email;
    if (viewAvatarImg) viewAvatarImg.src = profileData.avatarUrl;
    if (editAvatarImg) editAvatarImg.src = profileData.avatarUrl;
    if (sidebarStudentName) sidebarStudentName.textContent = profileData.fullName;
  }

  function enterEditMode() {
    if (inputFullName) inputFullName.value = profileData.fullName;
    if (inputDob) inputDob.value = profileData.dob;
    if (inputGender) inputGender.value = profileData.gender;
    if (inputAddress) inputAddress.value = profileData.address;
    if (inputPhone) inputPhone.value = profileData.phone;
    if (inputEmail) inputEmail.value = profileData.email;
    pendingAvatarUrl = profileData.avatarUrl;
    if (editAvatarImg) editAvatarImg.src = pendingAvatarUrl;

    if (profileViewCard) profileViewCard.classList.add('d-none');
    if (profileEditCard) profileEditCard.classList.remove('d-none');
    if (btnEditProfile) btnEditProfile.classList.add('d-none');
    if (breadcrumbEdit) breadcrumbEdit.classList.remove('d-none');

    if (profileModeBadge) {
      profileModeBadge.className = 'inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]';
      profileModeBadge.innerHTML = '<i class="bi bi-pencil-fill me-1"></i>Chế độ chỉnh sửa';
    }
  }

  function exitEditMode() {
    if (profileEditCard) profileEditCard.classList.add('d-none');
    if (profileViewCard) profileViewCard.classList.remove('d-none');
    if (btnEditProfile) btnEditProfile.classList.remove('d-none');
    if (breadcrumbEdit) breadcrumbEdit.classList.add('d-none');

    if (profileModeBadge) {
      profileModeBadge.className = 'inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
      profileModeBadge.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i>Chế độ xem';
    }
  }

  function showToast() {
    if (!profileToast) return;
    profileToast.classList.add('show');
    setTimeout(() => {
      profileToast.classList.remove('show');
    }, 3200);
  }

  // Handle Avatar Change
  function handleAvatarUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingAvatarUrl = e.target.result;
      if (editAvatarImg) editAvatarImg.src = pendingAvatarUrl;
    };
    reader.readAsDataURL(file);
  }

  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      handleAvatarUpload(file);
    });
  }

  if (btnChangeAvatar && avatarFileInput) {
    btnChangeAvatar.addEventListener('click', () => {
      avatarFileInput.click();
    });
  }

  if (avatarUploadBox && avatarFileInput) {
    avatarUploadBox.addEventListener('click', () => {
      avatarFileInput.click();
    });
  }

  // Event Listeners
  if (btnEditProfile) {
    btnEditProfile.addEventListener('click', enterEditMode);
  }

  if (btnCancelProfile) {
    btnCancelProfile.addEventListener('click', exitEditMode);
  }

  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', () => {
      if (inputFullName) profileData.fullName = inputFullName.value.trim() || profileData.fullName;
      if (inputDob) profileData.dob = inputDob.value || profileData.dob;
      if (inputGender) profileData.gender = inputGender.value || profileData.gender;
      if (inputAddress) profileData.address = inputAddress.value.trim() || profileData.address;
      if (inputPhone) profileData.phone = inputPhone.value.trim() || profileData.phone;
      if (inputEmail) profileData.email = inputEmail.value.trim() || profileData.email;
      profileData.avatarUrl = pendingAvatarUrl;

      renderView();
      exitEditMode();
      showToast();
    });
  }

  // Initial Render
  renderView();
});
