import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DishCard } from '@/components/DishCard';
import { DishModal } from '@/components/DishModal';
import { DeleteDishDialog } from '@/components/DeleteDishDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText, RateLimiter } from '@/lib/security';
import { Dish, CreateDishInput, UpdateDishInput, DISH_CATEGORIES } from '@/types/dish';

// Mock data - replace with Apollo Client GraphQL calls
const mockDishes: Dish[] = [
  {
    id: '1',
    name: 'Truffle Risotto',
    description: 'Creamy arborio rice with black truffle, parmesan, and wild mushrooms',
    price: 28.99,
    category: 'mains',
    imageUrl: 'https://images.unsplash.com/photo-1582209853949-1b5e8c3a5d3e?auto=format&fit=crop&w=400',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with herb butter and roasted vegetables',
    price: 32.50,
    category: 'mains',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400',
    createdAt: '2024-01-15T11:15:00Z',
    updatedAt: '2024-01-15T11:15:00Z'
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with homemade croutons, parmesan, and caesar dressing',
    price: 16.99,
    category: 'salads',
    imageUrl: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=400',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    price: 12.99,
    category: 'desserts',
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=400',
    createdAt: '2024-01-15T13:45:00Z',
    updatedAt: '2024-01-15T13:45:00Z'
  },
  {
    id: '5',
    name: 'Craft Beer Selection',
    description: 'Local craft beer on tap - ask server for today\'s selection',
    price: 8.99,
    category: 'beverages',
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400',
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-15T14:20:00Z'
  },
  {
    id: '6',
    name: 'Butternut Squash Soup',
    description: 'Creamy roasted butternut squash soup with sage and pumpkin seeds',
    price: 9.99,
    category: 'soups',
    imageUrl: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=400',
    createdAt: '2024-01-15T15:10:00Z',
    updatedAt: '2024-01-15T15:10:00Z'
  }
];

const Index = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const { toast } = useToast();
  
  // Initialize rate limiter for operations
  const rateLimiter = useMemo(() => new RateLimiter(5, 60000), []);

  // Simulate loading and fetch data
  useEffect(() => {
    const fetchDishes = () => {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setDishes(mockDishes);
        setFilteredDishes(mockDishes);
        setLoading(false);
      }, 1000);
    };

    fetchDishes();
  }, []);

  // Filter dishes based on search term and category
  useEffect(() => {
    let filtered = dishes;

    if (searchTerm) {
      const sanitizedSearchTerm = sanitizeText(searchTerm.toLowerCase());
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(sanitizedSearchTerm) ||
        dish.description.toLowerCase().includes(sanitizedSearchTerm)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(dish => dish.category === selectedCategory);
    }

    setFilteredDishes(filtered);
  }, [dishes, searchTerm, selectedCategory]);

  // Mock GraphQL mutation: CREATE_DISH
  const handleCreateDish = async (input: CreateDishInput) => {
    if (!rateLimiter.checkLimit('create')) {
      toast({
        title: 'Rate limit exceeded',
        description: 'Please wait before creating another dish.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Sanitize input data
      const sanitizedInput = {
        ...input,
        name: sanitizeText(input.name),
        description: sanitizeText(input.description),
      };

      const newDish: Dish = {
        id: Date.now().toString(),
        ...sanitizedInput,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDishes(prev => [...prev, newDish]);
      setIsCreateModalOpen(false);
      toast({
        title: 'Success',
        description: `${sanitizedInput.name} has been added to the menu`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create dish',
        variant: 'destructive',
      });
    }
  };

  // Mock GraphQL mutation: UPDATE_DISH
  const handleUpdateDish = async (input: UpdateDishInput) => {
    if (!rateLimiter.checkLimit('update')) {
      toast({
        title: 'Rate limit exceeded',
        description: 'Please wait before updating another dish.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Sanitize input data
      const sanitizedInput = {
        ...input,
        name: sanitizeText(input.name),
        description: sanitizeText(input.description),
      };

      setDishes(prev => prev.map(dish => 
        dish.id === input.id 
          ? { ...dish, ...sanitizedInput, updatedAt: new Date().toISOString() }
          : dish
      ));
      setEditingDish(null);
      toast({
        title: 'Success',
        description: `${sanitizedInput.name} has been updated`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update dish',
        variant: 'destructive',
      });
    }
  };

  // Mock GraphQL mutation: DELETE_DISH
  const handleDeleteDish = async (id: string) => {
    if (!rateLimiter.checkLimit('delete')) {
      toast({
        title: 'Rate limit exceeded',
        description: 'Please wait before deleting another dish.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dishName = dishes.find(dish => dish.id === id)?.name;
      setDishes(prev => prev.filter(dish => dish.id !== id));
      setDishToDelete(null);
      toast({
        title: 'Success',
        description: `${dishName} has been removed from the menu`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete dish',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Restaurant Menu</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Dish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.slice(0, 100))}
              className="pl-10"
              maxLength={100}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {DISH_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dishes Grid */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No dishes found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Add your first dish to get started'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish, index) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onEdit={() => setEditingDish(dish)}
                onDelete={() => setDishToDelete(dish)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <DishModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDish}
        title="Add New Dish"
      />

      <DishModal
        isOpen={!!editingDish}
        onClose={() => setEditingDish(null)}
        onSubmit={handleUpdateDish}
        title="Edit Dish"
        dish={editingDish}
      />

      <DeleteDishDialog
        dish={dishToDelete}
        isOpen={!!dishToDelete}
        onClose={() => setDishToDelete(null)}
        onConfirm={handleDeleteDish}
      />
    </div>
  );
};

export default Index;
