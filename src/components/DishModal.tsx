import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';
import { CreateDishInput, UpdateDishInput, Dish, DISH_CATEGORIES } from '@/types/dish';
import { validateImageUrl, validatePrice } from '@/lib/security';

const dishSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0').max(9999.99, 'Price must be less than $10000'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().refine((url) => {
    if (!url) return true;
    const validation = validateImageUrl(url);
    return validation.isValid;
  }, 'Please enter a valid image URL'),
});

type DishFormData = z.infer<typeof dishSchema>;

interface DishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDishInput | UpdateDishInput) => Promise<void>;
  title: string;
  dish?: Dish | null;
}

export const DishModal = ({ isOpen, onClose, onSubmit, title, dish }: DishModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const form = useForm<DishFormData>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
    },
  });

  // Update form when dish changes (for editing)
  useEffect(() => {
    if (dish) {
      form.reset({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        imageUrl: dish.imageUrl,
      });
      setImagePreview(dish.imageUrl);
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        category: '',
        imageUrl: '',
      });
      setImagePreview('');
    }
  }, [dish, form]);

  const handleSubmit = async (data: DishFormData) => {
    setIsSubmitting(true);
    try {
      // Validate price
      const priceValidation = validatePrice(data.price);
      if (!priceValidation.isValid) {
        form.setError('price', { message: priceValidation.error });
        return;
      }

      // Validate image URL
      if (data.imageUrl) {
        const imageValidation = validateImageUrl(data.imageUrl);
        if (!imageValidation.isValid) {
          form.setError('imageUrl', { message: 'Please enter a valid image URL' });
          return;
        }
        data.imageUrl = imageValidation.sanitized;
      }

      if (dish) {
        await onSubmit({ ...data, id: dish.id } as UpdateDishInput);
      } else {
        await onSubmit(data as CreateDishInput);
      }
      form.reset();
      setImagePreview('');
    } catch (error) {
      console.error('Error submitting dish:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url);
  };

  const handleClose = () => {
    form.reset();
    setImagePreview('');
    onClose();
  };

  const suggestedImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" aria-describedby="dish-form-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">{title}</DialogTitle>
          <p id="dish-form-description" className="sr-only">
            {dish ? 'Edit dish details including name, description, price, category, and image' : 'Create a new dish by filling out the form below'}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dish Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter dish name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DISH_CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your dish..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        handleImageUrlChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border"
                  onError={() => setImagePreview('')}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview('');
                    form.setValue('imageUrl', '');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Suggested Images */}
            <div className="space-y-2">
              <FormLabel>Quick Image Options</FormLabel>
              <div className="grid grid-cols-4 gap-2">
                {suggestedImages.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    className="relative h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                    onClick={() => {
                      form.setValue('imageUrl', url);
                      setImagePreview(url);
                    }}
                  >
                    <img
                      src={url}
                      alt={`Suggested ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {dish ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {dish ? 'Update Dish' : 'Create Dish'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};