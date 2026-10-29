import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { ChildStudent, PendingLinkRequest } from '../DAL/parentDAL';
import { parentDAL, DEFAULT_PARENT_ID } from '../DAL/parentDAL';
import { learningDAL, DEFAULT_STUDENT_ID } from '../DAL/learningDAL';

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

export type ParentContextType = ParentState & {
  selectedChild: ChildStudent | null;
  dispatch: React.Dispatch<ParentAction>;
  setSelectedChildId: (id: number | null) => void;
  updateChildUnpaidAmount: (studentId: number, unpaidAmount: number) => void;
  linkStudentByCode: (
    code: string,
    dob: string,
    phone?: string
  ) => Promise<{ success: boolean; message: string; student?: ChildStudent }>;
  requestLinkStudent: (
    studentName: string,
    dob: string,
    school: string,
    parentPhone: string,
    note?: string
  ) => Promise<{ success: boolean; ticketId: string; message: string }>;
  setDemoEmptyState: () => void;
  resetDemoChildren: () => Promise<void>;
};

export const ParentContext = createContext<ParentContextType>({
  ...iniState,
  selectedChild: null,
  dispatch: () => {},
  setSelectedChildId: () => {},
  updateChildUnpaidAmount: () => {},
  linkStudentByCode: async () => ({ success: false, message: '' }),
  requestLinkStudent: async () => ({ success: false, ticketId: '', message: '' }),
  setDemoEmptyState: () => {},
  resetDemoChildren: async () => {},
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

  const linkStudentByCode = async (
    _code: string,
    _dob: string,
    _phone?: string
  ): Promise<{ success: boolean; message: string; student?: ChildStudent }> => {
    return {
      success: false,
      message: 'Phụ huynh không tự liên kết học sinh trực tiếp. Vui lòng gửi phản hồi tới Admin Staff để được hỗ trợ liên kết.',
    };
  };

  const requestLinkStudent = async (
    studentName: string,
    dob: string,
    school: string,
    parentPhone: string,
    note?: string
  ): Promise<{ success: boolean; ticketId: string; message: string }> => {
    try {
      const createdFeedback = await learningDAL.createLearnerFeedback(
        {
          userId: DEFAULT_PARENT_ID,
          studentId: selectedChild?.id || DEFAULT_STUDENT_ID,
          title: `Yêu cầu liên kết thêm hồ sơ học sinh: ${studentName.trim()}`,
          description: `Phụ huynh đề nghị Giáo vụ đối soát và liên kết hồ sơ học sinh: Họ tên: ${studentName.trim()} | Ngày sinh: ${dob.trim()} | Trường: ${school.trim() || 'Chưa rõ'} | SĐT Phụ huynh: ${parentPhone.trim()}.${note ? ` Ghi chú: ${note.trim()}` : ''}`,
          priority: 'medium',
        },
        'parent',
        'Lê Văn Nam'
      );

      const ticketId = createdFeedback.requestCode || `FB${createdFeedback.id}`;
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
        message: `Đã gửi phiếu phản hồi liên kết hồ sơ cho học sinh ${studentName} tới Admin Staff. Mã phiếu: #${ticketId}.`,
      };
    } catch (err) {
      console.warn('[ParentContext] Không kết nối được Backend khi gửi yêu cầu liên kết con:', err);
      const randomTicketNumber = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `FB${randomTicketNumber}`;

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
    }
  };

  const setDemoEmptyState = () => {
    dispatch({ type: 'SET_EMPTY_STATE' });
  };

  const resetDemoChildren = async () => {
    try {
      const liveChildren = await learningDAL.getParentChildrenOverview(DEFAULT_PARENT_ID);
      if (liveChildren && liveChildren.length > 0) {
        dispatch({ type: 'RESET_CHILDREN', payload: liveChildren });
        return;
      }
    } catch (err) {
      console.warn('[ParentContext] Không kết nối được Backend khi tải lại danh sách con, dùng mock:', err);
    }
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
