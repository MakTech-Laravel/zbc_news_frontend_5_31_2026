import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { navigateToLogin } from "@/auth/loginNavigation";
import { useAuth } from "@/auth/useAuth";
import {
  checkArticleSaved,
  toggleArticleSave,
} from "@/services/user/articleSave";

export type UseArticleSaveOptions = {
  /** Fetch saved state when the hook mounts. Default: true */
  checkOnMount?: boolean;
  /** Show toast on toggle. Default: true */
  showToast?: boolean;
  /** Redirect to login on 401. Default: true */
  redirectOnUnauthorized?: boolean;
};

export function useArticleSave(
  articleId: string | number | undefined | null,
  options: UseArticleSaveOptions = {},
) {
  const {
    checkOnMount = true,
    showToast = true,
    redirectOnUnauthorized = true,
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, resetAuthState } = useAuth();
  const numericId = articleId != null && articleId !== "" ? Number(articleId) : NaN;
  const isValidId = !Number.isNaN(numericId) && numericId > 0;

  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [toggling, setToggling] = useState(false);

  const refresh = useCallback(async () => {
    if (!isValidId || !isAuthenticated) {
      setSaved(false);
      return false;
    }

    setChecking(true);
    try {
      const status = await checkArticleSaved(numericId);
      setSaved(status.saved);
      return status.saved;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setSaved(false);
        return false;
      }
      if (status !== 401) {
        console.error(error);
      }
      return false;
    } finally {
      setChecking(false);
    }
  }, [isAuthenticated, isValidId, numericId]);

  useEffect(() => {
    if (!checkOnMount || !isValidId || !isAuthenticated) {
      if (!isAuthenticated) {
        setSaved(false);
      }
      return;
    }
    void refresh();
  }, [checkOnMount, isAuthenticated, isValidId, numericId, refresh]);

  const toggle = useCallback(async () => {
    if (!isValidId || toggling) return null;

    if (!isAuthenticated) {
      if (showToast) {
        toast.error("Please login to save articles");
      }
      if (redirectOnUnauthorized) {
        navigateToLogin(navigate, location);
      }
      return null;
    }

    setToggling(true);
    try {
      const status = await toggleArticleSave(numericId);
      setSaved(status.saved);

      if (showToast) {
        toast.success(
          status.saved ? "Saved for later" : "Removed from saved articles",
        );
      }

      return status.saved;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      if (status === 401) {
        resetAuthState();
        if (showToast) {
          toast.error("Please login to save articles");
        }
        if (redirectOnUnauthorized) {
          navigateToLogin(navigate, location);
        }
        return null;
      }

      console.error(error);
      if (showToast) {
        toast.error("Failed to update saved article");
      }
      return null;
    } finally {
      setToggling(false);
    }
  }, [
    isAuthenticated,
    isValidId,
    location,
    numericId,
    redirectOnUnauthorized,
    resetAuthState,
    showToast,
    toggling,
    navigate,
  ]);

  return {
    saved,
    checking,
    toggling,
    loading: checking || toggling,
    isValidId,
    refresh,
    toggle,
  };
}
