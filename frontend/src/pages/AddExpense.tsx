import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, Check, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categories = [
  { value: 'medical', label: 'Medical', malayalam: 'വൈദ്യസഹായം' },
  { value: 'educational', label: 'Educational', malayalam: 'വിദ്യാഭ്യാസം' },
  { value: 'emergency', label: 'Emergency', malayalam: 'അടിയന്തരം' },
  { value: 'events', label: 'Events', malayalam: 'പരിപാടികൾ' },
  { value: 'other', label: 'Other', malayalam: 'മറ്റുള്ളവ' },
];

export default function AddExpense() {
  const { addExpense, metrics } = useData();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    purpose: '',
    category: 'other' as 'medical' | 'educational' | 'emergency' | 'events' | 'other',
    beneficiaryName: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.purpose) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount > metrics.availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Available balance is only ${formatCurrency(metrics.availableBalance)}`,
        variant: "destructive",
      });
      return;
    }

    addExpense({
      amount,
      date: formData.date,
      purpose: formData.purpose,
      category: formData.category,
      beneficiaryName: formData.beneficiaryName || undefined,
    });

    toast({
      title: "Expense Added Successfully",
      description: `${formatCurrency(amount)} has been recorded.`,
    });

    // Reset form
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      purpose: '',
      category: 'other',
      beneficiaryName: '',
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add Expense</h1>
              <p className="text-muted-foreground font-malayalam">ചെലവ് ചേർക്കുക</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(metrics.availableBalance)}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="form-section space-y-6">
          <div className="pb-4 border-b border-border">
            <h2 className="text-lg font-semibold">Expense Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter expense amount"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span>{cat.label}</span>
                      <span className="text-xs text-muted-foreground ml-2 font-malayalam">({cat.malayalam})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiaryName">Beneficiary Name (Optional)</Label>
              <Input
                id="beneficiaryName"
                placeholder="Name of the beneficiary"
                value={formData.beneficiaryName}
                onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                className="font-malayalam"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="purpose">
                Purpose / Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of this expense"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Supporting Documents (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG (max 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" size="lg" className="gap-2">
              <Check className="w-5 h-5" />
              Record Expense
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
