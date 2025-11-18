import { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Brain,
  Zap,
  Circle,
  Sparkles,
  MessageSquare,
  Image,
  Hash,
  Settings,
  RotateCw,
  FileJson,
  Type,
  Calendar,
  Filter,
  Trash2,
  Target,
  TrendingUp,
  PlusCircle,
  BarChart3,
  GitBranch,
  HelpCircle,
  Repeat,
  Shuffle,
  Split,
  Merge,
  Layers,
  Plug,
  Globe,
  Database,
  Mail,
  Download,
  Upload,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NodeType {
  name: string;
  icon: any;
}

interface Subcategory {
  name: string;
  icon: any;
  nodes: NodeType[];
}

interface Category {
  name: string;
  icon: any;
  subcategories: Subcategory[];
}

const categories: Category[] = [
  {
    name: 'AI Models',
    icon: Brain,
    subcategories: [
      {
        name: 'OpenAI',
        icon: Circle,
        nodes: [
          { name: 'GPT-4 Completion', icon: MessageSquare },
          { name: 'DALL-E Image', icon: Image },
          { name: 'Embeddings', icon: Hash },
        ],
      },
      {
        name: 'Anthropic',
        icon: Circle,
        nodes: [
          { name: 'Claude', icon: MessageSquare },
          { name: 'Claude Instant', icon: Zap },
        ],
      },
      {
        name: 'Google AI',
        icon: Circle,
        nodes: [
          { name: 'Gemini', icon: Sparkles },
          { name: 'PaLM', icon: Brain },
        ],
      },
    ],
  },
  {
    name: 'Data Processing',
    icon: Settings,
    subcategories: [
      {
        name: 'Transform',
        icon: RotateCw,
        nodes: [
          { name: 'JSON Parse', icon: FileJson },
          { name: 'Text Replace', icon: Type },
          { name: 'Date Format', icon: Calendar },
        ],
      },
      {
        name: 'Filter',
        icon: Filter,
        nodes: [
          { name: 'Filter Array', icon: Filter },
          { name: 'Remove Duplicates', icon: Trash2 },
          { name: 'Conditional Filter', icon: Target },
        ],
      },
      {
        name: 'Aggregate',
        icon: TrendingUp,
        nodes: [
          { name: 'Sum', icon: PlusCircle },
          { name: 'Average', icon: BarChart3 },
          { name: 'Count', icon: Hash },
        ],
      },
    ],
  },
  {
    name: 'Logic & Flow',
    icon: GitBranch,
    subcategories: [
      {
        name: 'Conditions',
        icon: HelpCircle,
        nodes: [
          { name: 'If/Else', icon: GitBranch },
          { name: 'Switch', icon: Shuffle },
          { name: 'Compare', icon: Target },
        ],
      },
      {
        name: 'Loops',
        icon: Repeat,
        nodes: [
          { name: 'For Each', icon: Repeat },
          { name: 'While', icon: RotateCw },
          { name: 'Repeat', icon: Repeat },
        ],
      },
      {
        name: 'Branches',
        icon: Split,
        nodes: [
          { name: 'Split', icon: Split },
          { name: 'Merge', icon: Merge },
          { name: 'Parallel', icon: Layers },
        ],
      },
    ],
  },
  {
    name: 'Integrations',
    icon: Plug,
    subcategories: [
      {
        name: 'HTTP',
        icon: Globe,
        nodes: [
          { name: 'GET Request', icon: Download },
          { name: 'POST Request', icon: Upload },
          { name: 'Webhook', icon: Bell },
        ],
      },
      {
        name: 'Database',
        icon: Database,
        nodes: [
          { name: 'Query', icon: Filter },
          { name: 'Insert', icon: PlusCircle },
          { name: 'Update', icon: Type },
        ],
      },
      {
        name: 'Email',
        icon: Mail,
        nodes: [
          { name: 'Send Email', icon: Upload },
          { name: 'Parse Email', icon: FileJson },
        ],
      },
    ],
  },
];

interface AddNodeButtonProps {
  onAddNode: (category: string, subcategory: string, node: string) => void;
}

export const AddNodeButton = ({ onAddNode }: AddNodeButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openSubcategory, setOpenSubcategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setOpenCategory(null);
    setOpenSubcategory(null);
  };

  const toggleCategory = (categoryName: string) => {
    if (openCategory === categoryName) {
      setOpenCategory(null);
      setOpenSubcategory(null);
    } else {
      setOpenCategory(categoryName);
      setOpenSubcategory(null);
    }
  };

  const toggleSubcategory = (subcategoryName: string) => {
    if (openSubcategory === subcategoryName) {
      setOpenSubcategory(null);
    } else {
      setOpenSubcategory(subcategoryName);
    }
  };

  const handleNodeClick = (categoryName: string, subcategoryName: string, nodeName: string) => {
    onAddNode(categoryName, subcategoryName, nodeName);
    handleClose();
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 p-0 rounded-full bg-primary/10 border-2 border-primary/30 hover:border-primary hover:bg-primary/20 transition-all duration-200"
      >
        <Plus className="h-5 w-5 text-primary" />
      </Button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-12 w-[320px] bg-surface border border-border rounded-lg shadow-xl z-[100] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-accent/10 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Add Node</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Select a node to add to your workflow</p>
          </div>

          {/* Content - Accordion Style */}
          <div className="max-h-96 overflow-y-auto bg-surface">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <div key={category.name} className="border-b border-border last:border-b-0">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full pl-4 pr-4 py-2.5 flex items-center justify-between hover:bg-accent/30 transition-colors bg-surface"
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground whitespace-nowrap">{category.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        openCategory === category.name ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Subcategories */}
                  {openCategory === category.name && (
                    <div className="bg-surface">
                      {category.subcategories.map((subcategory) => {
                        const SubcategoryIcon = subcategory.icon;
                        return (
                          <div key={subcategory.name} className="border-t border-border/50">
                            {/* Subcategory Header */}
                            <button
                              onClick={() => toggleSubcategory(subcategory.name)}
                              className="w-full pl-8 pr-4 py-2 flex items-center justify-between hover:bg-accent/20 transition-colors bg-surface"
                            >
                              <div className="flex items-center gap-3">
                                <SubcategoryIcon className="h-4 w-4 text-accent-foreground flex-shrink-0" />
                                <span className="text-sm text-foreground whitespace-nowrap">{subcategory.name}</span>
                              </div>
                              <ChevronRight
                                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                                  openSubcategory === subcategory.name ? 'rotate-90' : ''
                                }`}
                              />
                            </button>

                            {/* Nodes */}
                            {openSubcategory === subcategory.name && (
                              <div className="bg-surface">
                                {subcategory.nodes.map((node) => {
                                  const NodeIcon = node.icon;
                                  return (
                                    <button
                                      key={node.name}
                                      onClick={() => handleNodeClick(category.name, subcategory.name, node.name)}
                                      className="w-full pl-12 pr-4 py-2 flex items-center gap-3 hover:bg-primary/10 hover:text-primary transition-colors text-left group bg-surface"
                                    >
                                      <NodeIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                      <span className="text-sm text-foreground whitespace-nowrap">{node.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
