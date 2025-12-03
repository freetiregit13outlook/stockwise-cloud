import { useState } from 'react';
import { Plus, Edit, Trash2, Store, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useShop, CreateShopData } from '@/contexts/ShopContext';
import { Shop } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Shops() {
  const { shops, selectedShop, setSelectedShop, createShop, updateShop, deleteShop, canCreateShop, shopLimit, remainingShops } = useShop();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [deletingShop, setDeletingShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateShopData>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const resetForm = () => {
    setFormData({ name: '', address: '', phone: '', email: '' });
    setEditingShop(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    const result = await createShop(formData);
    setIsLoading(false);

    if (result.success) {
      toast({ title: 'Shop created successfully' });
      setIsCreateDialogOpen(false);
      resetForm();
    } else {
      toast({ title: result.error || 'Failed to create shop', variant: 'destructive' });
    }
  };

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      address: shop.address || '',
      phone: shop.phone || '',
      email: shop.email || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop || !formData.name.trim()) return;

    setIsLoading(true);
    const result = await updateShop(editingShop.id, formData);
    setIsLoading(false);

    if (result.success) {
      toast({ title: 'Shop updated successfully' });
      setIsEditDialogOpen(false);
      resetForm();
    } else {
      toast({ title: result.error || 'Failed to update shop', variant: 'destructive' });
    }
  };

  const handleDeleteClick = (shop: Shop) => {
    setDeletingShop(shop);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingShop) return;

    setIsLoading(true);
    const result = await deleteShop(deletingShop.id);
    setIsLoading(false);

    if (result.success) {
      toast({ title: 'Shop deleted successfully' });
    } else {
      toast({ title: result.error || 'Failed to delete shop', variant: 'destructive' });
    }
    setIsDeleteDialogOpen(false);
    setDeletingShop(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shops</h1>
          <p className="text-muted-foreground">
            Manage your shops • {shops.length} of {shopLimit} used
          </p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} disabled={!canCreateShop}>
          <Plus className="w-4 h-4 mr-2" />
          Add Shop
          {!canCreateShop && <span className="ml-2 text-xs">(Limit reached)</span>}
        </Button>
      </div>

      {/* Remaining shops indicator */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Shop Quota</p>
              <p className="text-sm text-muted-foreground">
                {remainingShops} shop{remainingShops !== 1 ? 's' : ''} remaining on your plan
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: shopLimit }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-8 rounded-sm',
                  i < shops.length ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Create Your First Shop</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first shop</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Shop
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className={cn(
                'bg-card rounded-xl border p-5 transition-all hover:shadow-md cursor-pointer',
                selectedShop?.id === shop.id ? 'border-primary ring-1 ring-primary' : 'border-border'
              )}
              onClick={() => setSelectedShop(shop)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    selectedShop?.id === shop.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                  )}>
                    <Store className={cn('w-5 h-5', selectedShop?.id === shop.id ? '' : 'text-primary')} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{shop.name}</h3>
                    {selectedShop?.id === shop.id && (
                      <span className="text-xs text-primary">Active</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(shop)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(shop)}
                    disabled={shops.length <= 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {shop.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{shop.address}</span>
                  </div>
                )}
                {shop.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{shop.phone}</span>
                  </div>
                )}
                {shop.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{shop.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t border-border">
                  <Calendar className="w-4 h-4" />
                  <span>Created {format(new Date(shop.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Shop Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shop</DialogTitle>
            <DialogDescription>
              Add a new shop to your account ({remainingShops} remaining)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Shop'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Shop Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shop</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Shop Name *</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddress">Address</Label>
              <Input
                id="editAddress"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingShop?.name}"? This will also delete all products, inventory, and sales data for this shop. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? 'Deleting...' : 'Delete Shop'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
