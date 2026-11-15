import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { chooseUser, getSelection, loadSelection, subscribeSelection } from '../../BLL/services/userSelection';
import { getAuthUser, subscribeAuth } from '../../api/authApi';

export function useSelectedUser() {
  const { pathname } = useLocation();
  const authUser = useSyncExternalStore(subscribeAuth, getAuthUser);
  const pathRole = pathname.split('/')[1]?.replaceAll('-', '_') || '';
  const role = authUser?.primaryRole || pathRole;
  const state = useSyncExternalStore(subscribeSelection, () => getSelection(role));
  useEffect(() => {
    void loadSelection(role);
  }, [role]);
  return {
    ...state,
    role,
    permission: state.user?.roles,
    select: (id: number) => chooseUser(role, id),
    reload: () => loadSelection(role, true),
  };
}
