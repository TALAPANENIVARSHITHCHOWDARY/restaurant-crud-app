import { Loader2, ChefHat } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center">
        <div className="relative mb-8">
          <ChefHat className="h-16 w-16 text-primary mx-auto animate-bounce-gentle" />
          <Loader2 className="h-8 w-8 text-primary-glow absolute -bottom-2 -right-2 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Loading Menu</h2>
        <p className="text-muted-foreground">Preparing your delicious dishes...</p>
      </div>
    </div>
  );
};