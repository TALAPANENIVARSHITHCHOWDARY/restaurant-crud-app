import { Edit, Trash2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dish, DISH_CATEGORIES } from '@/types/dish';

interface DishCardProps {
  dish: Dish;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

export const DishCard = ({ dish, onEdit, onDelete, index }: DishCardProps) => {
  const categoryLabel = DISH_CATEGORIES.find(cat => cat.value === dish.category)?.label || dish.category;

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1">{dish.name}</h3>
          <Badge variant="secondary" className="text-xs">
            {categoryLabel}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {dish.description}
        </p>
        
        <div className="flex items-center text-primary font-bold text-lg">
          <DollarSign className="h-4 w-4 mr-1" />
          {dish.price.toFixed(2)}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="flex-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};