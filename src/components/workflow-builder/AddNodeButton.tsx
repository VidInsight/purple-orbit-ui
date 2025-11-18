import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Category {
  name: string;
  subcategories: {
    name: string;
    nodes: string[];
  }[];
}

const categories: Category[] = [
  {
    name: 'AI',
    subcategories: [
      { name: 'Text', nodes: ['Text Generation', 'Text Completion', 'Text Summarization'] },
      { name: 'Image', nodes: ['Image Analysis', 'Image Generation', 'Object Detection'] },
      { name: 'Analysis', nodes: ['Sentiment Analysis', 'Entity Recognition', 'Classification'] },
    ],
  },
  {
    name: 'Data',
    subcategories: [
      { name: 'Transform', nodes: ['Map Data', 'Filter Data', 'Sort Data'] },
      { name: 'Process', nodes: ['Aggregate', 'Group By', 'Merge'] },
      { name: 'Validate', nodes: ['Validate Schema', 'Check Format', 'Clean Data'] },
    ],
  },
  {
    name: 'Logic',
    subcategories: [
      { name: 'Conditions', nodes: ['If/Else', 'Switch', 'Compare Values'] },
      { name: 'Loops', nodes: ['For Each', 'While Loop', 'Repeat'] },
      { name: 'Control', nodes: ['Break', 'Continue', 'Stop Workflow'] },
    ],
  },
  {
    name: 'Utilities',
    subcategories: [
      { name: 'Time', nodes: ['Delay', 'Schedule', 'Wait Until'] },
      { name: 'Communication', nodes: ['Send Email', 'Webhook', 'HTTP Request'] },
      { name: 'Storage', nodes: ['Save Data', 'Load Data', 'Delete Data'] },
    ],
  },
];

interface AddNodeButtonProps {
  onAddNode: (category: string, subcategory: string, node: string) => void;
}

export const AddNodeButton = ({ onAddNode }: AddNodeButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'categories' | 'subcategories' | 'nodes'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{ name: string; nodes: string[] } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        resetMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const resetMenu = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('subcategories');
  };

  const handleSubcategoryClick = (subcategory: { name: string; nodes: string[] }) => {
    setSelectedSubcategory(subcategory);
    setCurrentView('nodes');
  };

  const handleNodeClick = (node: string) => {
    if (selectedCategory && selectedSubcategory) {
      onAddNode(selectedCategory.name, selectedSubcategory.name, node);
      setIsOpen(false);
      resetMenu();
    }
  };

  const handleBack = () => {
    if (currentView === 'nodes') {
      setCurrentView('subcategories');
      setSelectedSubcategory(null);
    } else if (currentView === 'subcategories') {
      setCurrentView('categories');
      setSelectedCategory(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 p-0 rounded-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/10 transition-all duration-200"
      >
        <Plus className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-12 w-64 bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-accent/10 border-b border-border flex items-center justify-between">
            {currentView !== 'categories' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <h3 className="text-sm font-medium text-foreground">
              {currentView === 'categories' && 'Select Category'}
              {currentView === 'subcategories' && selectedCategory?.name}
              {currentView === 'nodes' && selectedSubcategory?.name}
            </h3>
            {currentView === 'categories' && <div className="w-12" />}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {currentView === 'categories' && (
              <div className="py-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors group"
                  >
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>
            )}

            {currentView === 'subcategories' && selectedCategory && (
              <div className="py-2">
                {selectedCategory.subcategories.map((subcategory) => (
                  <button
                    key={subcategory.name}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors group"
                  >
                    <span className="text-sm font-medium text-foreground">{subcategory.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>
            )}

            {currentView === 'nodes' && selectedSubcategory && (
              <div className="py-2">
                {selectedSubcategory.nodes.map((node) => (
                  <button
                    key={node}
                    onClick={() => handleNodeClick(node)}
                    className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm text-foreground">{node}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
