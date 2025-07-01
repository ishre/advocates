import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CaseFiltersProps {
  filters: {
    status: string;
    priority: string;
    dateFrom: string;
    dateTo: string;
  };
  onFilterChange: (filters: { status: string; priority: string; dateFrom: string; dateTo: string }) => void;
  onClearFilters: () => void;
}

export default function CaseFilters({ filters, onFilterChange, onClearFilters }: CaseFiltersProps) {
  const hasActiveFilters = (filters.status && filters.status !== "") || (filters.priority && filters.priority !== "") || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="status-filter">Status</Label>
          <Select value={filters.status || undefined} onValueChange={(value) => onFilterChange({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="settled">Settled</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority-filter">Priority</Label>
          <Select value={filters.priority || undefined} onValueChange={(value) => onFilterChange({ ...filters, priority: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date-from">Created From</Label>
          <Input
            id="date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="date-to">Created To</Label>
          <Input
            id="date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
} 