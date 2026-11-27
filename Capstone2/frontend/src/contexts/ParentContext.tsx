import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { ChildStudent, PendingLinkRequest } from '../DAL/parentDAL';
import { dataError } from '../GUIs/components/Common/DataState';
import { learningDAL } from '../DAL/learningDAL';
import { getSelectedUserId } from '../BLL/services/userSelection';
import { getAuthUser } from '../api/authApi';

export type { ChildStudent, PendingLinkRequest };

/**
 * State type chuan hoa theo Lab 6
 */
export type ParentState = {
  childrenList: ChildStudent[];
  selectedChildId: number | null;
  pendingRequests: PendingLinkRequest[];
  loading: boolean;
  error: string | null;
};

const iniState: ParentState = {
  childrenList: [],
  selectedChildId: null,
  pendingRequests: [],
  loading: true,
  error: null,
};

/**
 * Action type theo useReducer pattern Lab 6
 */
export type ParentAction =
  | { type: 'SET_SELECTED_CHILD'; payload: number | null }
  | { type: 'ADD_CHILD'; payload: ChildStudent }
  | { type: 'ADD_PENDING_REQUEST'; payload: PendingLinkRequest }
  | { type: 'RESET_CHILDREN'; payload: ChildStudent[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'UPDATE_CHILD_UNPAID'; payload: { studentId: number; unpaidAmount: number } };

function reducer(state: ParentState, action: ParentAction): ParentState {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, childrenList: [], selectedChildId: null, loading: false, error: action.payload };
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
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
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
  retryChildren: () => void;
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
};

export const ParentContext = createContext<ParentContextType>({
  ...iniState,
  selectedChild: null,
  retryChildren: () => {},
  dispatch: () => {},
  setSelectedChildId: () => {},
  updateChildUnpaidAmount: () => {},
  linkStudentByCode: async () => ({ success: false, message: '' }),
  requestLinkStudent: async () => ({ success: false, ticketId: '', message: '' }),
});

export type ParentProviderProps = {
  children: ReactNode;
};

export function ParentProvider({ children }: ParentProviderProps) {
  const [retryVersion, setRetryVersion] = React.useState(0);
  const retryChildren = () => setRetryVersion(v => v + 1);
  const [state, dispatch] = useReducer(reducer, iniState);
  const currentParentId = getSelectedUserId('parent');

  useEffect(() => {
    let isMounted = true;

    async function loadLiveChildrenOverview() {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const liveChildren = await learningDAL.getParentChildrenOverview(currentParentId);
        if (isMounted) {
          dispatch({ type: 'RESET_CHILDREN', payload: liveChildren || [] });
        }
      } catch (err) {
        if (isMounted) dispatch({ type: 'SET_ERROR', payload: dataError(err) });
      }
    }

    loadLiveChildrenOverview();

    return () => {
      isMounted = false;
    };
  }, [currentParentId, retryVersion]);

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
      message: 'Parents cannot link students directly. Please submit a request to Admin Staff for assistance.',
    };
  };

  const requestLinkStudent = async (
    studentName: string,
    dob: string,
    school: string,
    parentPhone: string,
    note?: string
  ): Promise<{ success: boolean; ticketId: string; message: string }> => {
    const authUser = getAuthUser();
    const senderName = authUser?.fullName || 'Phụ huynh';
    try {
      const createdFeedback = await learningDAL.createLearnerFeedback(
        {
          userId: currentParentId,
          studentId: selectedChild?.id,
          title: `Request to link student profile: ${studentName.trim()}`,
          description: `Parent requested Admin Staff to verify and link student profile: Full Name: ${studentName.trim()} | Date of Birth: ${dob.trim()} | School: ${school.trim() || 'Unknown'} | Parent Phone: ${parentPhone.trim()}.${note ? ` Note: ${note.trim()}` : ''}`,
          priority: 'medium',
        },
        'parent',
        senderName
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
        message: `Submitted profile linking request for student ${studentName} to Admin Staff. Ticket ID: #${ticketId}.`,
      };
    } catch (err) {
      return { success: false, ticketId: '', message: 'The linking request was not sent. Please retry.' };
    }
  };


  return (
    <ParentContext.Provider
      value={{
        ...state,
        selectedChild,
        retryChildren,
        dispatch,
        setSelectedChildId,
        updateChildUnpaidAmount,
        linkStudentByCode,
        requestLinkStudent,
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
