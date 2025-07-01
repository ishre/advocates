"use client";
import React, { useState, useEffect } from "react";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

type Client = {
  _id: string;
  name: string;
  email: string;
  phone: string;
};

const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

type ClientSelectorProps = {
  value: Client | null;
  onChange: (client: Client | null) => void;
};

const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Fetch clients from API
  const fetchClients = async (search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", "50"); // Get more clients for better search

      const response = await fetch(`/api/clients?${params}`);
      if (!response.ok) throw new Error("Failed to fetch clients");
      
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchClients();
  }, []);

  // Handle client creation
  const handleCreateClient = async (data: ClientFormData) => {
    setCreateLoading(true);
    setCreateError(null);
    
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create client");
      }

      // Add new client to the list
      const newClient = {
        _id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
      };
      
      setClients(prev => [newClient, ...prev]);
      onChange(newClient); // Auto-select the new client
      setShowCreateDialog(false);
      setOpen(false);
      form.reset();
      
    } catch (error: unknown) {
      setCreateError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    fetchClients(search);
  };

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "create-new") {
      // Get the current search term from the command input
      const searchInput = document.querySelector('[data-slot="command-input"]') as HTMLInputElement;
      const searchTerm = searchInput?.value || "";
      form.setValue("name", searchTerm);
      setShowCreateDialog(true);
      return;
    }

    const selectedClient = clients.find(client => client._id === selectedValue) || null;
    onChange(selectedClient);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>Client</Label>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={loading}
              >
                {value ? `${value.name} (${value.email})` : <span className="text-muted-foreground">Search or select a client...</span>}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Search clients..." 
                  onValueChange={handleSearch}
                />
                <CommandList>
                  <CommandEmpty>No clients found.</CommandEmpty>
                  <CommandGroup>
                    {clients.map((client) => (
                      <CommandItem
                        key={client._id}
                        value={client._id}
                        onSelect={() => handleSelect(client._id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value?._id === client._id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          <span className="text-sm text-muted-foreground">{client.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                    {/* Add "Create New Client" option */}
                    <CommandItem
                      value="create-new"
                      onSelect={() => handleSelect("create-new")}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create new client...
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateClient)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="client@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {createError && (
                  <div className="text-sm text-red-500">{createError}</div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLoading}>
                    {createLoading ? "Creating..." : "Create Client"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ClientSelector; 