import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { ChildStudent, PendingLinkRequest } from '../DAL/parentDAL';
import { parentDAL, DEFAULT_PARENT_ID } from '../DAL/parentDAL';
import { learningDAL } from '../DAL/learningDAL';

export type { ChildStudent, PendingLinkRequest };

/**
 * State type chuan hoa theo Lab 6
 */
export type ParentState = {
  childrenList: ChildStudent[];
  selectedChildId: number | null;
  pendingRequests: PendingLinkRequest[];
};

const INITIAL_CHILDREN: ChildStudent[] = parentDAL.getLinkedChildrenSync();

const iniState: ParentState = {
  childrenList: INITIAL_CHILDREN,
  selectedChildId: INITIAL_CHILDREN.length > 0 ? INITIAL_CHILDREN[0].id : null,
  pendingRequests: [],
};

/**
 * Action type theo useReducer pattern Lab 6
 */
export type ParentAction =
  | { type: 'SET_SELECTED_CHILD'; payload: number | null }
  | { type: 'ADD_CHILD'; payload: ChildStudent }
  | { type: 'ADD_PENDING_REQUEST'; payload: PendingLinkRequest }
  | { type: 'SET_EMPTY_STATE' }
  | { type: 'RESET_CHILDREN'; payload: ChildStudent[] }
  | { type: 'UPDATE_CHILD_UNPAID'; payload: { studentId: number; unpaidAmount: number } };

function reducer(state: ParentState, action: ParentAction): ParentState {
  switch (action.type) {
    case 'SET_SELECTED_CHILD':
      return {
        ...state,
        selectedChildId: action.payload,
      };
    case 'ADD_CHILD':
      return {
        ...state,
        childrenList: [...state.childrenList, action.payload],
        selectedChildId: action.payload.id,
      };
    case 'ADD_PENDING_REQUEST':
      return {
        ...state,
        pendingRequests: [action.payload, ...state.pendingRequests],
      };
    case 'SET_EMPTY_STATE':
      return {
        ...state,
        childrenList: [],
        selectedChildId: null,
      };
    case 'RESET_CHILDREN':
      return {
        ...state,
        childrenList: action.payload,
        selectedChildId:
          action.payload.some((c) => c.id === state.selectedChildId)
            ? state.selectedChildId
            : action.payload.length > 0
              ? action.payload[0].id
              : null,
      };
    case 'UPDATE_CHILD_UNPAID':
      return {
        ...state,
        childrenList: state.childrenList.map((child) =>
          child.id === action.payload.studentId
            ? { ...child, unpaidAmount: action.payload.unpaidAmount }
            : child
        ),
      };
    default:
      return state;
  }
}

/**
 * Context Type ke thua State & dispatch, dong thoi cung cap cac action helper thuan tien
 */
export type ParentContextType = ParentState & {
  selectedChild: ChildStudent | null;
  dispatch: React.Dispatch<ParentAction>;
  setSelectedChildId: (id: number | null) => void;
  updateChildUnpaidAmount: (studentId: number, unpaidAmount: number) => void;
  linkStudentByCode: (
    code: string,
    dob: string,
    phone?: string
  ) => { success: boolean; message: string; student?: ChildStudent };
  requestLinkStudent: (
    studentName: string,
    dob: string,
    school: string,
    parentPhone: string,
    note?: string
  ) => { success: boolean; ticketId: string; message: string };
  setDemoEmptyState: () => void;
  resetDemoChildren: () => void;
};

export const ParentContext = createContext<ParentContextType>({
  ...iniState,
  selectedChild: null,
  dispatch: () => {},
  setSelectedChildId: () => {},
  updateChildUnpaidAmount: () => {},
  linkStudentByCode: () => ({ success: false, message: '' }),
  requestLinkStudent: () => ({ success: false, ticketId: '', message: '' }),
  setDemoEmptyState: () => {},
  resetDemoChildren: () => {},
});

export type ParentProviderProps = {
  children: ReactNode;
};

export function ParentProvider({ children }: ParentProviderProps) {
  const [state, dispatch] = useReducer(reducer, iniState);

  useEffect(() => {
    let isMounted = true;

    async function loadLiveChildrenOverview() {
      try {
        const liveChildren = await learningDAL.getParentChildrenOverview(DEFAULT_PARENT_ID);
        if (isMounted && liveChildren && liveChildren.length > 0) {
          dispatch({ type: 'RESET_CHILDREN', payload: liveChildren });
        }
      } catch (err) {
        console.warn('[ParentContext] Không thể tải dữ liệu con từ Backend, giữ mock mặc định:', err);
      }
    }

    loadLiveChildrenOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedChild =
    state.childrenList.find((c) => c.id === state.selectedChildId) || null;

  const setSelectedChildId = (id: number | null) => {
    dispatch({ type: 'SET_SELECTED_CHILD', payload: id });
  };

  const updateChildUnpaidAmount = (studentId: number, unpaidAmount: number) => {
    dispatch({
      type: 'UPDATE_CHILD_UNPAID',
      payload: { studentId, unpaidAmount },
    });
  };

  const linkStudentByCode = (
    code: string,
    dob: string,
    phone?: string
  ): { success: boolean; message: string; student?: ChildStudent } => {
    const trimmedCode = code.trim().toUpperCase();

    const existing = state.childrenList.find(
      (c) => c.code.toUpperCase() === trimmedCode
    );
    if (existing) {
      return {
        success: false,
        message: `Học sinh với mã ${trimmedCode} đã có trong danh sách theo dõi của bạn.`,
      };
    }

    const newStudent: ChildStudent = {
      id: Date.now(),
      code: trimmedCode,
      name: 'Nguyễn Đăng Khoa',
      avatar: 'ĐK',
      grade: 'Lớp 10',
      school: 'THPT Kim Liên',
      dob: dob || '10/10/2010',
      phone: phone || '',
      classesCount: 2,
      attendanceRate: 100,
      averageScore: 8.5,
      unpaidAmount: 1800000,
      classes: [
        {
          id: 201,
          name: 'Toán 10 Chuyên Đề Đại Số',
          subject: 'Toán Học',
          subjectClass: 'subject-toan',
          badge: 'Toán',
          teacher: 'Nguyễn Văn An',
          teacherInitials: 'NA',
          schedule: 'Thứ 2 - 5, 18:00 — 19:30',
          room: 'Phòng P.201',
          attendedLessons: 8,
          totalLessons: 8,
          notes: 'Mới nhập học, hòa nhập lớp nhanh chóng.',
        },
        {
          id: 202,
          name: 'Tiếng Anh IELTS Foundation',
          subject: 'Tiếng Anh',
          subjectClass: 'subject-tieng-anh',
          badge: 'Tiếng Anh',
          teacher: 'Lê Hoàng Nam',
          teacherInitials: 'LN',
          schedule: 'Thứ 4 - 6, 18:00 — 19:30',
          room: 'Phòng P.302',
          attendedLessons: 7,
          totalLessons: 8,
          notes: 'Kỹ năng Listening và Reading tiến bộ rõ rệt.',
        },
      ],
    };

    dispatch({ type: 'ADD_CHILD', payload: newStudent });

    return {
      success: true,
      message: `Liên kết thành công học sinh ${newStudent.name} (${newStudent.code})!`,
      student: newStudent,
    };
  };

  const requestLinkStudent = (
    studentName: string,
    dob: string,
    school: string,
    parentPhone: string,
    note?: string
  ): { success: boolean; ticketId: string; message: string } => {
    const randomTicketNumber = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `REQ-${randomTicketNumber}`;

    const newRequest: PendingLinkRequest = {
      id: ticketId,
      studentName: studentName.trim(),
      dob: dob.trim(),
      school: school.trim(),
      parentPhone: parentPhone.trim(),
      note: note?.trim(),
      createdAt: new Date().toLocaleDateString('vi-VN'),
      status: 'pending',
    };

    dispatch({ type: 'ADD_PENDING_REQUEST', payload: newRequest });

    return {
      success: true,
      ticketId,
      message: `Đã gửi yêu cầu liên kết hồ sơ cho học sinh ${studentName}. Mã phiếu: #${ticketId}.`,
    };
  };

  const setDemoEmptyState = () => {
    dispatch({ type: 'SET_EMPTY_STATE' });
  };

  const resetDemoChildren = () => {
    dispatch({ type: 'RESET_CHILDREN', payload: INITIAL_CHILDREN });
  };

  return (
    <ParentContext.Provider
      value={{
        ...state,
        selectedChild,
        dispatch,
        setSelectedChildId,
        updateChildUnpaidAmount,
        linkStudentByCode,
        requestLinkStudent,
        setDemoEmptyState,
        resetDemoChildren,
      }}
    >
      {children}
    </ParentContext.Provider>
  );
}

export const useParent = (): ParentContextType => {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
};

export const useParentContext = useParent;
export default ParentContext;
