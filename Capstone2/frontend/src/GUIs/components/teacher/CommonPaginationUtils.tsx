import React, { useState } from "react";
import { schedulePageNumber } from "../../../BLL/services/scheduleViewService";

export interface PaginationProps {
  totalItems?: number;
  currentPage?: number;
  rowsPerPage?: number;
  itemLabel?: string; // e.g. "ca học", "học viên", "yêu cầu", "lớp học"
  onPageChange?: (page: number) => void;
}

interface JumpInputProps {
  totalPages: number;
  onPageChange?: (page: number) => void;
}

function PaginationJumpInput({ totalPages, onPageChange }: JumpInputProps) {
  const [val, setVal] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const pageNum = schedulePageNumber(val, totalPages);
      if (pageNum !== null) {
        onPageChange?.(pageNum);
        setVal("");
      }
    }
  };

  const handleBlur = () => {
    if (val.trim()) {
      const pageNum = schedulePageNumber(val, totalPages);
      if (pageNum !== null) {
        onPageChange?.(pageNum);
      }
      setVal("");
    }
  };

  return (
    <input
      type="number"
      min={1}
      max={totalPages}
      placeholder="..."
      className="pagination-jump-input"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      title={`Enter page number (1 - ${totalPages}) and press Enter to jump`}
    />
  );
}

export function PaginationNavGroup({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return <span className="pagination-num-btn">1</span>;
  }

  // Khi có ít hơn 4 trang (< 4): hiển thị tất cả các trang bình thường
  if (totalPages < 4) {
    return (
      <>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
          p === currentPage ? (
            <span key={p} className="pagination-num-btn">
              {p}
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className="pagination-num-btn-inactive"
              onClick={() => onPageChange && onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
      </>
    );
  }

  // Khi có >= 4 trang:
  // 1. Ở trang đầu (currentPage === 1):
  //    [trang hiện tại: 1 (active)] [trang 2] [... input] [trang cuối]
  if (currentPage === 1) {
    return (
      <>
        <span className="pagination-num-btn">1</span>
        <button
          type="button"
          className="pagination-num-btn-inactive"
          onClick={() => onPageChange && onPageChange(2)}
        >
          2
        </button>
        <PaginationJumpInput totalPages={totalPages} onPageChange={onPageChange} />
        <button
          type="button"
          className="pagination-num-btn-inactive"
          onClick={() => onPageChange && onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      </>
    );
  }

  // 2. Ở trang thứ 2 (currentPage === 2):
  //    [trang đầu: 1] [trang hiện tại: 2 (active)] [... input] [trang cuối]
  if (currentPage === 2) {
    return (
      <>
        <button
          type="button"
          className="pagination-num-btn-inactive"
          onClick={() => onPageChange && onPageChange(1)}
        >
          1
        </button>
        <span className="pagination-num-btn">2</span>
        <PaginationJumpInput totalPages={totalPages} onPageChange={onPageChange} />
        <button
          type="button"
          className="pagination-num-btn-inactive"
          onClick={() => onPageChange && onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      </>
    );
  }

  // 3. Ở trang kế cuối (currentPage === totalPages - 1):
  //    [trang đầu: 1] [... input] [trang hiện tại: totalPages - 1 (active)] [trang cuối: totalPages]
  if (currentPage === totalPages - 1) {
    return (
      <>
        <button
          type="button"
          className="pagination-num-btn-inactive"
          onClick={() => onPageChange && onPageChange(1)}
        >
          1
        </button>
        <PaginationJumpInput totalPages={totalPages} onPageChange={onPageChange} />
        <span className="pagination-num-btn">{totalPages - 1}</span>
        <button
          type="button"
          className="pagination-num-btn-inactive"
          onClick={() => onPageChange && onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      </>
    );
  }

  // 4. Ở trang cuối cùng (currentPage === totalPages):
  //    [trang đầu: 1] [... input] [trang kế cuối: totalPages - 1] [trang hiện tại: totalPages (active)]
  if (currentPage === totalPages) {
    return (
      <>
        <button
          type="button"
          className="pagination-num-btn-inactive"
          onClick={() => onPageChange && onPageChange(1)}
        >
          1
        </button>
        <PaginationJumpInput totalPages={totalPages} onPageChange={onPageChange} />
        <button
          type="button"
          className="pagination-num-btn-inactive"
          onClick={() => onPageChange && onPageChange(totalPages - 1)}
        >
          {totalPages - 1}
        </button>
        <span className="pagination-num-btn">{totalPages}</span>
      </>
    );
  }

  // 5. Ở các trang ở giữa (3 <= currentPage < totalPages - 1):
  //    [trang đầu: 1] [trang hiện tại: currentPage (active)] [... input] [trang cuối: totalPages]
  return (
    <>
      <button
        type="button"
        className="pagination-num-btn-inactive"
        onClick={() => onPageChange && onPageChange(1)}
      >
        1
      </button>
      <span className="pagination-num-btn">{currentPage}</span>
      <PaginationJumpInput totalPages={totalPages} onPageChange={onPageChange} />
      <button
        type="button"
        className="pagination-num-btn-inactive"
        onClick={() => onPageChange && onPageChange(totalPages)}
      >
        {totalPages}
      </button>
    </>
  );
}
