import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Module } from '@/types';
import { 
  Package, 
  ClipboardList, 
  Warehouse, 
  ShoppingCart, 
  Truck, 
  Factory,
  CheckCircle,
  BarChart3,
  Settings,
  FileText,
  ChevronRight,
  FileBadge,
  BookOpen,
  Footprints
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  '1': FileText,
  '1a': ClipboardList,
  '1b': Truck,
  '1c': Warehouse,
  '1d': ClipboardList,
  '1e': Footprints,
  '1f': Package,
  '2': ClipboardList,
  '3': Warehouse,
  '3a': Package,
  '3b': Package,
  '4': ShoppingCart,
  '4a': FileText,
  '4b': BarChart3,
  '4c': Truck,
  '5': ShoppingCart,
  '6': Factory,
  '7': CheckCircle,
  '9': BarChart3,
  '10': Settings,
  '11': FileBadge,
  '11a': BookOpen,
  '11a1': FileText,
  '11a2': FileBadge,
  '11a3': Settings,
  '11a4': BarChart3,
};

interface ModuleCardProps {
  module: Module;
  isChild?: boolean;
}

export function ModuleCard({ module, isChild = false }: ModuleCardProps) {
  const navigate = useNavigate();
  const Icon = iconMap[module.id] || Package;

  const handleClick = () => {
    navigate(module.route);
  };

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
        ${isChild ? 'border-l-4 border-l-blue-500' : ''}
      `}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg bg-blue-50 ${isChild ? 'bg-blue-100' : ''}`}>
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            {module.hasChildren && (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
            {module.adminOnly && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                Admin
              </span>
            )}
          </div>
        </div>
        <CardTitle className={`mt-3 ${isChild ? 'text-base' : 'text-lg'}`}>
          {module.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{module.description}</p>
        <div className="mt-3 text-xs text-gray-400">
          Modül ID: {module.id}
        </div>
      </CardContent>
    </Card>
  );
}
