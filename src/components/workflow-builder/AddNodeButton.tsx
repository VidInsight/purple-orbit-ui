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
  Bell,
  Search,
  Clock,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

interface NodeType {
  name: string;
  icon: LucideIcon;
  description: string;
}

interface Subcategory {
  name: string;
  icon: LucideIcon;
  nodes: NodeType[];
}

interface Category {
  name: string;
  icon: LucideIcon;
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
          { name: 'GPT-4 Completion', icon: MessageSquare, description: 'Generate text using GPT-4' },
          { name: 'DALL-E Image', icon: Image, description: 'Create AI-generated images' },
          { name: 'Embeddings', icon: Hash, description: 'Convert text to vector embeddings' },
        ],
      },
      {
        name: 'Anthropic',
        icon: Circle,
        nodes: [
          { name: 'Claude', icon: MessageSquare, description: 'Chat with Claude AI model' },
          { name: 'Claude Instant', icon: Zap, description: 'Fast Claude responses' },
        ],
      },
      {
        name: 'Google AI',
        icon: Circle,
        nodes: [
          { name: 'Gemini', icon: Sparkles, description: 'Google\'s multimodal AI' },
          { name: 'PaLM', icon: Brain, description: 'Google\'s language model' },
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
          { name: 'JSON Parse', icon: FileJson, description: 'Parse JSON strings to objects' },
          { name: 'Text Replace', icon: Type, description: 'Find and replace text' },
          { name: 'Date Format', icon: Calendar, description: 'Format dates and times' },
        ],
      },
      {
        name: 'Filter',
        icon: Filter,
        nodes: [
          { name: 'Filter Array', icon: Filter, description: 'Filter array items by condition' },
          { name: 'Remove Duplicates', icon: Trash2, description: 'Remove duplicate values' },
          { name: 'Conditional Filter', icon: Target, description: 'Advanced filtering logic' },
        ],
      },
      {
        name: 'Aggregate',
        icon: TrendingUp,
        nodes: [
          { name: 'Sum', icon: PlusCircle, description: 'Calculate sum of numbers' },
          { name: 'Average', icon: BarChart3, description: 'Calculate average value' },
          { name: 'Count', icon: Hash, description: 'Count array items' },
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
          { name: 'If/Else', icon: GitBranch, description: 'Branch workflow based on condition' },
          { name: 'Switch', icon: Shuffle, description: 'Multiple conditional branches' },
          { name: 'Compare', icon: Target, description: 'Compare values' },
        ],
      },
      {
        name: 'Loops',
        icon: Repeat,
        nodes: [
          { name: 'For Each', icon: Repeat, description: 'Loop through array items' },
          { name: 'While', icon: RotateCw, description: 'Loop while condition is true' },
          { name: 'Repeat', icon: Repeat, description: 'Repeat action N times' },
        ],
      },
      {
        name: 'Branches',
        icon: Split,
        nodes: [
          { name: 'Split', icon: Split, description: 'Split workflow into branches' },
          { name: 'Merge', icon: Merge, description: 'Merge multiple branches' },
          { name: 'Parallel', icon: Layers, description: 'Execute actions in parallel' },
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
          { name: 'GET Request', icon: Download, description: 'Fetch data from API' },
          { name: 'POST Request', icon: Upload, description: 'Send data to API' },
          { name: 'Webhook', icon: Bell, description: 'Receive webhook triggers' },
        ],
      },
      {
        name: 'Database',
        icon: Database,
        nodes: [
          { name: 'Query', icon: Filter, description: 'Query database records' },
          { name: 'Insert', icon: PlusCircle, description: 'Insert new records' },
          { name: 'Update', icon: Type, description: 'Update existing records' },
        ],
      },
      {
        name: 'Email',
        icon: Mail,
        nodes: [
          { name: 'Send Email', icon: Upload, description: 'Send email messages' },
          { name: 'Parse Email', icon: FileJson, description: 'Parse email content' },
        ],
      },
    ],
  },
];

interface AddNodeButtonProps {
  onAddNode: (category: string, subcategory: string, node: string) => void;
  onMenuOpen?: () => void;
}

export const AddNodeButton = ({ onAddNode, onMenuOpen }: AddNodeButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openSubcategory, setOpenSubcategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentlyUsed, setRecentlyUsed] = useState<Array<{
    categoryName: string;
    subcategoryName: string;
    nodeName: string;
    nodeDescription: string;
  }>>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load recently used nodes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentlyUsedNodes');
    if (stored) {
      try {
        setRecentlyUsed(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently used nodes:', e);
      }
    }
  }, []);

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
    setSearchTerm('');
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
    // Find the node details
    const category = categories.find(c => c.name === categoryName);
    const subcategory = category?.subcategories.find(sc => sc.name === subcategoryName);
    const node = subcategory?.nodes.find(n => n.name === nodeName);

    if (node) {
      // Update recently used (don't store icon, we'll look it up when rendering)
      const newRecentlyUsed = [
        { categoryName, subcategoryName, nodeName, nodeDescription: node.description },
        ...recentlyUsed.filter(item => item.nodeName !== nodeName)
      ].slice(0, 5); // Keep only 5 most recent
      
      setRecentlyUsed(newRecentlyUsed);
      localStorage.setItem('recentlyUsedNodes', JSON.stringify(newRecentlyUsed));
    }

    onAddNode(categoryName, subcategoryName, nodeName);
    handleClose();
  };

  // Filter categories based on search term
  const filteredCategories = searchTerm
    ? categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          nodes: subcategory.nodes.filter(node =>
            node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        })).filter(subcategory => subcategory.nodes.length > 0)
      })).filter(category => category.subcategories.length > 0)
    : categories;

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const newState = !isOpen;
          setIsOpen(newState);
          if (newState && onMenuOpen) {
            onMenuOpen();
          }
        }}
        className="h-10 w-10 p-0 rounded-full bg-primary/10 border-2 border-primary/30 hover:border-primary hover:bg-primary/20 transition-all duration-200"
      >
        <Plus className="h-5 w-5 text-primary" />
      </Button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-12 w-[640px] bg-surface border border-border rounded-lg shadow-xl z-[100] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-accent/10 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Add Node</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Select a node to add to your workflow</p>
            
            {/* Search Input */}
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm bg-background border-border"
              />
            </div>
          </div>

          {/* Content - Accordion Style */}
          <div className="max-h-96 overflow-y-auto bg-surface">
            {/* Recently Used Section */}
            {!searchTerm && recentlyUsed.length > 0 && (
              <div className="border-b border-border">
                <div className="px-4 py-2 bg-accent/5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recently Used</span>
                  </div>
                </div>
                <div className="bg-surface">
                  {recentlyUsed.map((item, index) => {
                    // Find the icon from categories
                    const category = categories.find(c => c.name === item.categoryName);
                    const subcategory = category?.subcategories.find(sc => sc.name === item.subcategoryName);
                    const node = subcategory?.nodes.find(n => n.name === item.nodeName);
                    const NodeIcon = node?.icon || Settings; // Fallback to Settings icon
                    
                    return (
                      <button
                        key={`${item.nodeName}-${index}`}
                        onClick={() => handleNodeClick(item.categoryName, item.subcategoryName, item.nodeName)}
                        className="w-full pl-4 pr-4 py-2.5 flex items-start gap-3 hover:bg-accent/30 transition-colors text-left group"
                      >
                        <NodeIcon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.nodeName}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item.nodeDescription}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categories */}
            {filteredCategories.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                No nodes found matching "{searchTerm}"
              </div>
            ) : (
              filteredCategories.map((category) => {
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
                                        className="w-full pl-14 pr-4 py-2.5 flex items-start gap-3 hover:bg-accent/30 transition-colors text-left group"
                                      >
                                        <NodeIcon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                            {node.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                            {node.description}
                                          </div>
                                        </div>
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
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
