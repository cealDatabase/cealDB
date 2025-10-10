"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";
import { languages, type } from "../../data/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  publisher: z.string().optional(),
  data_source: z.string().optional(),
  cjk_title: z.string().min(1, "CJK Title is required"),
  romanized_title: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  counts: z.number().min(0, "Counts must be 0 or greater"),
  language: z.array(z.number()).min(1, "At least one language must be selected"),
  is_global: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateAVForm({
  selectedYear,
  userRoles,
  libraryId,
}: {
  selectedYear: number;
  userRoles: string[];
  libraryId?: number;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if user can create global entries (Super Admin: 1, or Editor: 3)
  const canCreateGlobal = userRoles.includes("1") || userRoles.includes("3");
  
  // Member (role 2) can only create library-specific entries
  const isMemberOnly = userRoles.length === 1 && userRoles[0] === "2";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      notes: "",
      publisher: "",
      data_source: "",
      cjk_title: "",
      romanized_title: "",
      type: "",
      counts: 0,
      language: [],
      is_global: canCreateGlobal, // Default to true for admins, false for members
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // For members (role 2), force is_global to false and add library_id
      const submissionData = {
        ...values,
        year: selectedYear,
        is_global: isMemberOnly ? false : values.is_global,
        library_id: isMemberOnly && libraryId ? libraryId : undefined,
      };

      const response = await fetch("/api/av/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("AV entry created successfully!");
        
        // Get the new record ID and redirect with it
        // The client component will calculate pagination based on its loaded data
        const newRecordId = data.data?.id || data.newAV?.id;
        
        // Redirect with the new record ID for highlighting and pagination calculation
        router.push(`/admin/survey/avdb/${selectedYear}?newRecord=${newRecordId}`);
      } else {
        toast.error(`Failed to create AV entry: ${data.detail || data.error}`);
      }
    } catch (error) {
      console.error("Error creating AV entry:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLanguage = (languageId: number, currentLanguages: number[]) => {
    if (currentLanguages.includes(languageId)) {
      return currentLanguages.filter((id) => id !== languageId);
    } else {
      return [...currentLanguages, languageId];
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cjk_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CJK Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter CJK title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the subtitle (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>English Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="romanized_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Romanized Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter romanized title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Publication Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Publication Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publisher</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter publisher" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Source</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter data source" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select AV type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {type.map((typeOption) => (
                            <SelectItem key={typeOption.value} value={typeOption.value}>
                              {typeOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="counts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Counts</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Enter count"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Additional Information
              </h3>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description (optional)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes (optional)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Languages Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Languages *
              </h3>

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormDescription>
                      Select all applicable languages for this AV resource.
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                      {languages.map((lang) => (
                        <div key={lang.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lang-${lang.value}`}
                            checked={field.value.includes(lang.value)}
                            onCheckedChange={(checked) => {
                              const newValue = toggleLanguage(lang.value, field.value);
                              field.onChange(newValue);
                            }}
                          />
                          <label
                            htmlFor={`lang-${lang.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {lang.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Settings Section - Only show for admins */}
            {canCreateGlobal && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Settings
                </h3>

                <FormField
                  control={form.control}
                  name="is_global"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Global Resource</FormLabel>
                        <FormDescription>
                          Check this if this is a globally available resource (default for admins).
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Info for members */}
            {isMemberOnly && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This entry will be created as a library-specific resource for your institution.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? "Creating..." : "Create AV Entry"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
