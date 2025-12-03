import { useState } from 'react';
import { Check, ChevronDown, Plus, Store, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useShop, CreateShopData } from '@/contexts/ShopContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const ShopSelector = () => {
  const { shops, selectedShop, setSelectedShop, createShop, canCreateShop, remainingShops, shopLimit } = useShop();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateShopData>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const navigate = useNavigate();

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Shop name is required', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    const result = await createShop(formData);
    setIsCreating(false);

    if (result.success) {
      toast({ title: 'Shop created successfully' });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', address: '', phone: '', email: '' });
    } else if (result.error === 'SHOP_LIMIT_REACHED') {
      setIsCreateDialogOpen(false);
      setIsUpgradeDialogOpen(true);
    } else {
      toast({ title: result.error || 'Failed to create shop', variant: 'destructive' });
    }
  };

  const handleAddShopClick = () => {
    if (canCreateShop) {
      setIsCreateDialogOpen(true);
    } else {
      setIsUpgradeDialogOpen(true);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 min-w-[180px] justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <span className="truncate max-w-[120px]">{selectedShop?.name || 'Select Shop'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-popover">
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {shops.length} of {shopLimit} shops used
          </div>
          <DropdownMenuSeparator />
          {shops.map((shop) => (
            <DropdownMenuItem
              key={shop.id}
              onClick={() => setSelectedShop(shop)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span className="truncate">{shop.name}</span>
              </div>
              {selectedShop?.id === shop.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleAddShopClick}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              !canCreateShop && 'text-muted-foreground'
            )}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Shop</span>
            {!canCreateShop && (
              <span className="ml-auto text-xs text-amber-500">Limit reached</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate('/shops')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Manage All Shops</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Shop Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shop</DialogTitle>
            <DialogDescription>
              Add a new shop to your account. You can create up to {shopLimit} shops.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateShop} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name *</Label>
              <Input
                id="shopName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Retail Store"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopAddress">Address</Label>
              <Input
                id="shopAddress"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shopPhone">Phone</Label>
                <Input
                  id="shopPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-0123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopEmail">Email</Label>
                <Input
                  id="shopEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="shop@example.com"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Shop'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Upgrade Your Plan
            </DialogTitle>
            <DialogDescription>
              You've reached the maximum of {shopLimit} shops on your current plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Upgrade to a premium plan to unlock:
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Unlimited shops
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Priority support
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsUpgradeDialogOpen(false)}>
                Maybe Later
              </Button>
              <Button className="flex-1" onClick={() => {
                toast({ title: 'Billing coming soon', description: 'Plan upgrade feature is under development.' });
                setIsUpgradeDialogOpen(false);
              }}>
                Upgrade Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
