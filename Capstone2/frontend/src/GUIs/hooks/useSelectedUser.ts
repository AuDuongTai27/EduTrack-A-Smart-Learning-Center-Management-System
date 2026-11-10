import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { chooseUser, getSelection, loadSelection, subscribeSelection } from '../../BLL/services/userSelection';

export function useSelectedUser() {
  const { pathname } = useLocation(); const role = pathname.split('/')[1]?.replaceAll('-', '_') || '';
  const state = useSyncExternalStore(subscribeSelection, () => getSelection(role));
  useEffect(() => { void loadSelection(role); }, [role]);
  return { ...state, role, permission: state.user?.roles,
    select: (id: number) => chooseUser(role, id), reload: () => loadSelection(role, true) };
}
