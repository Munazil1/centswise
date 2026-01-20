import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Plus, Search, PackageCheck, AlertTriangle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Property() {
  const { items, distributions, addItem, distributeItem, returnItem } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showDistribute, setShowDistribute] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    totalQuantity: '',
    availableQuantity: '',
    condition: 'good' as const,
    location: '',
    description: '',
  });

  const [distributeData, setDistributeData] = useState({
    itemId: '',
    quantity: '',
    recipientName: '',
    recipientContact: '',
    expectedReturnDate: '',
  });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDistributions = distributions.filter(d => d.status !== 'returned');

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.totalQuantity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const qty = parseInt(newItem.totalQuantity);
      await addItem({
        name: newItem.name,
        category: newItem.category,
        totalQuantity: qty,
        availableQuantity: qty,
        condition: newItem.condition,
        location: newItem.location,
        description: newItem.description,
      });

      toast({
        title: "Item Added",
        description: `${newItem.name} has been added to inventory and saved to database.`,
      });

      setNewItem({
        name: '',
        category: '',
        totalQuantity: '',
        availableQuantity: '',
        condition: 'good',
        location: '',
        description: '',
      });
      setShowAddItem(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDistribute = () => {
    if (!distributeData.itemId || !distributeData.quantity || !distributeData.recipientName || !distributeData.recipientContact) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const item = items.find(i => i.id === distributeData.itemId);
    if (!item) return;

    const qty = parseInt(distributeData.quantity);
    if (qty > item.availableQuantity) {
      toast({
        title: "Insufficient Quantity",
        description: `Only ${item.availableQuantity} available.`,
        variant: "destructive",
      });
      return;
    }

    distributeItem({
      itemId: distributeData.itemId,
      itemName: item.name,
      quantity: qty,
      recipientName: distributeData.recipientName,
      recipientContact: distributeData.recipientContact,
      distributedDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: distributeData.expectedReturnDate || undefined,
    });

    toast({
      title: "Item Distributed",
      description: `${qty}x ${item.name} distributed to ${distributeData.recipientName}.`,
    });

    setDistributeData({
      itemId: '',
      quantity: '',
      recipientName: '',
      recipientContact: '',
      expectedReturnDate: '',
    });
    setShowDistribute(false);
  };

  const handleReturn = (distributionId: string) => {
    returnItem(distributionId, 'Good condition');
    toast({
      title: "Item Returned",
      description: "The item has been marked as returned.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Property Management</h1>
              <p className="text-muted-foreground font-malayalam">വസ്തു നിയന്ത്രണം</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={showDistribute} onOpenChange={setShowDistribute}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <PackageCheck className="w-4 h-4" />
                  Distribute
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Distribute Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Select Item</Label>
                    <Select value={distributeData.itemId} onValueChange={(v) => setDistributeData(prev => ({ ...prev, itemId: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.filter(i => i.availableQuantity > 0).map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.availableQuantity} available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={distributeData.quantity}
                      onChange={(e) => setDistributeData(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Name</Label>
                    <Input
                      value={distributeData.recipientName}
                      onChange={(e) => setDistributeData(prev => ({ ...prev, recipientName: e.target.value }))}
                      className="font-malayalam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <Input
                      value={distributeData.recipientContact}
                      onChange={(e) => setDistributeData(prev => ({ ...prev, recipientContact: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Return Date</Label>
                    <Input
                      type="date"
                      value={distributeData.expectedReturnDate}
                      onChange={(e) => setDistributeData(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleDistribute} className="w-full">Distribute</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Item Name</Label>
                      <Input
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={newItem.category}
                        onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={newItem.totalQuantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, totalQuantity: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select value={newItem.condition} onValueChange={(v: any) => setNewItem(prev => ({ ...prev, condition: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="needs_repair">Needs Repair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={newItem.location}
                      onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleAddItem} className="w-full">Add Item</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="distributed">
              Distributed
              {activeDistributions.length > 0 && (
                <span className="ml-2 bg-warning/20 text-warning text-xs px-2 py-0.5 rounded-full">
                  {activeDistributions.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full capitalize",
                      item.condition === 'excellent' && "bg-success/10 text-success",
                      item.condition === 'good' && "bg-primary/10 text-primary",
                      item.condition === 'fair' && "bg-warning/10 text-warning",
                      item.condition === 'needs_repair' && "bg-destructive/10 text-destructive"
                    )}>
                      {item.condition.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-lg font-bold text-foreground">{item.totalQuantity}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="p-2 bg-success/10 rounded-lg">
                      <p className="text-lg font-bold text-success">{item.availableQuantity}</p>
                      <p className="text-xs text-success">Available</p>
                    </div>
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <p className="text-lg font-bold text-warning">{item.distributedQuantity}</p>
                      <p className="text-xs text-warning">Out</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">📍 {item.location}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="distributed" className="mt-6">
            <div className="data-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date Out</TableHead>
                    <TableHead>Return By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDistributions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No items currently distributed
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeDistributions.map(dist => (
                      <TableRow key={dist.id}>
                        <TableCell className="font-medium">{dist.itemName}</TableCell>
                        <TableCell>{dist.quantity}</TableCell>
                        <TableCell className="font-malayalam">{dist.recipientName}</TableCell>
                        <TableCell>{dist.recipientContact}</TableCell>
                        <TableCell>{format(new Date(dist.distributedDate), 'dd MMM')}</TableCell>
                        <TableCell>
                          {dist.expectedReturnDate ? format(new Date(dist.expectedReturnDate), 'dd MMM') : '-'}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            dist.status === 'distributed' && "status-distributed",
                            dist.status === 'overdue' && "bg-destructive/10 text-destructive"
                          )}>
                            {dist.status === 'overdue' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                            {dist.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleReturn(dist.id)}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Return
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
