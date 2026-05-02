import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Phone, IdCard, CalendarDays, Sparkles } from "lucide-react";

import { studentApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const academicYears = ["YEAR_1", "YEAR_2", "YEAR_3", "YEAR_4", "YEAR_5", "YEAR_6"] as const;

const schema = z.object({
  rollNo: z.string().min(2, "Roll number is required."),
  year: z.enum(academicYears, { message: "Year is required." }),
  phoneNumber: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 6, { message: "Phone number is too short." }),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CompleteStudentProfileCard({
  initialRollNo,
  initialYear,
  initialPhoneNumber,
  initialAddress,
  onCompleted,
  className,
}: {
  initialRollNo?: string;
  initialYear?: string;
  initialPhoneNumber?: string | null;
  initialAddress?: string | null;
  onCompleted: () => Promise<void> | void;
  className?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaults = useMemo<FormValues>(
    () => ({
      rollNo: initialRollNo ?? "",
      year: (academicYears.includes(initialYear as any) ? (initialYear as any) : "YEAR_1") as FormValues["year"],
      phoneNumber: initialPhoneNumber ?? "",
      address: initialAddress ?? "",
    }),
    [initialRollNo, initialYear, initialPhoneNumber, initialAddress],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSaving(true);
    try {
      await studentApi.completeProfile({
        rollNo: values.rollNo,
        year: values.year,
        phoneNumber: values.phoneNumber || undefined,
        address: values.address || undefined,
      });
      await onCompleted();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className={cn("overflow-hidden border-emerald-200/70 shadow-sm", className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-600 via-green-600 to-teal-600" />
        <div className="relative px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Sparkles className="size-5" />
                Complete your student profile
              </CardTitle>
              <CardDescription className="text-white/80 mt-1">
                Add your real details so we can show your dashboard correctly.
              </CardDescription>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              Secure • Saved to database
            </div>
          </div>
        </div>
      </div>

      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="rollNo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="flex items-center gap-2">
                      <IdCard className="size-4 text-emerald-600" />
                      Roll No
                    </FieldLabel>
                    <Input {...field} placeholder="S-1234 or IT-2026-001" />
                    <FieldDescription>Must be unique.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="year"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-emerald-600" />
                      Year
                    </FieldLabel>
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      className={cn(
                        "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none",
                        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        fieldState.invalid && "border-destructive",
                      )}
                    >
                      {academicYears.map((y) => (
                        <option key={y} value={y}>
                          {y.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="phoneNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="flex items-center gap-2">
                      <Phone className="size-4 text-emerald-600" />
                      Phone Number
                    </FieldLabel>
                    <Input {...field} placeholder="+95 9xxxxxxx" />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="flex items-center gap-2">
                      <MapPin className="size-4 text-emerald-600" />
                      Address
                    </FieldLabel>
                    <Input {...field} placeholder="City, Township, Street…" />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            {serverError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                You can update these later (admin can also edit).
              </p>
              <Button type="submit" disabled={saving} className="min-w-40">
                {saving ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

