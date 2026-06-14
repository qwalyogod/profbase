import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { usePortal } from '../state/PortalContext';
import { cabinetApi, CabinetFeature } from '../api/cabinetApi';

/**
 * Per-user persistent cabinet state, now backed by the MySQL backend
 * (`/api/cabinet`) instead of localStorage. Each signed-in user gets their own
 * copy of the data (calendar, notes, diary, journal, employment docs/steps),
 * loaded from the database when the active user changes and saved back (debounced)
 * on every change. The hook signature is unchanged so the cabinet pages that use
 * it do not need to be touched.
 *
 * For guests (no signed-in user) it falls back to the provided initial value in
 * memory only — nothing is persisted until a real user is active.
 */
export function useUserState<T>(
  key: string,
  initial: T | ((userId: string) => T),
): [T, Dispatch<SetStateAction<T>>] {
  const { currentUser } = usePortal();
  const userId = currentUser?.id ?? 'guest';
  const feature = key as CabinetFeature;

  const resolveInitial = useRef((id: string): T =>
    typeof initial === 'function' ? (initial as (userId: string) => T)(id) : initial,
  );

  const [state, setState] = useState<T>(() => resolveInitial.current(userId));

  // Which user's data is currently loaded, and a guard to skip the save that
  // immediately follows a load.
  const loadedFor = useRef<string | null>(null);
  const skipNextSave = useRef(true);

  // Load this user's cabinet data from the backend when the active user changes.
  useEffect(() => {
    let cancelled = false;
    skipNextSave.current = true;
    if (userId === 'guest') {
      setState(resolveInitial.current('guest'));
      loadedFor.current = 'guest';
      return () => {
        cancelled = true;
      };
    }
    cabinetApi
      .fetchAll()
      .then((res) => {
        if (cancelled) return;
        const payload = res.features ? (res.features as Record<string, unknown>)[feature] : undefined;
        setState((payload ?? resolveInitial.current(userId)) as T);
        loadedFor.current = userId;
      })
      .catch(() => {
        if (cancelled) return;
        setState(resolveInitial.current(userId));
        loadedFor.current = userId;
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, feature]);

  // Persist changes to the backend (debounced), but never the initial/loaded value.
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (userId === 'guest' || loadedFor.current !== userId) {
      return;
    }
    const timer = setTimeout(() => {
      cabinetApi.save(feature, state).catch(() => {
        /* ignore transient save errors — next change retries */
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, userId, feature]);

  return [state, setState];
}
