import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ReceiptPreview } from '@/components/receipt/ReceiptPreview';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Receipt, Download, Printer, Mail, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Credit } from '@/types';
import api from '@/lib/api';

export default function AddCredit() {
  const { addCredit, getNextReceiptNumber } = useData();
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    donorName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    purpose: '',
    paymentMethod: 'cash' as 'cash' | 'bank_transfer' | 'online',
    contactInfo: '',
  });
  
  const [showReceipt, setShowReceipt] = useState(false);
  const [generatedCredit, setGeneratedCredit] = useState<Credit | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.donorName || !formData.amount || !formData.purpose) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to backend API
      const apiResult = await api.addCredit({
        donor_name: formData.donorName,
        amount: parseFloat(formData.amount),
        date: formData.date,
        purpose: formData.purpose,
        payment_method: formData.paymentMethod,
        contact_info: formData.contactInfo || undefined,
      });

      if (apiResult.error) {
        toast({
          title: "Error",
          description: apiResult.error,
          variant: "destructive",
        });
        return;
      }

      // Also save locally for UI
      const credit = addCredit({
        donorName: formData.donorName,
        amount: parseFloat(formData.amount),
        date: formData.date,
        purpose: formData.purpose,
        paymentMethod: formData.paymentMethod,
        contactInfo: formData.contactInfo || undefined,
      });

      // Store the backend credit ID for downloading
      if (apiResult.data?.credit?.id) {
        credit.id = apiResult.data.credit.id;
      }

      setGeneratedCredit(credit);
      setShowReceipt(true);
      
      // Reset form
      setFormData({
        donorName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        purpose: '',
        paymentMethod: 'cash',
        contactInfo: '',
      });

      toast({
        title: "Credit Added Successfully",
        description: `Receipt ${credit.serialNumber} generated and saved to database.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save credit to database.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!generatedCredit) return;
    
    try {
      // First, generate the receipt on backend
      const result = await api.generateReceipt(generatedCredit.id);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Then download it
      if (result.data?.receipt?.id) {
        const downloadResult = await api.downloadReceipt(result.data.receipt.id);
        
        if (downloadResult.error) {
          toast({
            title: "Error",
            description: downloadResult.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Receipt downloaded successfully.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download receipt.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add Credit</h1>
            <p className="text-muted-foreground font-malayalam">സംഭാവന ചേർക്കുക</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="form-section space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h2 className="text-lg font-semibold">Donation Details</h2>
            <p className="text-sm text-muted-foreground">
              Next Receipt: <span className="font-mono font-medium text-foreground">{getNextReceiptNumber()}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="donorName">
                Donor Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="donorName"
                placeholder="Enter donor's name (ദാതാവിന്റെ പേര്)"
                value={formData.donorName}
                onChange={(e) => setFormData(prev => ({ ...prev, donorName: e.target.value }))}
                className="font-malayalam"
              />
              <p className="text-xs text-muted-foreground">This will appear on the receipt</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
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
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="purpose">
                Purpose / Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="purpose"
                placeholder="Enter the purpose of this donation"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contactInfo">Contact Info (Optional)</Label>
              <Input
                id="contactInfo"
                placeholder="Phone number or email"
                value={formData.contactInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" size="lg" className="gap-2">
              <Check className="w-5 h-5" />
              Save & Generate Receipt
            </Button>
          </div>
        </form>

        {/* Receipt Dialog */}
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-md max-h-[90vh] p-4 flex flex-col">
            <DialogHeader className="pb-2 flex-shrink-0">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Receipt className="w-4 h-4 text-success" />
                Receipt Generated
              </DialogTitle>
              <DialogDescription className="text-xs">
                Receipt has been created and saved successfully.
              </DialogDescription>
            </DialogHeader>

            {generatedCredit && (
              <>
                <div className="overflow-y-auto flex-1 -mx-4 px-4">
                  <ReceiptPreview ref={receiptRef} credit={generatedCredit} />
                </div>
                
                <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-border flex-shrink-0">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handlePrint}>
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownload}>
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
