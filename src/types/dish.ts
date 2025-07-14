export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDishInput {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

export interface UpdateDishInput extends CreateDishInput {
  id: string;
}

export type DishCategory = 'appetizers' | 'mains' | 'desserts' | 'beverages' | 'salads' | 'soups';

export const DISH_CATEGORIES: { value: DishCategory; label: string }[] = [
  { value: 'appetizers', label: 'Appetizers' },
  { value: 'mains', label: 'Main Courses' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'salads', label: 'Salads' },
  { value: 'soups', label: 'Soups' },
];