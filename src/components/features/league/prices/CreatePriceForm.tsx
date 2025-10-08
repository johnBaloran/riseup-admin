// src/components/features/league/prices/CreatePriceForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Price creation form ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPriceSchema, CreatePriceInput } from "@/lib/validations/price";

interface CreatePriceFormProps {
  cityId: string;
}

export function CreatePriceForm({ cityId }: CreatePriceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatePriceInput>({
    resolver: zodResolver(createPriceSchema),
  });

  const selectedType = watch("type");

  const onSubmit = async (data: CreatePriceInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/league/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create price");
      }

      toast.success("Price created successfully!");
      router.push(`/admin/league/prices`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create price");
      console.error("Create price error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    toast.error("Please fill in all required fields");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="space-y-6 bg-white p-6 rounded-lg shadow"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Display Name *</Label>
          <Input
            {...register("name")}
            id="name"
            placeholder="Winter 2025 Early Bird"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="priceId">Stripe Price ID *</Label>
          <Input
            {...register("priceId")}
            id="priceId"
            placeholder="price_1234567890abcdef"
            disabled={isLoading}
          />
          {errors.priceId && (
            <p className="text-sm text-red-600 mt-1">
              {errors.priceId.message}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Must start with "price_" from your Stripe account
          </p>
        </div>

        <div>
          <Label htmlFor="amount">Amount (USD) *</Label>
          <Input
            {...register("amount", { valueAsNumber: true })}
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="150.00"
            disabled={isLoading}
          />
          {errors.amount && (
            <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="type">Price Type *</Label>
          <Select
            value={selectedType}
            onValueChange={(value) =>
              setValue("type", value as any, { shouldValidate: true })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select price type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="earlyBird">
                Early Bird (Single Payment)
              </SelectItem>
              <SelectItem value="regular">Regular (Single Payment)</SelectItem>
              <SelectItem value="firstInstallment">
                First Installment (Down Payment)
              </SelectItem>
              <SelectItem value="installment">
                Installment - Early Bird (Weekly)
              </SelectItem>
              <SelectItem value="regularInstallment">
                Installment - Regular (Weekly)
              </SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Prices are permanent once created and cannot be
          edited or deleted.
        </p>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Price"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
