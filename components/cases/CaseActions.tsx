import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface CaseActionsProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onCreateCase: () => void;
}

export default function CaseActions({ 
  searchInput, 
  onSearchChange, 
  onSearch, 
  onCreateCase 
}: CaseActionsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
      <form onSubmit={onSearch} className="flex gap-2 items-center flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by case number, title, or client name"
            className="pl-10"
            value={searchInput}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm">Search</Button>
      </form>
      
      <Button onClick={onCreateCase} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Create Case
      </Button>
    </div>
  );
} 