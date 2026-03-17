import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import { getChildModules } from '@/data/modules';
import { useAuthStore } from '@/store/authStore';

interface Module3ExpandPanelProps {
  expanded: boolean;
  onToggle: () => void;
}

export function Module3ExpandPanel({ expanded, onToggle }: Module3ExpandPanelProps) {
  const navigate = useNavigate();
  const { allowedModules, isAdmin } = useAuthStore();
  
  const childModules = getChildModules('3');
  
  // Filter child modules based on permissions
  const accessibleChildren = childModules.filter((m) => {
    if (isAdmin || allowedModules.includes('all')) return true;
    return allowedModules.includes(m.id);
  });

  if (accessibleChildren.length === 0) return null;

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 h-auto"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Hammadde / Malzeme Depo Alt Modülleri</div>
            <div className="text-sm text-gray-500">Alt modülleri görüntülemek için tıklayın</div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </Button>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {accessibleChildren.map((module) => (
            <Card
              key={module.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-blue-500"
              onClick={() => navigate(module.route)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{module.title}</div>
                    <div className="text-sm text-gray-500">{module.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
