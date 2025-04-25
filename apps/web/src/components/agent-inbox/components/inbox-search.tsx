"use client";

import { useEffect, useState, useRef } from "react";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryParams } from "../hooks/use-query-params";
import { DATE_SORT_PARAM, THREAD_ID_PARAM } from "../constants";
import { cn } from "@/lib/utils";

type InboxSearchProps = {
  className?: string;
};

export function InboxSearch({ className }: InboxSearchProps) {
  const { updateQueryParams, getSearchParam } = useQueryParams();

  // Use simple useState instead of react-hook-form
  const [threadId, setThreadId] = useState("");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");

  // Track if we've already initialized from URL params
  const isInitializedRef = useRef(false);

  // Initialize values from URL params once
  useEffect(() => {
    // Skip if already initialized or not in browser
    if (isInitializedRef.current || typeof window === "undefined") {
      return;
    }

    const threadIdParam = getSearchParam(THREAD_ID_PARAM);
    const dateSortParam = getSearchParam(DATE_SORT_PARAM) as
      | "newest"
      | "oldest"
      | undefined;

    if (threadIdParam) {
      setThreadId(threadIdParam);
    }

    if (dateSortParam === "oldest") {
      setDateSort("oldest");
    } else {
      setDateSort("newest");
    }

    // Mark as initialized
    isInitializedRef.current = true;
  }, [getSearchParam]);

  // Handler for thread ID search
  const handleThreadSearch = () => {
    if (threadId.trim()) {
      updateQueryParams(THREAD_ID_PARAM, threadId.trim());
    } else {
      // If thread id is empty, remove it from the URL
      updateQueryParams(THREAD_ID_PARAM);
    }
  };

  // Handler for date sort change
  const handleDateSortChange = (value: "newest" | "oldest") => {
    setDateSort(value);
    updateQueryParams(DATE_SORT_PARAM, value);
  };

  return (
    <div className={cn("flex flex-col space-y-4 py-2", className)}>
      <div className="flex items-center space-x-2">
        {/* Thread ID Search */}
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search by thread ID"
            className="pl-8"
            value={threadId}
            onChange={(e) => {
              setThreadId(e.target.value);
              if (!e.target.value.trim()) {
                // Clear the thread ID param if the input is cleared
                updateQueryParams(THREAD_ID_PARAM);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleThreadSearch();
              }
            }}
          />
        </div>

        {/* Search button */}
        <Button
          variant="secondary"
          onClick={handleThreadSearch}
          className="shrink-0"
        >
          Search
        </Button>

        {/* Date Sort */}
        <div className="w-[180px] shrink-0">
          <Select
            value={dateSort}
            onValueChange={handleDateSortChange}
          >
            <SelectTrigger>
              <div className="flex items-center">
                {dateSort === "newest" ? (
                  <SortDesc className="mr-2 h-4 w-4" />
                ) : (
                  <SortAsc className="mr-2 h-4 w-4" />
                )}
                <SelectValue placeholder="Sort by date" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
