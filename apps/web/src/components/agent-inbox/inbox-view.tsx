import { useThreadsContext } from "@/components/agent-inbox/contexts/ThreadContext";
import { InboxItem } from "./components/inbox-item";
import React from "react";
import { useQueryParams } from "./hooks/use-query-params";
import {
  INBOX_PARAM,
  LIMIT_PARAM,
  OFFSET_PARAM,
  THREAD_ID_PARAM,
  DATE_SORT_PARAM,
  VIEW_STATE_THREAD_QUERY_PARAM,
} from "./constants";
import { ThreadStatusWithAll } from "./types";
import { Pagination } from "./components/pagination";
import { Inbox as InboxIcon, LoaderCircle } from "lucide-react";
import { InboxButtons } from "./components/inbox-buttons";
import { BackfillBanner } from "./components/backfill-banner";
import { logger } from "./utils/logger";
import { InboxSearch } from "./components/inbox-search";
import { InterruptFilter } from "./components/interrupt-filter";
import { ActiveFilters } from "./components/active-filters";

interface AgentInboxViewProps<
  _ThreadValues extends Record<string, any> = Record<string, any>,
> {
  saveScrollPosition: (element?: HTMLElement | null) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function AgentInboxView<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ saveScrollPosition, containerRef }: AgentInboxViewProps<ThreadValues>) {
  const { updateQueryParams, getSearchParam } = useQueryParams();
  const { loading, threadData, fetchThreads } =
    useThreadsContext<ThreadValues>();

  const selectedInbox = getSearchParam(INBOX_PARAM) as ThreadStatusWithAll;
  const offsetParam = getSearchParam(OFFSET_PARAM);
  const limitParam = getSearchParam(LIMIT_PARAM);
  const _offset = offsetParam ? parseInt(offsetParam, 10) : undefined;
  const _limit = limitParam ? parseInt(limitParam, 10) : undefined;

  const threadId = getSearchParam(THREAD_ID_PARAM);
  const dateSortParam = getSearchParam(DATE_SORT_PARAM) as
    | "newest"
    | "oldest"
    | undefined;
  const dateSort = dateSortParam || "newest";

  // Create refs to track previous values to avoid infinite loops
  const prevThreadIdRef = React.useRef<string | null>(null);
  const prevDateSortRef = React.useRef<string | null>(null);

  // Keep existing scroll position logic
  const scrollableContentRef = React.useRef<HTMLDivElement>(null);

  const noThreadsFound = threadData !== undefined && threadData.length === 0;

  // Filter thread data based on search
  const threadDataToRender = React.useMemo(() => {
    // If searching for a specific thread ID, filter by that
    if (threadId) {
      return threadData.filter((td) => td.thread.thread_id === threadId);
    }

    // Otherwise show all threads with optional date sorting
    const sortedData = [...threadData];

    // Apply date sorting
    if (dateSort === "newest") {
      sortedData.sort((a, b) => {
        const dateA = new Date(a.thread.updated_at || a.thread.created_at);
        const dateB = new Date(b.thread.updated_at || b.thread.created_at);
        return dateB.getTime() - dateA.getTime();
      });
    } else {
      sortedData.sort((a, b) => {
        const dateA = new Date(a.thread.updated_at || a.thread.created_at);
        const dateB = new Date(b.thread.updated_at || b.thread.created_at);
        return dateA.getTime() - dateB.getTime();
      });
    }

    return sortedData;
  }, [threadData, threadId, dateSort]);

  const handleThreadClick = React.useCallback(
    (threadId: string) => {
      try {
        saveScrollPosition(scrollableContentRef.current);
        updateQueryParams(VIEW_STATE_THREAD_QUERY_PARAM, threadId);
      } catch (e) {
        logger.error("Error occurred while updating query params", e);
      }
    },
    [updateQueryParams, saveScrollPosition],
  );

  const changeInbox = React.useCallback(
    (newInbox: ThreadStatusWithAll) => {
      if (selectedInbox && newInbox) {
        try {
          // When changing inbox tabs, clear any thread ID search
          if (threadId) {
            updateQueryParams(THREAD_ID_PARAM);
          }
          updateQueryParams([INBOX_PARAM, OFFSET_PARAM], [newInbox, "0"]);
        } catch (e) {
          logger.error("Error changing inbox", e);
        }
      }
    },
    [selectedInbox, threadId, updateQueryParams],
  );

  React.useEffect(() => {
    // Skip if no changes or already fetching the same data
    if (
      (prevThreadIdRef.current === threadId &&
        prevDateSortRef.current === dateSort) ||
      !selectedInbox
    ) {
      return;
    }

    // Update refs with current values
    prevThreadIdRef.current = threadId || null;
    prevDateSortRef.current = dateSort;

    // Only fetch if there's an actual change that requires fetching
    if (threadId || dateSort !== "newest") {
      // Use setTimeout to prevent potential render loops and double-effects in dev mode
      const timerId = setTimeout(() => {
        fetchThreads(selectedInbox);
      }, 0);

      return () => clearTimeout(timerId);
    }
  }, [threadId, dateSort, selectedInbox, fetchThreads]);

  return (
    <div
      ref={containerRef}
      className="h-full min-w-[1000px] overflow-y-auto"
    >
      <div className="pt-4 pl-5">
        <BackfillBanner />
        <InboxButtons changeInbox={changeInbox} />
        <div className="mt-4 flex flex-wrap gap-2">
          <InboxSearch />
          <InterruptFilter />
        </div>
        <ActiveFilters className="mt-2" />
      </div>
      <div
        ref={scrollableContentRef}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mt-3 flex h-full max-h-fit w-full flex-col items-start overflow-y-auto border-y-[1px] border-gray-50"
      >
        {threadDataToRender.map((threadData, idx) => {
          return (
            <InboxItem<ThreadValues>
              key={`inbox-item-${threadData.thread.thread_id}`}
              threadData={threadData}
              isLast={idx === threadDataToRender.length - 1}
              onThreadClick={handleThreadClick}
            />
          );
        })}
        {noThreadsFound && !loading && (
          <div className="flex w-full flex-col items-center justify-center p-4">
            <div className="mb-4 flex items-center justify-center gap-2 text-gray-700">
              <InboxIcon className="h-6 w-6" />
              <p className="font-medium">No threads found</p>
            </div>
          </div>
        )}
        {noThreadsFound && loading && (
          <div className="flex w-full items-center justify-center p-4">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <p className="font-medium">Loading</p>
              <LoaderCircle className="h-6 w-6 animate-spin" />
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full justify-start p-5">
        <Pagination />
      </div>
    </div>
  );
}
