import { Card } from '@/ui/card';

const InventoryPage = () => {
  return (
    <div className="grid justify-items-center gap-10 *:aspect-video *:w-1/3">
      <div className="bg-glass-surface shadow-glass border-glass-stroke backdrop-filter-(--backdrop-glass) rounded-xl border"></div>
      <Card></Card>
    </div>
  );
};

export default InventoryPage;
