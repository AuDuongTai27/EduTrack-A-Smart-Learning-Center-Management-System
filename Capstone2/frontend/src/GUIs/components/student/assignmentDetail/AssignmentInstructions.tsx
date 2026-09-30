import React from 'react';

export const AssignmentInstructions: React.FC = () => {
  return (
    <section className="mb-4">
      <h2 className="asg-section-heading">Hướng dẫn</h2>
      <div className="asg-instructions-card">
        <p>
          Các em hoàn thành <strong>toàn bộ</strong> bài tập trong file đính kèm bên dưới. Bài tập bao gồm các dạng:
        </p>
        <ul>
          <li>Giải phương trình bậc hai bằng phương pháp <em>phân tích nhân tử</em></li>
          <li>Áp dụng công thức nghiệm tổng quát và công thức nghiệm thu gọn</li>
          <li>Biện luận số nghiệm theo tham số m (10 bài tập)</li>
          <li>Bài toán thực tế liên quan đến phương trình bậc hai (3 bài)</li>
        </ul>
        <p className="note-text">
          Trình bày rõ ràng, đầy đủ các bước. Nộp file PDF hoặc ảnh chụp bài làm chất lượng cao.{' '}
          <strong className="text-dark">Không chấp nhận</strong> bài làm chụp thiếu nét hoặc bỏ sót bước giải.
        </p>
      </div>
    </section>
  );
};

export default AssignmentInstructions;
