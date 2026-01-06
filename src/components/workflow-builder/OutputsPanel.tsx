import { useState } from 'react';
import { ChevronDown, ChevronRight, GripVertical, Copy, Zap, MessageSquare, FileText, Settings, LucideIcon, Variable, Key, Database as DatabaseIcon, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathContext } from './PathContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OutputData {
  nodeId: string;
  nodeName: string;
  icon: LucideIcon;
  output: any;
}

interface OutputsPanelProps {
  outputs: OutputData[];
  isOpen: boolean;
  currentNodeId?: string;
}

export const OutputsPanel = ({ outputs, isOpen, currentNodeId }: OutputsPanelProps) => {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState<string>('outputs');
  const { setActivePath } = usePathContext();

  const handleToggleNode = (nodeId: string) => {
    setExpandedNode(expandedNode === nodeId ? null : nodeId);
  };

  const handleToggleCollapse = (path: string) => {
    setCollapsedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleDragClick = (nodeIdOrPath: string, path?: string) => {
    let formattedPath: string;
    
    if (path !== undefined) {
      // Node output path: format as ${node:nodeId.path}
      // Remove leading dot if path starts with dot
      const cleanPath = path.startsWith('.') ? path.substring(1) : path;
      formattedPath = `\${node:${nodeIdOrPath}.${cleanPath}}`;
    } else {
      // Workspace resource path: use as is (already formatted)
      formattedPath = nodeIdOrPath;
    }
    
    console.log('Path selected:', formattedPath);
    setActivePath(formattedPath);
    setCopiedPath(formattedPath);
    setTimeout(() => setCopiedPath(null), 3000);
  };

  const handleCopyOutput = (output: any) => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    console.log('Copied output to clipboard');
  };

  const renderValue = (value: any, parentPath: string = '', depth: number = 0, nodeId: string = ''): JSX.Element => {
    const indent = Math.min(depth, 2) * 6;
    const isCollapsed = collapsedPaths.has(parentPath);
    const shouldAutoCollapse = depth > 1;

    if (value === null) {
      return <span className="text-muted-foreground">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-warning">{String(value)}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-success">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-primary">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-foreground">[]</span>;
      }

      const arrayPath = parentPath;
      const isArrayCollapsed = shouldAutoCollapse ? !collapsedPaths.has(arrayPath) : collapsedPaths.has(arrayPath);

      return (
        <div className="inline-block">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleToggleCollapse(arrayPath)}
              className="hover:bg-accent/50 rounded p-0.5 transition-colors"
            >
              {isArrayCollapsed ? (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            <span className="text-foreground">[</span>
            {isArrayCollapsed && (
              <span className="text-muted-foreground text-[10px]">{value.length} items</span>
            )}
            {isArrayCollapsed && <span className="text-foreground">]</span>}
          </div>
          {!isArrayCollapsed && (
            <>
              {value.map((item, index) => (
                <div key={index} style={{ paddingLeft: `${indent + 6}px` }} className="group">
                  <div className="flex items-start gap-1">
                    <button
                      onClick={() => handleDragClick(nodeId, `${parentPath}[${index}]`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title={`Path: \${node:${nodeId}.${parentPath}[${index}]}`}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground hover:text-primary" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-warning">{index}</span>
                      <span className="text-muted-foreground">: </span>
                      <span className="inline-block">{renderValue(item, `${parentPath}[${index}]`, depth + 1, nodeId)}</span>
                      {index < value.length - 1 && <span className="text-muted-foreground">,</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-foreground" style={{ paddingLeft: `${indent}px` }}>]</div>
            </>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span className="text-foreground">{'{}'}</span>;
      }

      const objectPath = parentPath;
      const isObjectCollapsed = shouldAutoCollapse ? !collapsedPaths.has(objectPath) : collapsedPaths.has(objectPath);

      return (
        <div className="inline-block">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleToggleCollapse(objectPath)}
              className="hover:bg-accent/50 rounded p-0.5 transition-colors"
            >
              {isObjectCollapsed ? (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            <span className="text-foreground">{'{'}</span>
            {isObjectCollapsed && (
              <span className="text-muted-foreground text-[10px]">{entries.length} keys</span>
            )}
            {isObjectCollapsed && <span className="text-foreground">{'}'}</span>}
          </div>
          {!isObjectCollapsed && (
            <>
              {entries.map(([key, val], index) => (
                <div key={key} style={{ paddingLeft: `${indent + 6}px` }} className="group">
                  <div className="flex items-start gap-1">
                    <button
                      onClick={() => handleDragClick(nodeId, parentPath ? `${parentPath}.${key}` : key)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title={`Path: \${node:${nodeId}.${parentPath ? `${parentPath}.${key}` : key}}`}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground hover:text-primary" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-accent-foreground">"{key}"</span>
                      <span className="text-muted-foreground">: </span>
                      <span className="inline-block">{renderValue(val, `${parentPath}.${key}`, depth + 1, nodeId)}</span>
                      {index < entries.length - 1 && <span className="text-muted-foreground">,</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-foreground" style={{ paddingLeft: `${indent}px` }}>{'}'}</div>
            </>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  if (!isOpen) return null;

  // Filter outputs to only show nodes before current node
  const availableOutputs = currentNodeId 
    ? outputs.filter((output, index) => {
        // Find the index of the current node
        const currentIndex = outputs.findIndex(o => o.nodeId === currentNodeId);
        // Only show outputs from nodes before the current one
        return index < currentIndex;
      })
    : [];

  // Dummy data for workspace resources
  const dummyVariables = [
    { key: 'API_KEY', value: 'sk_test_1234567890', type: 'string' },
    { key: 'DATABASE_URL', value: 'postgresql://localhost:5432/mydb', type: 'string' },
    { key: 'MAX_RETRIES', value: '3', type: 'number' },
    { key: 'ENABLE_CACHE', value: 'true', type: 'boolean' },
  ];

  const dummyCredentials = [
    { id: 'cred_1', name: 'Stripe API', type: 'API Key', data: 'credentials.stripe_api_key' },
    { id: 'cred_2', name: 'OpenAI', type: 'Bearer Token', data: 'credentials.openai_token' },
    { id: 'cred_3', name: 'AWS S3', type: 'Access Key', data: 'credentials.aws_access_key' },
  ];

  const dummyDatabases = [
    { 
      id: 'db_1', 
      name: 'Production PostgreSQL', 
      type: 'PostgreSQL',
      host: 'db.example.com',
      port: '5432',
      db_name: 'prod_db',
      username: 'admin',
      password: 'databases.postgres_prod.password'
    },
    { 
      id: 'db_2', 
      name: 'MongoDB Cluster', 
      type: 'MongoDB',
      host: 'cluster0.mongodb.net',
      port: '27017',
      db_name: 'analytics',
      username: 'mongo_user',
      password: 'databases.mongodb_cluster.password'
    },
  ];

  const dummyFiles = [
    { id: 'file_1', name: 'logo.png', path: 'files/assets/logo.png', size: '24 KB' },
    { id: 'file_2', name: 'template.json', path: 'files/templates/template.json', size: '12 KB' },
    { id: 'file_3', name: 'report.pdf', path: 'files/documents/report.pdf', size: '156 KB' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-[420px] bg-surface border-r border-border z-40 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <Select value={selectedTab} onValueChange={setSelectedTab}>
          <SelectTrigger className="w-full border-0 bg-transparent hover:bg-accent/50 px-3">
            <SelectValue placeholder="Select resource type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outputs">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Previous Outputs</span>
              </div>
            </SelectItem>
            <SelectItem value="variables">
              <div className="flex items-center gap-2">
                <Variable className="h-4 w-4" />
                <span>Variables</span>
              </div>
            </SelectItem>
            <SelectItem value="credentials">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span>Credentials</span>
              </div>
            </SelectItem>
            <SelectItem value="databases">
              <div className="flex items-center gap-2">
                <DatabaseIcon className="h-4 w-4" />
                <span>Databases</span>
              </div>
            </SelectItem>
            <SelectItem value="files">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span>Files</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Previous Outputs */}
        {selectedTab === 'outputs' && (
          <div className="p-4">
            {availableOutputs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                {currentNodeId 
                  ? "Öncesinde düğüm olmadığı için değer yok"
                  : "No node selected"
                }
              </div>
            ) : (
              <div className="space-y-1">
                {availableOutputs.map((output) => (
                  <div key={output.nodeId} className="border-b border-border last:border-b-0">
                    {/* Accordion Header */}
                    <button
                      onClick={() => handleToggleNode(output.nodeId)}
                      className="w-full px-3 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <output.icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {output.nodeName}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          expandedNode === output.nodeId ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Accordion Content */}
                    {expandedNode === output.nodeId && (
                      <div className="px-3 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Output</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyOutput(output.output)}
                            className="h-6 px-2 text-xs"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="bg-background/50 p-3 border border-border/50 overflow-x-auto">
                          <pre className="text-[11px] font-mono leading-tight">
                            {renderValue(output.output, '', 0, output.nodeId)}
                          </pre>
                        </div>

                        {copiedPath && (
                          <div className="mt-2 px-3 py-2 bg-success/10 text-xs text-success">
                            ✓ <code className="font-mono">{copiedPath}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Environment Variables */}
        {selectedTab === 'variables' && (
          <div className="divide-y divide-border">
            {dummyVariables.map((variable) => (
              <div 
                key={variable.key}
                className="px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => handleDragClick(`variables.${variable.key}`)}
              >
                <div className="flex items-center gap-3">
                  <Variable className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{variable.key}</span>
                      <span className="text-xs text-muted-foreground">{variable.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {variable.value}
                    </p>
                  </div>
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Credentials */}
        {selectedTab === 'credentials' && (
          <div className="divide-y divide-border">
            {dummyCredentials.map((credential) => (
              <div 
                key={credential.id}
                className="px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => handleDragClick(credential.data)}
              >
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{credential.name}</span>
                      <span className="text-xs text-muted-foreground">{credential.type}</span>
                    </div>
                    <code className="text-xs text-muted-foreground truncate block">
                      {credential.data}
                    </code>
                  </div>
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Databases */}
        {selectedTab === 'databases' && (
          <div className="p-4 space-y-3">
            {dummyDatabases.map((database) => (
              <div key={database.id} className="border-b border-border pb-3 last:border-b-0">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <DatabaseIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{database.name}</span>
                  <span className="text-xs text-muted-foreground">{database.type}</span>
                </div>
                
                <div className="space-y-0.5">
                  {[
                    { label: 'Host', value: database.host, path: `databases.${database.id}.host` },
                    { label: 'Port', value: database.port, path: `databases.${database.id}.port` },
                    { label: 'Database', value: database.db_name, path: `databases.${database.id}.db_name` },
                    { label: 'Username', value: database.username, path: `databases.${database.id}.username` },
                    { label: 'Password', value: '••••••••', path: database.password },
                  ].map((field) => (
                    <div 
                      key={field.label}
                      className="flex items-center justify-between px-2 py-2 hover:bg-accent/50 transition-colors cursor-pointer group"
                      onClick={() => handleDragClick(field.path)}
                    >
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground mr-2">{field.label}:</span>
                        <span className="text-xs text-foreground">{field.value}</span>
                      </div>
                      <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Files */}
        {selectedTab === 'files' && (
          <div className="divide-y divide-border">
            {dummyFiles.map((file) => (
              <div 
                key={file.id}
                className="px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => handleDragClick(file.path)}
              >
                <div className="flex items-center gap-3">
                  <File className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{file.size}</span>
                    </div>
                    <code className="text-xs text-muted-foreground truncate block">
                      {file.path}
                    </code>
                  </div>
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

