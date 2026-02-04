import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTrainers } from "@/hooks/useTrainers";
import { Plus, Loader2 } from "lucide-react";

const trainerSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  specializations: z.string().optional(),
  wage_amount: z.string().transform((val) => Number(val)),
  wage_type: z.string(),
  hire_date: z.string().optional(),
  bio: z.string().optional(),
  emergency_contact: z.string().optional(),
});

export function AddTrainerDialog() {
  const [open, setOpen] = useState(false);
  const { createTrainer } = useTrainers();

  const form = useForm<z.infer<typeof trainerSchema>>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      specializations: "",
      wage_amount: "0" as any,
      wage_type: "monthly",
      hire_date: new Date().toISOString().split("T")[0],
      bio: "",
      emergency_contact: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof trainerSchema>) => {
    const specializationsArray = values.specializations
      ? values.specializations.split(",").map((s) => s.trim())
      : [];

    await createTrainer.mutateAsync({
      full_name: values.full_name,
      email: values.email || null,
      phone: values.phone || null,
      specializations: specializationsArray,
      wage_amount: values.wage_amount,
      wage_type: values.wage_type,
      hire_date: values.hire_date || null,
      bio: values.bio || null,
      emergency_contact: values.emergency_contact || null,
      is_active: true,
      avatar_url: null,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Trainer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Trainer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
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
                      <Input placeholder="+123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="specializations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specializations (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Yoga, CrossFit, Nutrition" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wage_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wage Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wage_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wage Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="per_session">Per Session</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="hire_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hire Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createTrainer.isPending}>
              {createTrainer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Trainer
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
