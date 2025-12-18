import { Card } from '@/ui/card';

const InventoryPage = () => {
  return (
    <div className="grid justify-items-center gap-10 *:aspect-video *:w-1/2">
      <Card>Default</Card>
      <Card variant="clear">Clear</Card>
      <Card variant="ghost">Ghost</Card>
      <Card variant="tinted">Tinted</Card>
      <Card variant="opaque">Opaque</Card>
    </div>
  );
};

export default InventoryPage;
