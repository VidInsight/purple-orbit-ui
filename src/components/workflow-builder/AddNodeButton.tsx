import { useState, useEffect } from 'react';
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
  LucideIcon,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getScripts, Script } from '@/services/scriptsApi';

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

// Icon mapping for categories and subcategories
const getCategoryIcon = (categoryName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'math': Settings,
    'ai': Brain,
    'data': Settings,
    'logic': GitBranch,
    'integration': Plug,
    'default': Settings,
  };
  
  const lowerName = categoryName.toLowerCase();
  if (lowerName.includes('math')) return Settings;
  if (lowerName.includes('ai')) return Brain;
  if (lowerName.includes('data')) return Settings;
  if (lowerName.includes('logic')) return GitBranch;
  if (lowerName.includes('integration')) return Plug;
  
  return iconMap[categoryName.toLowerCase()] || Settings;
};

const getSubcategoryIcon = (subcategoryName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'arithmetic': Circle,
    'default': Circle,
  };
  
  return iconMap[subcategoryName.toLowerCase()] || Circle;
};

const getNodeIcon = (nodeName: string, tags: string[]): LucideIcon => {
  const lowerName = nodeName.toLowerCase();
  const lowerTags = tags.map(t => t.toLowerCase());
  
  if (lowerName.includes('add') || lowerTags.includes('addition')) return PlusCircle;
  if (lowerName.includes('subtract') || lowerTags.includes('subtraction')) return TrendingUp;
  if (lowerName.includes('multiply') || lowerTags.includes('multiplication')) return Hash;
  if (lowerName.includes('divide') || lowerTags.includes('division')) return Split;
  if (lowerName.includes('power') || lowerTags.includes('power')) return Zap;
  if (lowerName.includes('modulo') || lowerTags.includes('modulo')) return RotateCw;
  
  return Settings;
};

// Transform scripts from API into Category structure
const transformScriptsToCategories = (scripts: Script[]): Category[] => {
  const categoryMap = new Map<string, Map<string, NodeType[]>>();
  
  scripts.forEach(script => {
    const categoryName = script.category || 'Other';
    const subcategoryName = script.subcategory || 'General';
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, new Map());
    }
    
    const subcategoryMap = categoryMap.get(categoryName)!;
    if (!subcategoryMap.has(subcategoryName)) {
      subcategoryMap.set(subcategoryName, []);
    }
    
    const nodes = subcategoryMap.get(subcategoryName)!;
    nodes.push({
      name: script.name,
      icon: getNodeIcon(script.name, script.tags),
      description: script.description,
    });
  });
  
  // Convert maps to Category array
  const categories: Category[] = [];
  categoryMap.forEach((subcategoryMap, categoryName) => {
    const subcategories: Subcategory[] = [];
    subcategoryMap.forEach((nodes, subcategoryName) => {
      subcategories.push({
        name: subcategoryName,
        icon: getSubcategoryIcon(subcategoryName),
        nodes,
      });
    });
    
    categories.push({
      name: categoryName,
      icon: getCategoryIcon(categoryName),
      subcategories,
    });
  });
  
  return categories;
};

interface AddNodeButtonProps {
  onAddNode: (category: string, subcategory: string, node: string, scriptId: string) => void;
  onMenuOpen?: () => void;
}

export const AddNodeButton = ({ onAddNode, onMenuOpen }: AddNodeButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openSubcategory, setOpenSubcategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecentlyUsedOpen, setIsRecentlyUsedOpen] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<Array<{
    categoryName: string;
    subcategoryName: string;
    nodeName: string;
    nodeDescription: string;
  }>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch scripts from API
  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getScripts();
        setScripts(response.data.scripts);
        const transformedCategories = transformScriptsToCategories(response.data.scripts);
        setCategories(transformedCategories);
      } catch (err) {
        console.error('Failed to fetch scripts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scripts');
        // Fallback to empty categories on error
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScripts();
  }, []);

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

    // Find the script by name
    const script = scripts.find(s => s.name === nodeName);
    const scriptId = script?.id || '';

    if (node) {
      // Update recently used (don't store icon, we'll look it up when rendering)
      const newRecentlyUsed = [
        { categoryName, subcategoryName, nodeName, nodeDescription: node.description },
        ...recentlyUsed.filter(item => item.nodeName !== nodeName)
      ].slice(0, 5); // Keep only 5 most recent
      
      setRecentlyUsed(newRecentlyUsed);
      localStorage.setItem('recentlyUsedNodes', JSON.stringify(newRecentlyUsed));
    }

    onAddNode(categoryName, subcategoryName, nodeName, scriptId);
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
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(true);
          if (onMenuOpen) {
            setTimeout(() => onMenuOpen(), 0);
          }
        }}
        className="h-10 w-10 p-0 rounded-full bg-primary/10 border-2 border-primary/30 hover:border-primary hover:bg-primary/20 transition-all duration-200"
      >
        <Plus className="h-5 w-5 text-primary" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleClose();
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 bg-accent/10 border-b border-border">
            <DialogTitle className="text-lg font-semibold">Add Node</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Select a node to add to your workflow
            </DialogDescription>
            
            {/* Search Input */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm bg-background border-border"
              />
            </div>
          </DialogHeader>

          {/* Content - Accordion Style */}
          <div className="max-h-[calc(85vh-180px)] overflow-y-auto bg-surface">
            {/* Loading State */}
            {isLoading && (
              <div className="px-4 py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading scripts...</p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <p className="text-xs text-muted-foreground">Please try again later.</p>
              </div>
            )}

            {/* Recently Used Section */}
            {!isLoading && !error && !searchTerm && recentlyUsed.length > 0 && (
              <div className="border-b border-border">
                <button
                  onClick={() => setIsRecentlyUsedOpen(!isRecentlyUsedOpen)}
                  className="w-full pl-4 pr-4 py-2.5 flex items-center justify-between hover:bg-accent/30 transition-colors bg-surface"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">Recently Used</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      isRecentlyUsedOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isRecentlyUsedOpen && (
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
                )}
              </div>
            )}

            {/* Categories */}
            {!isLoading && !error && (
              filteredCategories.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  {searchTerm ? `No nodes found matching "${searchTerm}"` : 'No scripts available'}
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
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};


