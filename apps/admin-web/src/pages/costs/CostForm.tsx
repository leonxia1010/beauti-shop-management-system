/**
 * Cost Entry Form Component
 *
 * Following SOLID principles:
 * - Single Responsibility: Handles cost entry form logic only
 * - Open/Closed: Extensible for new form fields
 * - Interface Segregation: Focused on form operations
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { DatePicker } from '../../components/ui/DatePicker';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import {
  CreateCostEntryDto,
  UpdateCostEntryDto,
} from '@beauty-shop/data-access';

// Form validation schema (DRY - reuse across form instances)
const costFormSchema = z.object({
  category: z.string().min(1, '请选择成本类别'),
  payer: z.string().min(1, '请选择付款方'),
  amount: z.number().positive('金额必须大于0'),
  description: z.string().optional(),
  entry_date: z.string().min(1, '请选择日期'),
  allocation_rule_id: z.string().optional(),
});

type CostFormData = z.infer<typeof costFormSchema>;

interface CostFormProps {
  initialData?: Partial<CostFormData>;
  categories: string[];
  payers: string[];
  isSubmitting?: boolean;
  onSubmit: (data: CreateCostEntryDto | UpdateCostEntryDto) => void;
  onCancel?: () => void;
}

export function CostForm({
  initialData,
  categories = [],
  payers = [],
  isSubmitting = false,
  onSubmit,
  onCancel,
}: CostFormProps) {
  const form = useForm<CostFormData>({
    resolver: zodResolver(costFormSchema),
    defaultValues: {
      category: initialData?.category || '',
      payer: initialData?.payer || '',
      amount: initialData?.amount || 0,
      description: initialData?.description || '',
      entry_date:
        initialData?.entry_date || new Date().toISOString().split('T')[0],
      allocation_rule_id: initialData?.allocation_rule_id || '',
    },
  });

  const handleSubmit = (data: CostFormData) => {
    // Convert form data to API format
    const submitData = {
      ...data,
      store_id: 'current-store', // TODO: Get from auth context
      ...(data.allocation_rule_id === '' && { allocation_rule_id: undefined }),
      ...(data.description === '' && { description: undefined }),
    };

    onSubmit(submitData);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{initialData ? '编辑成本记录' : '新增成本记录'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>成本类别</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择成本类别" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payer Selection */}
            <FormField
              control={form.control}
              name="payer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>付款方</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择付款方" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {payers.map((payer) => (
                        <SelectItem key={payer} value={payer}>
                          {payer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Input */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>金额 (元)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="请输入金额"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Entry Date */}
            <FormField
              control={form.control}
              name="entry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>发生日期</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description (Optional) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入备注信息（可选）" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting
                  ? '保存中...'
                  : initialData
                  ? '更新记录'
                  : '创建记录'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  取消
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
