"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Star as DefaultStar } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Agent } from "@/types/agent";
import {
  groupAgentsByGraphs,
  isDefaultAssistant,
  sortAgentGroup,
} from "@/lib/agent-utils";
import { getDeployments } from "@/lib/environment/deployments";

export interface AgentsComboboxProps {
  agents: Agent[];
  /**
   * The placeholder text to display when no value is selected.
   * @default "Select an agent..."
   */
  placeholder?: string;
  open?: boolean;
  setOpen?: (v: boolean) => void;
  value?: string;
  setValue?: (value: string) => void;
  className?: string;
}

/**
 * Returns the selected agent's name or "Default agent" if the selected agent is the default assistant.
 * @param value The value of the selected agent.
 * @param agents The array of agents.
 * @returns The name of the selected agent or "Default agent".
 */
const getSelectedAgentValue = (
  value: string,
  agents: Agent[],
): React.ReactNode => {
  const [selectedAssistantId, selectedDeploymentId] = value.split(":");
  const selectedAgent = agents.find(
    (item) =>
      item.assistant_id === selectedAssistantId &&
      item.deploymentId === selectedDeploymentId,
  );

  if (selectedAgent) {
    const agentName = isDefaultAssistant(selectedAgent)
      ? "Default agent"
      : selectedAgent.name;
    // Optionally include graph_id for default agents if needed for clarity
    // return isDefaultAssistant(selectedAgent) ? `${agentName} - ${selectedAgent.graph_id}` : agentName;
    return agentName;
  }
  return "";
};

// Helper to get the display name for filtering
const getAgentDisplayName = (agent: Agent): string => {
  return isDefaultAssistant(agent) ? "Default agent" : agent.name;
};

export function AgentsCombobox({
  agents,
  placeholder = "Select an agent...",
  open,
  setOpen,
  value,
  setValue,
  className,
}: AgentsComboboxProps) {
  const deployments = getDeployments();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Memoize the filtered and grouped agents
  const filteredGroupedAgents = React.useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();

    // Filter agents based on the search query
    const filteredAgents = agents.filter((agent) =>
      getAgentDisplayName(agent).toLowerCase().includes(lowerCaseQuery),
    );
    // Group filtered agents by deployment and then by graph
    const grouped: Record<
      string,
      { name: string; graphs: Record<string, Agent[]> }
    > = {};

    deployments.forEach((deployment) => {
      const deploymentAgents = filteredAgents.filter(
        (agent) => agent.deploymentId === deployment.id,
      );

      if (deploymentAgents.length > 0) {
        const agentsGroupedByGraphs = groupAgentsByGraphs(deploymentAgents);
        const graphs: Record<string, Agent[]> = {};
        agentsGroupedByGraphs.forEach((agentGroup) => {
          if (agentGroup.length > 0) {
            // Sort agents within the graph group
            graphs[agentGroup[0].graph_id] = sortAgentGroup(agentGroup);
          }
        });
        // Only add deployment if it has valid graph groups
        if (Object.keys(graphs).length > 0) {
          grouped[deployment.id] = { name: deployment.name, graphs };
        }
      }
    });

    return grouped;
  }, [agents, searchQuery, deployments]);

  const hasResults = Object.keys(filteredGroupedAgents).length > 0;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        asChild
        className={className}
      >
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? getSelectedAgentValue(value, agents) : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[200px] p-0">
        <Command
          // Disable cmdk's internal filtering, rely on our useMemo filtering
          filter={(input) => {
            console.log("filter input", input);
            return 1;
          }}
        >
          <CommandInput
            placeholder="Search agents..."
            value={searchQuery}
            onValueChange={setSearchQuery} // Update search query state
          />
          <CommandList>
            {!hasResults && <CommandEmpty>No agents found.</CommandEmpty>}
            {Object.entries(filteredGroupedAgents).map(
              ([deploymentId, deploymentData], index) => (
                <React.Fragment key={deploymentId}>
                  <CommandGroup
                    heading={deploymentData.name} // Use deployment name as heading
                    className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium"
                  >
                    {Object.entries(deploymentData.graphs).map(
                      ([graphId, agentGroup]) => (
                        <CommandGroup
                          key={`${deploymentId}-${graphId}`}
                          heading={graphId} // Use graph_id as heading
                          className="ml-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-normal"
                        >
                          {agentGroup.map((item) => (
                            <CommandItem
                              key={`${item.assistant_id}-${item.deploymentId}`} // Ensure key is unique across deployments
                              value={`${item.assistant_id}:${item.deploymentId}:${item.name}`}
                              onSelect={(currentValue) => {
                                setValue?.(
                                  currentValue === value ? "" : currentValue,
                                );
                                setOpen?.(false);
                                setSearchQuery(""); // Clear search on select
                              }}
                              className="flex w-full items-center justify-between"
                            >
                              <p className="line-clamp-1 flex-1 truncate pr-2">
                                {getAgentDisplayName(item)}
                              </p>
                              <div className="flex flex-shrink-0 items-center justify-end gap-2">
                                {isDefaultAssistant(item) && (
                                  <DefaultStar className="opacity-100" />
                                )}
                                <Check
                                  className={cn(
                                    value ===
                                      `${item.assistant_id}:${item.deploymentId}`
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ),
                    )}
                  </CommandGroup>
                  {/* Add separator only if it's not the last deployment group */}
                  {index < Object.keys(filteredGroupedAgents).length - 1 && (
                    <CommandSeparator />
                  )}
                </React.Fragment>
              ),
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
