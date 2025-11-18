import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NodeType {
  name: string;
  icon: string;
}

interface Subcategory {
  name: string;
  icon: string;
  nodes: NodeType[];
}

interface Category {
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

const categories: Category[] = [
  {
    name: 'AI Models',
    icon: '🤖',
    subcategories: [
      {
        name: 'OpenAI',
        icon: '🟢',
        nodes: [
          { name: 'GPT-4 Completion', icon: '💬' },
          { name: 'DALL-E Image', icon: '🎨' },
          { name: 'Embeddings', icon: '🔢' },
        ],
      },
      {
        name: 'Anthropic',
        icon: '🔵',
        nodes: [
          { name: 'Claude', icon: '💭' },
          { name: 'Claude Instant', icon: '⚡' },
        ],
      },
      {
        name: 'Google AI',
        icon: '🔴',
        nodes: [
          { name: 'Gemini', icon: '✨' },
          { name: 'PaLM', icon: '🌴' },
        ],
      },
    ],
  },
  {
    name: 'Data Processing',
    icon: '⚙️',
    subcategories: [
      {
        name: 'Transform',
        icon: '🔄',
        nodes: [
          { name: 'JSON Parse', icon: '📋' },
          { name: 'Text Replace', icon: '✏️' },
          { name: 'Date Format', icon: '📅' },
        ],
      },
      {
        name: 'Filter',
        icon: '🔍',
        nodes: [
          { name: 'Filter Array', icon: '📊' },
          { name: 'Remove Duplicates', icon: '🧹' },
          { name: 'Conditional Filter', icon: '🎯' },
        ],
      },
      {
        name: 'Aggregate',
        icon: '📈',
        nodes: [
          { name: 'Sum', icon: '➕' },
          { name: 'Average', icon: '📊' },
          { name: 'Count', icon: '🔢' },
        ],
      },
    ],
  },
  {
    name: 'Logic & Flow',
    icon: '🔀',
    subcategories: [
      {
        name: 'Conditions',
        icon: '❓',
        nodes: [
          { name: 'If/Else', icon: '⚖️' },
          { name: 'Switch', icon: '🔀' },
          { name: 'Compare', icon: '⚡' },
        ],
      },
      {
        name: 'Loops',
        icon: '🔁',
        nodes: [
          { name: 'For Each', icon: '➰' },
          { name: 'While', icon: '🔄' },
          { name: 'Repeat', icon: '🔂' },
        ],
      },
      {
        name: 'Branches',
        icon: '🌿',
        nodes: [
          { name: 'Split', icon: '✂️' },
          { name: 'Merge', icon: '🔗' },
          { name: 'Parallel', icon: '⚡' },
        ],
      },
    ],
  },
  {
    name: 'Integrations',
    icon: '🔌',
    subcategories: [
      {
        name: 'HTTP',
        icon: '🌐',
        nodes: [
          { name: 'GET Request', icon: '📥' },
          { name: 'POST Request', icon: '📤' },
          { name: 'Webhook', icon: '🔔' },
        ],
      },
      {
        name: 'Database',
        icon: '🗄️',
        nodes: [
          { name: 'Query', icon: '🔍' },
          { name: 'Insert', icon: '➕' },
          { name: 'Update', icon: '✏️' },
        ],
      },
      {
        name: 'Email',
        icon: '📧',
        nodes: [
          { name: 'Send Email', icon: '📨' },
          { name: 'Parse Email', icon: '📖' },
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
        <div className="absolute left-1/2 -translate-x-1/2 top-12 w-80 bg-surface border border-border rounded-lg shadow-xl z-[100] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-accent/10 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Add Node</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Select a node to add to your workflow</p>
          </div>

          {/* Content - Accordion Style */}
          <div className="max-h-96 overflow-y-auto bg-surface">
            {categories.map((category) => (
              <div key={category.name} className="border-b border-border last:border-b-0">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors bg-surface"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
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
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.name} className="border-t border-border/50">
                        {/* Subcategory Header */}
                        <button
                          onClick={() => toggleSubcategory(subcategory.name)}
                          className="w-full px-6 py-2.5 flex items-center justify-between hover:bg-accent/20 transition-colors bg-surface"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{subcategory.icon}</span>
                            <span className="text-sm text-foreground">{subcategory.name}</span>
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
                            {subcategory.nodes.map((node) => (
                              <button
                                key={node.name}
                                onClick={() => handleNodeClick(category.name, subcategory.name, node.name)}
                                className="w-full px-8 py-2.5 flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors text-left group bg-surface"
                              >
                                <span className="text-base group-hover:scale-110 transition-transform">
                                  {node.icon}
                                </span>
                                <span className="text-sm text-foreground">{node.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
