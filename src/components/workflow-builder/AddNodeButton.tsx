import { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight,
  Brain,
  Zap,
  Circle,
  MessageSquare,
  Image,
  Hash,
  Settings,
  RotateCw,
  FileJson,
  Type,
  Calendar,
  TrendingUp,
  PlusCircle,
  GitBranch,
  Repeat,
  Split,
  Plug,
  Database,
  Search,
  Clock,
  LucideIcon,
  Loader2,
  LayoutGrid,
  Calculator,
  Puzzle,
  Workflow,
  Box,
  Cpu,
  Sparkles,
  FolderOpen,
  Layers,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Premium icon mapping - categories
const getCategoryIcon = (categoryName: string): LucideIcon => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('math')) return Calculator;
  if (lower.includes('ai')) return Brain;
  if (lower.includes('data')) return Database;
  if (lower.includes('logic')) return GitBranch;
  if (lower.includes('integration')) return Plug;
  if (lower.includes('other')) return FolderOpen;
  return LayoutGrid;
};

// Subcategories
const getSubcategoryIcon = (subcategoryName: string): LucideIcon => {
  const lower = subcategoryName.toLowerCase();
  if (lower.includes('arithmetic')) return Calculator;
  if (lower.includes('general')) return Box;
  return Layers;
};

// Node icons - more distinctive
const getNodeIcon = (nodeName: string, tags: string[]): LucideIcon => {
  const lowerName = nodeName.toLowerCase();
  const lowerTags = tags.map(t => t.toLowerCase());
  if (lowerName.includes('gpt') || lowerName.includes('claude') || lowerTags.includes('ai')) return Sparkles;
  if (lowerName.includes('dall-e') || lowerName.includes('image')) return Image;
  if (lowerName.includes('json')) return FileJson;
  if (lowerName.includes('add') || lowerTags.includes('addition')) return PlusCircle;
  if (lowerName.includes('subtract') || lowerTags.includes('subtraction')) return TrendingUp;
  if (lowerName.includes('multiply') || lowerTags.includes('multiplication')) return Hash;
  if (lowerName.includes('divide') || lowerTags.includes('division')) return Split;
  if (lowerName.includes('power') || lowerTags.includes('power')) return Zap;
  if (lowerName.includes('modulo') || lowerTags.includes('modulo')) return RotateCw;
  if (lowerName.includes('text') || lowerName.includes('replace')) return Type;
  if (lowerName.includes('date')) return Calendar;
  if (lowerName.includes('embed')) return Cpu;
  return Puzzle;
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
  const [searchTerm, setSearchTerm] = useState('');
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
      // Check if user is authenticated before making API call
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setIsLoading(false);
        setCategories([]);
        return;
      }

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


  // Selected category for two-panel layout (left: categories, right: nodes)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Show labels with spaces instead of underscores, first letter of each word uppercase
  const toDisplayLabel = (s: string) =>
    (s || '')
      .replace(/_/g, ' ')
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCategory(null);
    setSearchTerm('');
  };

  const selectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
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
        className="h-14 w-14 p-0 rounded-full bg-primary/10 border-2 border-primary/30 hover:border-primary hover:bg-primary/20 transition-all duration-200 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20"
      >
        <Plus className="h-7 w-7 text-primary" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleClose();
      }}>
        <DialogContent className="max-w-4xl max-h-[88vh] p-0 overflow-hidden rounded-2xl border-2 border-border/50 bg-gradient-to-br from-surface/98 via-surface/95 to-surface/90 backdrop-blur-2xl shadow-2xl shadow-primary/15 data-[state=open]:animate-in data-[state=closed]:animate-out">
          {/* Premium Header */}
          <DialogHeader className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-surface/95 via-primary/5 to-surface/95 border-b border-border/60">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
            <div className="relative space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                  <Plus className="h-4 w-4 text-primary" />
                </span>
                Add Node
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Choose an action or logic node to add to your workflow
              </DialogDescription>
            </div>

            {/* Search - Premium pill style */}
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
              <Input
                type="text"
                placeholder="Search nodes by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-background/80 border-2 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground/70 transition-all duration-200"
              />
            </div>
          </DialogHeader>

          {/* Two-column layout: Left = Categories, Right = Nodes */}
          <div className="flex max-h-[calc(88vh-200px)] min-h-[360px] overflow-hidden bg-gradient-to-b from-transparent to-surface/20">
            {/* Loading State - Full width */}
            {isLoading && (
              <div className="flex flex-1 flex-col items-center justify-center py-16 px-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30">
                    <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">Loading nodes</p>
                <p className="text-xs text-muted-foreground mt-1">Fetching available scripts...</p>
              </div>
            )}

            {/* Error State - Full width */}
            {!isLoading && error && (
              <div className="flex flex-1 items-center justify-center p-6">
                <div className="p-5 rounded-xl bg-destructive/10 border-2 border-destructive/30 text-center max-w-sm">
                  <p className="text-sm font-medium text-destructive mb-1">{error}</p>
                  <p className="text-xs text-muted-foreground">Please try again later.</p>
                </div>
              </div>
            )}

            {/* Two columns when we have data */}
            {!isLoading && !error && (
              <>
                {/* LEFT: Categories sidebar */}
                <div className="w-[240px] shrink-0 border-r border-border/50 bg-surface/40 backdrop-blur-sm flex flex-col overflow-hidden">
                  <div className="p-2 overflow-y-auto flex-1">
                    {/* Recently Used - first item in sidebar */}
                    {!searchTerm && recentlyUsed.length > 0 && (
                      <button
                        onClick={() => setSelectedCategory('__recent__')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 text-left ${
                          selectedCategory === '__recent__'
                            ? 'bg-primary/15 border-2 border-primary/40 text-primary shadow-md shadow-primary/10'
                            : 'hover:bg-primary/10 border-2 border-transparent hover:border-primary/20'
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold truncate">Recently Used</span>
                      </button>
                    )}

                    {/* Category list */}
                    {filteredCategories.length === 0 ? (
                      <div className="px-3 py-6 text-center">
                        <LayoutGrid className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-xs text-muted-foreground">
                          {searchTerm ? 'No categories match' : 'No categories'}
                        </p>
                      </div>
                    ) : (
                      filteredCategories.map((category) => {
                        const CategoryIcon = category.icon;
                        const isSelected = selectedCategory === category.name;
                        return (
                          <button
                            key={category.name}
                            onClick={() => selectCategory(category.name)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 text-left ${
                              isSelected
                                ? 'bg-primary/15 border-2 border-primary/40 text-primary shadow-md shadow-primary/10'
                                : 'hover:bg-primary/10 border-2 border-transparent hover:border-primary/20'
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                              <CategoryIcon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-semibold truncate flex-1">{toDisplayLabel(category.name)}</span>
                            <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT: Nodes for selected category */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4">
                    {selectedCategory === null ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface/80 border-2 border-border/50 mb-4">
                          <Workflow className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Select a category</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                          Choose a category from the left to see available nodes
                        </p>
                      </div>
                    ) : selectedCategory === '__recent__' ? (
                      recentlyUsed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <Clock className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                          <p className="text-sm font-medium text-foreground">No recent nodes</p>
                          <p className="text-xs text-muted-foreground mt-1">Used nodes will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">Recently Used</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {recentlyUsed.map((item, index) => {
                              const category = categories.find(c => c.name === item.categoryName);
                              const subcategory = category?.subcategories.find(sc => sc.name === item.subcategoryName);
                              const node = subcategory?.nodes.find(n => n.name === item.nodeName);
                              const NodeIcon = node?.icon || Puzzle;
                              return (
                                <button
                                  key={`${item.nodeName}-${index}`}
                                  onClick={() => handleNodeClick(item.categoryName, item.subcategoryName, item.nodeName)}
                                  className="flex items-start gap-3 p-3 rounded-xl border-2 border-border/50 bg-surface/80 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10 transition-all duration-200 text-left group"
                                >
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-colors">
                                    <NodeIcon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{toDisplayLabel(item.nodeName)}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{toDisplayLabel(item.nodeDescription)}</div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 transition-opacity" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    ) : (
                      (() => {
                        const category = filteredCategories.find(c => c.name === selectedCategory);
                        if (!category) return null;
                        // When search is active, show flat list; otherwise group by subcategory
                        const nodesBySub = category.subcategories;
                        const totalNodes = nodesBySub.reduce((acc, sc) => acc + sc.nodes.length, 0);
                        if (totalNodes === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                              <Search className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                              <p className="text-sm font-medium text-foreground">No nodes in this category</p>
                              <p className="text-xs text-muted-foreground mt-1">Try another category or search</p>
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-6">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                                {(() => {
                                  const Icon = category.icon;
                                  return <Icon className="h-4 w-4 text-primary" />;
                                })()}
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-foreground">{toDisplayLabel(category.name)}</h3>
                                <p className="text-xs text-muted-foreground">{totalNodes} node{totalNodes !== 1 ? 's' : ''} available</p>
                              </div>
                            </div>
                            {nodesBySub.map((subcategory) => (
                              <div key={subcategory.name} className="space-y-2">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                  <Package className="h-3.5 w-3.5" />
                                  {toDisplayLabel(subcategory.name)}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {subcategory.nodes.map((node) => {
                                    const NodeIcon = node.icon;
                                    return (
                                      <button
                                        key={node.name}
                                        onClick={() => handleNodeClick(category.name, subcategory.name, node.name)}
                                        className="flex items-start gap-3 p-3 rounded-xl border-2 border-border/50 bg-surface/80 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10 transition-all duration-200 text-left group"
                                      >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-colors">
                                          <NodeIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{toDisplayLabel(node.name)}</div>
                                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{toDisplayLabel(node.description)}</div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 transition-opacity" />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};


