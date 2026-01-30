import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, GripVertical, Copy, Zap, MessageSquare, FileText, Settings, LucideIcon, Variable, Key, Database as DatabaseIcon, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathContext } from './PathContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getVariables, VariableDetail } from '@/services/variablesApi';
import { getCredentials, CredentialDetail } from '@/services/credentialsApi';
import { getDatabases, DatabaseDetail } from '@/services/databasesApi';
import { getFiles, FileDetail } from '@/services/filesApi';
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
  triggerData?: { input_mapping: Record<string, { type: string; value: any }> } | null;
}

export const OutputsPanel = ({ outputs, isOpen, currentNodeId, triggerData }: OutputsPanelProps) => {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState<string>('outputs');
  const { setActivePath } = usePathContext();
  const { currentWorkspace } = useWorkspace();

  // Real data states
  const [variables, setVariables] = useState<VariableDetail[]>([]);
  const [credentials, setCredentials] = useState<CredentialDetail[]>([]);
  const [databases, setDatabases] = useState<DatabaseDetail[]>([]);
  const [files, setFiles] = useState<FileDetail[]>([]);
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Load data when tab changes or workspace changes
  useEffect(() => {
    if (!isOpen || !currentWorkspace?.id) return;

    const loadData = async () => {
      try {
        if (selectedTab === 'variables') {
          setIsLoadingVariables(true);
          const response = await getVariables(currentWorkspace.id);
          // Handle different response formats
          const variablesData = Array.isArray(response.data) 
            ? response.data 
            : response.data?.items || response.data?.variables || [];
          setVariables(variablesData);
        } else if (selectedTab === 'credentials') {
          setIsLoadingCredentials(true);
          const response = await getCredentials(currentWorkspace.id);
          // Handle different response formats
          const credentialsData = Array.isArray(response.data) 
            ? response.data 
            : response.data?.items || response.data?.credentials || [];
          setCredentials(credentialsData);
        } else if (selectedTab === 'databases') {
          setIsLoadingDatabases(true);
          const response = await getDatabases(currentWorkspace.id);
          // Handle different response formats
          const databasesData = Array.isArray(response.data) 
            ? response.data 
            : response.data?.items || response.data?.databases || [];
          setDatabases(databasesData);
        } else if (selectedTab === 'files') {
          setIsLoadingFiles(true);
          const response = await getFiles(currentWorkspace.id);
          // Handle different response formats
          const filesData = Array.isArray(response.data) 
            ? response.data 
            : response.data?.items || response.data?.files || [];
          setFiles(filesData);
        }
      } catch (error) {
        console.error(`Error loading ${selectedTab}:`, error);
      } finally {
        setIsLoadingVariables(false);
        setIsLoadingCredentials(false);
        setIsLoadingDatabases(false);
        setIsLoadingFiles(false);
      }
    };

    loadData();
  }, [selectedTab, isOpen, currentWorkspace?.id]);

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

  const handleDragClick = (
    nodeIdOrPath: string, 
    path?: string, 
    resourceType?: 'variable' | 'credential' | 'database' | 'file' | 'trigger',
    fieldName?: string
  ) => {
    let formattedPath: string;
    
    if (nodeIdOrPath === 'trigger' && path !== undefined) {
      // Trigger path: format as ${trigger:path}
      // If path starts with "data.", remove it to use direct parameter name
      // Keep "data" as is for full data access
      if (path === 'data') {
        formattedPath = `\${trigger:data}`;
      } else if (path.startsWith('data.')) {
        // Remove "data." prefix to use direct parameter name
        const paramPath = path.substring(5); // Remove "data." (5 characters)
        formattedPath = `\${trigger:${paramPath}}`;
      } else {
        formattedPath = `\${trigger:${path}}`;
      }
    } else if (path !== undefined) {
      // Node output path: format as ${node:nodeId.path}
      // Remove leading dot if path starts with dot
      const cleanPath = path.startsWith('.') ? path.substring(1) : path;
      formattedPath = `\${node:${nodeIdOrPath}.${cleanPath}}`;
    } else if (resourceType === 'variable') {
      // Variable path: format as ${value:ENV-xyz789}
      formattedPath = `\${value:${nodeIdOrPath}}`;
    } else if (resourceType === 'credential') {
      // Credential path: format as ${credential:CRD-xyz789} or ${credential:CRD-xyz789.field}
      if (fieldName) {
        formattedPath = `\${credential:${nodeIdOrPath}.${fieldName}}`;
      } else {
        formattedPath = `\${credential:${nodeIdOrPath}}`;
      }
    } else if (resourceType === 'database') {
      // Database path: format as ${database:DBS-xyz789.field}
      formattedPath = `\${database:${nodeIdOrPath}.${fieldName}}`;
    } else if (resourceType === 'file') {
      // File path: format as ${file:FLE-xyz789.field}
      formattedPath = `\${file:${nodeIdOrPath}.${fieldName}}`;
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

  const INDENT_PX = 18;

  const renderValue = (value: any, parentPath: string = '', depth: number = 0, nodeId: string = ''): JSX.Element => {
    const indent = depth * INDENT_PX;
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
        <div className="block w-full">
          <div className="flex items-center gap-1 min-h-[20px]" style={{ paddingLeft: `${indent}px` }}>
            <button
              onClick={() => handleToggleCollapse(arrayPath)}
              className="hover:bg-accent/50 rounded p-0.5 transition-colors flex-shrink-0"
            >
              {isArrayCollapsed ? (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            <span className="text-foreground">[</span>
            {isArrayCollapsed && (
              <>
                <span className="text-muted-foreground text-[10px]">{value.length} items</span>
                <span className="text-foreground">]</span>
              </>
            )}
          </div>
          {!isArrayCollapsed && (
            <>
              {value.map((item, index) => (
                <div key={index} className="group block w-full" style={{ paddingLeft: `${indent + INDENT_PX}px` }}>
                  <div className="flex items-start gap-1 min-h-[20px]">
                    <button
                      onClick={() => handleDragClick(nodeId, `${parentPath}[${index}]`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                      title={`Path: \${node:${nodeId}.${parentPath}[${index}]}`}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground hover:text-primary" />
                    </button>
                    <div className="flex-1 min-w-0 block">
                      <span className="text-warning">{index}</span>
                      <span className="text-muted-foreground">: </span>
                      <span className="block">{renderValue(item, `${parentPath}[${index}]`, depth + 1, nodeId)}</span>
                      {index < value.length - 1 && <span className="text-muted-foreground">,</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-foreground min-h-[20px] flex items-center" style={{ paddingLeft: `${indent}px` }}>
                ]
              </div>
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
        <div className="block w-full">
          <div className="flex items-center gap-1 min-h-[20px]" style={{ paddingLeft: `${indent}px` }}>
            <button
              onClick={() => handleToggleCollapse(objectPath)}
              className="hover:bg-accent/50 rounded p-0.5 transition-colors flex-shrink-0"
            >
              {isObjectCollapsed ? (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            <span className="text-foreground">{'{'}</span>
            {isObjectCollapsed && (
              <>
                <span className="text-muted-foreground text-[10px]">{entries.length} keys</span>
                <span className="text-foreground">{'}'}</span>
              </>
            )}
          </div>
          {!isObjectCollapsed && (
            <>
              {entries.map(([key, val], index) => {
                const isNested = typeof val === 'object' && val !== null && (Array.isArray(val) || Object.keys(val).length > 0);
                const childPath = parentPath ? `${parentPath}.${key}` : key;
                return (
                  <div key={key} className="group block w-full" style={{ paddingLeft: `${indent + INDENT_PX}px` }}>
                    <div className="flex items-start gap-1 min-h-[20px]">
                      <button
                        onClick={() => handleDragClick(nodeId, childPath)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                        title={`Path: \${node:${nodeId}.${childPath}}`}
                      >
                        <GripVertical className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      </button>
                      <div className="flex-1 min-w-0 block break-inside-avoid">
                        <span className="text-accent-foreground">"{key}"</span>
                        <span className="text-muted-foreground">: </span>
                        {isNested ? (
                          <div className="block mt-0">{renderValue(val, childPath, depth + 1, nodeId)}</div>
                        ) : (
                          <span className="inline">{renderValue(val, childPath, depth + 1, nodeId)}</span>
                        )}
                        {index < entries.length - 1 && <span className="text-muted-foreground">,</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="text-foreground min-h-[20px] flex items-center" style={{ paddingLeft: `${indent}px` }}>
                {'}'}
              </div>
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

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper function to get variable type
  const getVariableType = (value: string): string => {
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
    return 'string';
  };

  return (
    <div className="fixed left-0 top-0 h-full w-[420px] bg-surface border-r border-border z-[60] flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <Select value={selectedTab} onValueChange={setSelectedTab}>
          <SelectTrigger className="w-full border-0 bg-transparent hover:bg-accent/50 px-3">
            <SelectValue placeholder="Select resource type" />
          </SelectTrigger>
          <SelectContent className="z-[9999]" style={{ zIndex: 9999 }}>
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
            {/* Trigger Data Section */}
            {triggerData && triggerData.input_mapping && Object.keys(triggerData.input_mapping).length > 0 && (
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Trigger Data</span>
                </div>
                
                {/* Full trigger data option */}
                <div 
                  className="flex items-center justify-between px-2 py-2 hover:bg-accent/50 transition-colors cursor-pointer group mb-1"
                  onClick={() => handleDragClick('trigger', 'data', undefined)}
                >
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground mr-2">All Data:</span>
                    <code className="text-xs text-primary">{`\${trigger:data}`}</code>
                  </div>
                  <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Individual input mapping parameters */}
                <div className="space-y-0.5">
                  {Object.entries(triggerData.input_mapping).map(([key, mappingValue]) => {
                    const value = mappingValue.value;
                    const type = mappingValue.type;
                    
                    // Render based on type
                    if (type === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
                      // Object type - show nested fields
                      return (
                        <div key={key} className="border-l-2 border-primary/20 pl-2 ml-2">
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-xs font-medium text-foreground">{key}</span>
                            <span className="text-xs text-muted-foreground">(object)</span>
                          </div>
                          <div 
                            className="flex items-center justify-between px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer group mb-0.5"
                            onClick={() => handleDragClick('trigger', `data.${key}`, undefined)}
                          >
                            <div className="flex-1">
                              <span className="text-xs text-muted-foreground mr-2">All:</span>
                              <code className="text-xs text-primary">{`\${trigger:${key}}`}</code>
                            </div>
                            <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {Object.keys(value).map((nestedKey) => (
                            <div 
                              key={nestedKey}
                              className="flex items-center justify-between px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer group"
                              onClick={() => handleDragClick('trigger', `data.${key}.${nestedKey}`, undefined)}
                            >
                              <div className="flex-1">
                                <span className="text-xs text-muted-foreground mr-2">{nestedKey}:</span>
                                <code className="text-xs text-primary">{`\${trigger:${key}.${nestedKey}}`}</code>
                              </div>
                              <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      );
                    } else if (type === 'array' && Array.isArray(value)) {
                      // Array type - show array access
                      return (
                        <div key={key} className="border-l-2 border-primary/20 pl-2 ml-2">
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-xs font-medium text-foreground">{key}</span>
                            <span className="text-xs text-muted-foreground">(array)</span>
                          </div>
                          <div 
                            className="flex items-center justify-between px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer group mb-0.5"
                            onClick={() => handleDragClick('trigger', `data.${key}`, undefined)}
                          >
                            <div className="flex-1">
                              <span className="text-xs text-muted-foreground mr-2">All:</span>
                              <code className="text-xs text-primary">{`\${trigger:${key}}`}</code>
                            </div>
                            <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div 
                            className="flex items-center justify-between px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer group"
                            onClick={() => handleDragClick('trigger', `data.${key}[0]`, undefined)}
                          >
                            <div className="flex-1">
                              <span className="text-xs text-muted-foreground mr-2">First Item:</span>
                              <code className="text-xs text-primary">{`\${trigger:${key}[0]}`}</code>
                            </div>
                            <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      );
                    } else {
                      // Simple type (string, number, boolean)
                      return (
                        <div 
                          key={key}
                          className="flex items-center justify-between px-2 py-2 hover:bg-accent/50 transition-colors cursor-pointer group"
                          onClick={() => handleDragClick('trigger', `data.${key}`, undefined)}
                        >
                          <div className="flex-1">
                            <span className="text-xs text-muted-foreground mr-2">{key}:</span>
                            <code className="text-xs text-primary">{`\${trigger:${key}}`}</code>
                          </div>
                          <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
            
            {availableOutputs.length === 0 && (!triggerData || !triggerData.input_mapping || Object.keys(triggerData.input_mapping).length === 0) && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                {currentNodeId 
                  ? "Öncesinde düğüm olmadığı için değer yok"
                  : "No node selected"
                }
              </div>
            )}
            
            {availableOutputs.length > 0 && (
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
            {isLoadingVariables ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : variables.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No variables found
              </div>
            ) : (
              variables.map((variable) => (
                <div 
                  key={variable.id}
                  className="px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => handleDragClick(variable.id, undefined, 'variable')}
                >
                  <div className="flex items-center gap-3">
                    <Variable className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{variable.key}</span>
                        <span className="text-xs text-muted-foreground">
                          {getVariableType(variable.value)}
                        </span>
                        {variable.is_secret && (
                          <span className="text-xs text-warning">Secret</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {variable.is_secret ? '••••••••' : variable.value}
                      </p>
                    </div>
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Credentials */}
        {selectedTab === 'credentials' && (
          <div className="p-4 space-y-3">
            {isLoadingCredentials ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : credentials.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No credentials found
              </div>
            ) : (
              credentials.map((credential) => {
                // Extract fields from credential_data if it's an object
                const credentialData = credential.credential_data || {};
                const credentialFields = typeof credentialData === 'object' && credentialData !== null && !Array.isArray(credentialData)
                  ? Object.keys(credentialData)
                  : [];
                
                return (
                  <div key={credential.id} className="border-b border-border pb-3 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <Key className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{credential.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {credential.credential_type || credential.credential_provider}
                      </span>
                    </div>
                    
                    {/* Full credential_data option */}
                    <div 
                      className="flex items-center justify-between px-2 py-2 hover:bg-accent/50 transition-colors cursor-pointer group mb-1"
                      onClick={() => handleDragClick(credential.id, undefined, 'credential')}
                    >
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground mr-2">All Data:</span>
                        <code className="text-xs text-primary">{`\${credential:${credential.id}}`}</code>
                      </div>
                      <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Individual fields */}
                    {credentialFields.length > 0 && (
                      <div className="space-y-0.5">
                        {credentialFields.map((field) => (
                          <div 
                            key={field}
                            className="flex items-center justify-between px-2 py-2 hover:bg-accent/50 transition-colors cursor-pointer group"
                            onClick={() => handleDragClick(credential.id, undefined, 'credential', field)}
                          >
                            <div className="flex-1">
                              <span className="text-xs text-muted-foreground mr-2">{field}:</span>
                              <code className="text-xs text-primary">{`\${credential:${credential.id}.${field}}`}</code>
                            </div>
                            <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Databases */}
        {selectedTab === 'databases' && (
          <div className="p-4 space-y-3">
            {isLoadingDatabases ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : databases.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No databases found
              </div>
            ) : (
              databases.map((database) => (
                <div key={database.id} className="border-b border-border pb-3 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <DatabaseIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{database.name}</span>
                    <span className="text-xs text-muted-foreground">{database.database_type}</span>
                  </div>
                  
                  <div className="space-y-0.5">
                    {[
                      { label: 'Host', value: database.host, fieldName: 'host' },
                      { label: 'Port', value: String(database.port), fieldName: 'port' },
                      { label: 'Username', value: database.username, fieldName: 'username' },
                      { label: 'Password', value: '••••••••', fieldName: 'password' },
                      ...(database.connection_string ? [{ label: 'Connection String', value: '••••••••', fieldName: 'connection_string' }] : []),
                    ].map((field) => (
                      <div 
                        key={field.label}
                        className="flex items-center justify-between px-2 py-2 hover:bg-accent/50 transition-colors cursor-pointer group"
                        onClick={() => handleDragClick(database.id, undefined, 'database', field.fieldName)}
                      >
                        <div className="flex-1">
                          <span className="text-xs text-muted-foreground mr-2">{field.label}:</span>
                          <code className="text-xs text-primary">{`\${database:${database.id}.${field.fieldName}}`}</code>
                        </div>
                        <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Files */}
        {selectedTab === 'files' && (
          <div className="p-4 space-y-3">
            {isLoadingFiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : files.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No files found
              </div>
            ) : (
              files.map((file) => (
                <div key={file.id} className="border-b border-border pb-3 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <File className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                  </div>
                  
                  <div className="space-y-0.5">
                    {[
                      { label: 'Content', fieldName: 'content' },
                      { label: 'Name', fieldName: 'name' },
                      { label: 'MIME Type', fieldName: 'mime_type' },
                      { label: 'File Size', fieldName: 'file_size' },
                    ].map((field) => (
                      <div 
                        key={field.label}
                        className="flex items-center justify-between px-2 py-2 hover:bg-accent/50 transition-colors cursor-pointer group"
                        onClick={() => handleDragClick(file.id, undefined, 'file', field.fieldName)}
                      >
                        <div className="flex-1">
                          <span className="text-xs text-muted-foreground mr-2">{field.label}:</span>
                          <code className="text-xs text-primary">{`\${file:${file.id}.${field.fieldName}}`}</code>
                        </div>
                        <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

