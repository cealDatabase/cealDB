"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditNameDialogProps {
  currentFirstName: string | null;
  currentLastName: string | null;
}

export function EditNameDialog({ currentFirstName, currentLastName }: EditNameDialogProps) {
  const [open, setOpen] = useState(false);
  const [firstname, setFirstname] = useState(currentFirstName || "");
  const [lastname, setLastname] = useState(currentLastName || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstname.trim() || !lastname.trim()) {
      toast.error("Both first name and last name are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/update-name", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: firstname.trim(),
          lastname: lastname.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update name");
      }

      toast.success("Your name has been updated successfully");

      setOpen(false);
      
      // Refresh the page to show updated name
      router.refresh();
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update name");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      // Reset form when closing
      if (!newOpen) {
        setFirstname(currentFirstName || "");
        setLastname(currentLastName || "");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          title="Edit name"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Your Name</DialogTitle>
            <DialogDescription>
              Update your first and last name. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstname">First Name</Label>
              <Input
                id="firstname"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                placeholder="Enter your first name"
                disabled={isLoading}
                maxLength={100}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Enter your last name"
                disabled={isLoading}
                maxLength={100}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
