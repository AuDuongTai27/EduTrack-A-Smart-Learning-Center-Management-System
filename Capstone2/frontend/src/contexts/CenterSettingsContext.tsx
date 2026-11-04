import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import centerSettingDAL from "../DAL/centerSettingDAL";
import type { CenterSettingDto } from "../BLL/models/CenterSettingDto";

export const CENTER_SETTINGS_UPDATED_EVENT = "edutrack:center-settings-updated";

type CenterSettingsValue = {
  centerName: string;
  academicYear: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const CenterSettingsContext = createContext<CenterSettingsValue | null>(null);

function settingValue(settings: CenterSettingDto[], key: string): string {
  return settings.find((item) => item.settingKey.toLowerCase() === key)?.settingValue?.trim() ?? "";
}

/**
 * Shared settings for Center Manager and Admin Staff layouts.
 * No mock defaults: empty values mean missing settings or a failed request.
 */
export function CenterSettingsProvider({ children }: { children: ReactNode }) {
  const mounted = useRef(false);
  const [settings, setSettings] = useState<CenterSettingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await centerSettingDAL.getAllSettings();
      if (!mounted.current) return;
      setSettings(result.data);
      setError(null);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err.message : "Cannot load center settings.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const onSaved = () => void refresh();
    window.addEventListener(CENTER_SETTINGS_UPDATED_EVENT, onSaved);
    return () => {
      mounted.current = false;
      window.removeEventListener(CENTER_SETTINGS_UPDATED_EVENT, onSaved);
    };
  }, [refresh]);

  const value = useMemo<CenterSettingsValue>(
    () => ({
      centerName: settingValue(settings, "center_name"),
      academicYear: settingValue(settings, "academic_year"),
      loading,
      error,
      refresh,
    }),
    [settings, loading, error, refresh],
  );

  return <CenterSettingsContext.Provider value={value}>{children}</CenterSettingsContext.Provider>;
}

export function useCenterSettings(): CenterSettingsValue {
  const value = useContext(CenterSettingsContext);
  if (!value) {
    throw new Error("useCenterSettings must be used inside CenterSettingsProvider");
  }
  return value;
}
