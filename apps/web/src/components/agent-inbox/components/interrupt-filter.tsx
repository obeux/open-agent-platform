"use client";

import { useEffect, useState, useRef } from "react";
import { FilterIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryParams } from "../hooks/use-query-params";
import {
    ALLOWED_ACTIONS_PARAM,
    INTERRUPT_TITLE_PARAM,
    INBOX_PARAM,
} from "../constants";
import { cn } from "@/lib/utils";

type AllowedAction = "edit" | "accept" | "respond" | "ignore";

type InterruptFilterProps = {
  className?: string;
};

export function InterruptFilter({ className }: InterruptFilterProps) {
  const { updateQueryParams, getSearchParam } = useQueryParams();
  
  // Use useState instead of react-hook-form
  const [allowedActions, setAllowedActions] = useState<AllowedAction[]>([]);
  const [interruptTitle, setInterruptTitle] = useState("");
  
  // Track initialization
  const isInitializedRef = useRef(false);
  
  // Initialize values from URL params
  useEffect(() => {
    // Skip if already initialized or not in browser
    if (isInitializedRef.current || typeof window === 'undefined') {
      return;
    }
    
    const allowedActionsParam = getSearchParam(ALLOWED_ACTIONS_PARAM);
    const interruptTitleParam = getSearchParam(INTERRUPT_TITLE_PARAM);
    
    // Parse allowed actions from comma-separated string
    if (allowedActionsParam) {
      const actions = allowedActionsParam.split(",") as AllowedAction[];
      setAllowedActions(actions);
    } else {
      setAllowedActions([]);
    }
    
    if (interruptTitleParam) {
      setInterruptTitle(interruptTitleParam);
    } else {
      setInterruptTitle("");
    }
    
    // Mark as initialized
    isInitializedRef.current = true;
  }, [getSearchParam]);

  // Only show interrupt filter when in the interrupt tab
  const currentInbox = getSearchParam(INBOX_PARAM);
  const showInterruptFilter = currentInbox === "interrupted";

  if (!showInterruptFilter) {
    return null;
  }

  // Apply the filters (UI only for now)
  const applyFilters = () => {
    // Store allowed actions as comma-separated string
    if (allowedActions.length > 0) {
      updateQueryParams(ALLOWED_ACTIONS_PARAM, allowedActions.join(","));
    } else {
      updateQueryParams(ALLOWED_ACTIONS_PARAM);
    }

    // Store interrupt title
    if (interruptTitle) {
      updateQueryParams(INTERRUPT_TITLE_PARAM, interruptTitle);
    } else {
      updateQueryParams(INTERRUPT_TITLE_PARAM);
    }
  };

  const clearFilters = () => {
    updateQueryParams(ALLOWED_ACTIONS_PARAM);
    updateQueryParams(INTERRUPT_TITLE_PARAM);
    setAllowedActions([]);
    setInterruptTitle("");
  };
  
  // Handle checkbox changes
  const handleActionChange = (action: AllowedAction, checked: boolean | "indeterminate") => {
    if (checked === true) {
      // Add the action if it doesn't exist
      if (!allowedActions.includes(action)) {
        setAllowedActions([...allowedActions, action]);
      }
    } else {
      // Remove the action
      setAllowedActions(allowedActions.filter(a => a !== action));
    }
  };

  // Count active filters
  const activeFilterCount = 
    (allowedActions.length > 0 ? 1 : 0) + 
    (interruptTitle ? 1 : 0);

  return (
    <div className={cn("flex items-center", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1 border-dashed",
              activeFilterCount > 0 && "border-primary"
            )}
          >
            <FilterIcon className="h-4 w-4" />
            Interrupt Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80"
          align="start"
        >
          <div className="space-y-4">
            <h4 className="font-medium">Filter Interrupts</h4>
            <div className="space-y-4">
              {/* Allowed Actions Filter */}
              <div>
                <label className="text-sm font-medium">Allowed Actions</label>
                <div className="mt-1 space-y-2">
                  {(["edit", "accept", "respond", "ignore"] as const).map((action) => (
                    <div
                      key={action}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`action-${action}`}
                        checked={allowedActions.includes(action)}
                        onCheckedChange={(checked: boolean | "indeterminate") => 
                          handleActionChange(action, checked)
                        }
                      />
                      <label
                        htmlFor={`action-${action}`}
                        className="text-sm capitalize"
                      >
                        {action}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interrupt Title Filter */}
              <div>
                <label className="text-sm font-medium">Interrupt Title</label>
                <Select
                  value={interruptTitle}
                  onValueChange={setInterruptTitle}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any title</SelectItem>
                    <SelectItem value="validate">Validate</SelectItem>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="clarification">Clarification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 