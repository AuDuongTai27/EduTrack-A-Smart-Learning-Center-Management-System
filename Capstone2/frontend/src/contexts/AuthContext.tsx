import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { User } from "../BLL/models/User";
import { DEFAULT_STUDENT, DEFAULT_PARENT } from "../DAL/mockData/mockUsers";

export type AuthState = {
  user: undefined | User;
  permission: undefined | string[];
  loading: boolean;
};

const iniState: AuthState = {
  user: DEFAULT_STUDENT,
  permission: ['student'],
  loading: false,
};

export type AuthAction =
  | { type: "authenticate" }
  | { type: "authenticated"; user: undefined | User; permission?: string[] }
  | { type: "authorize" }
  | { type: "authorized"; permission: string[] }
  | { type: "switch_role"; role: "student" | "parent" }
  | { type: "logout" };

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "authenticate":
      return { ...state, loading: true };
    case "authenticated":
      return {
        ...state,
        loading: false,
        user: action.user,
        permission: action.permission || (action.user ? ['student'] : undefined),
      };
    case "authorize":
      return { ...state, loading: true };
    case "authorized":
      return { ...state, loading: false, permission: action.permission };
    case "switch_role":
      if (action.role === 'parent') {
        return {
          ...state,
          user: DEFAULT_PARENT,
          permission: ['parent'],
        };
      }
      return {
        ...state,
        user: DEFAULT_STUDENT,
        permission: ['student'],
      };
    case "logout":
      return { ...state, loading: false, user: undefined, permission: undefined };
    default:
      return state;
  }
}

export type AuthContextType = AuthState & {
  dispatch: React.Dispatch<AuthAction>;
};

export const AuthContext = createContext<AuthContextType>({
  ...iniState,
  dispatch: () => {},
});

export type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [{ user, permission, loading }, dispatch] = useReducer(reducer, iniState);
  return (
    <AuthContext.Provider value={{ user, permission, loading, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;
