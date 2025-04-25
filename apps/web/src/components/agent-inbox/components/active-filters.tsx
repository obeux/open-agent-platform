"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQueryParams } from "../hooks/use-query-params";
import {
  THREAD_ID_PARAM,
  DATE_SORT_PARAM,
  ALLOWED_ACTIONS_PARAM,
  INTERRUPT_TITLE_PARAM,
} from "../constants";
import { cn } from "@/lib/utils";

type ActiveFiltersProps = {
  className?: string;
};

export function ActiveFilters({ className }: ActiveFiltersProps) {
  const { getSearchParam, updateQueryParams } = useQueryParams();

  // Use state to track filter values
  const [threadId, setThreadId] = useState<string | null>(null);
  const [dateSort, setDateSort] = useState<string | null>(null);
  const [allowedActions, setAllowedActions] = useState<string[]>([]);
  const [interruptTitle, setInterruptTitle] = useState<string | null>(null);

  // Track initialization
  const isInitializedRef = useRef(false);

  // Update local state from URL params
  useEffect(() => {
    // Skip if not in browser
    if (typeof window === "undefined") {
      return;
    }

    // Get current filter values
    const threadIdParam = getSearchParam(THREAD_ID_PARAM);
    const dateSortParam = getSearchParam(DATE_SORT_PARAM);
    const allowedActionsParam = getSearchParam(ALLOWED_ACTIONS_PARAM);
    const interruptTitleParam = getSearchParam(INTERRUPT_TITLE_PARAM);

    // Update state
    setThreadId(threadIdParam || null);
    setDateSort(dateSortParam === "newest" ? null : dateSortParam || null);
    setAllowedActions(
      allowedActionsParam ? allowedActionsParam.split(",") : [],
    );
    setInterruptTitle(interruptTitleParam || null);

    isInitializedRef.current = true;
  }, [getSearchParam]);

  // Count active filters
  const hasActiveFilters =
    !!threadId || !!dateSort || allowedActions.length > 0 || !!interruptTitle;

  if (!hasActiveFilters) {
    return null;
  }

  // Helper to remove a filter
  const removeFilter = (paramName: string, value?: string) => {
    if (paramName === ALLOWED_ACTIONS_PARAM && value) {
      // For allowed actions, remove just the specific action
      const currentActions = allowedActions.filter(
        (action) => action !== value,
      );

      if (currentActions.length > 0) {
        updateQueryParams(ALLOWED_ACTIONS_PARAM, currentActions.join(","));
        setAllowedActions(currentActions);
      } else {
        updateQueryParams(ALLOWED_ACTIONS_PARAM);
        setAllowedActions([]);
      }
    } else {
      // For other filters, remove the entire parameter
      updateQueryParams(paramName);

      // Update local state
      if (paramName === THREAD_ID_PARAM) {
        setThreadId(null);
      } else if (paramName === DATE_SORT_PARAM) {
        setDateSort(null);
      } else if (paramName === INTERRUPT_TITLE_PARAM) {
        setInterruptTitle(null);
      }
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {/* Thread ID filter */}
      {threadId && (
        <Badge
          variant="outline"
          className="flex items-center gap-1"
        >
          <span>Thread: {threadId}</span>
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => removeFilter(THREAD_ID_PARAM)}
          />
        </Badge>
      )}

      {/* Date sort filter (only if not default "newest") */}
      {dateSort && (
        <Badge
          variant="outline"
          className="flex items-center gap-1"
        >
          <span>Date: {dateSort}</span>
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => removeFilter(DATE_SORT_PARAM)}
          />
        </Badge>
      )}

      {/* Allowed actions filters */}
      {allowedActions.map((action) => (
        <Badge
          key={`action-${action}`}
          variant="outline"
          className="flex items-center gap-1"
        >
          <span>Action: {action}</span>
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => removeFilter(ALLOWED_ACTIONS_PARAM, action)}
          />
        </Badge>
      ))}

      {/* Interrupt title filter */}
      {interruptTitle && (
        <Badge
          variant="outline"
          className="flex items-center gap-1"
        >
          <span>Title: {interruptTitle}</span>
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => removeFilter(INTERRUPT_TITLE_PARAM)}
          />
        </Badge>
      )}
    </div>
  );
}
