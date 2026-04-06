import { useState, useEffect, useMemo, useCallback, useRef, useId, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  EdgeLabelRenderer,
  BaseEdge,
  getSmoothStepPath,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  Position,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type NodeProps,
  type EdgeProps,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft,
  Play,
  Loader2,
  Zap,
  MessageSquare,
  Image,
  FileJson,
  Type,
  Calendar,
  GitBranch,
  Repeat,
  Settings,
  LucideIcon,
  Trash2,
  Undo2,
  Redo2,
  LayoutGrid,
  Maximize2,
  Download,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  getWorkflowGraph,
  getNodeFormSchema,
  addNodeToWorkflow,
  addEdgeToWorkflow,
  deleteNodeFromWorkflow,
  deleteEdgeFromWorkflow,
  testWorkflowExecution,
  getExecution,
  stopExecution,
} from '@/services/workflowApi';
import { toast } from '@/hooks/use-toast';
import { PathProvider } from '@/components/workflow-builder/PathContext';
import { ParametersPanel } from '@/components/workflow-builder/ParametersPanel';
import { DefaultTriggerCard } from '@/components/workflow-builder/DefaultTriggerCard';
import { OutputsPanel } from '@/components/workflow-builder/OutputsPanel';
import { ExecutionTimeline } from '@/components/workflow-builder/ExecutionTimeline';
import { TestSummaryCard } from '@/components/workflow-builder/TestSummaryCard';
import { AddNodeButton } from '@/components/workflow-builder/AddNodeButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type TreeNodeKind = 'trigger' | 'action' | 'conditional' | 'loop';

interface TreeNodeData {
  label: string;
  kind: TreeNodeKind;
  icon: LucideIcon;
  /** Backend’deki benzersiz node adı (aynı script’ten birden fazla eklerken çakışmayı önlemek için) */
  workflowNodeName?: string;
  isVirtual?: boolean;
  onDelete?: () => void;
  /** Konfigüre edilmiş parametreler (key → value); kartta özet göstermek için */
  params?: Record<string, any>;
  /** Action node’larda: en az bir parametre dolu → çerçeve yeşil; trigger’da kullanılmaz */
  paramsComplete?: boolean;
}

type TreeNode = Node;
type TreeEdge = Edge;

const NODE_HORIZONTAL_SPACING = 260;
const NODE_VERTICAL_SPACING = 180;

const toDisplayLabel = (s: string) =>
  (s || '')
    .replace(/_/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

/** API workflow içinde node adı benzersiz olmalı; aynı şablondan tekrar eklerken sonek üretir */
function makeUniqueWorkflowNodeName(base: string, existingNames: Iterable<string>): string {
  const taken = new Set(Array.from(existingNames, (n) => n.trim()).filter(Boolean));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

function valueIsFilled(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (typeof v === 'boolean') return true;
  if (typeof v === 'number') return !Number.isNaN(v);
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v as object).length > 0;
  return true;
}

function hasAnyFilledParam(params: Record<string, unknown> | undefined): boolean {
  if (!params || typeof params !== 'object') return false;
  return Object.values(params).some(valueIsFilled);
}

function buildExampleFromObjectSchema(schema: any): any {
  if (!schema?.properties) return {};
  const example: any = {};
  Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
    if (prop == null) {
      example[key] = null;
      return;
    }
    if (Object.prototype.hasOwnProperty.call(prop, 'value')) {
      const v = prop.value;
      if (Array.isArray(v)) {
        example[key] = v.map((item: any) =>
          item && typeof item === 'object' && item.properties ? buildExampleFromObjectSchema(item) : item
        );
      } else if (v && typeof v === 'object' && v.type === 'object' && v.properties) {
        example[key] = buildExampleFromObjectSchema(v);
      } else {
        example[key] = v;
      }
    } else if (prop.type === 'object' && prop.properties) {
      example[key] = buildExampleFromObjectSchema(prop);
    } else if (prop.type === 'array' && prop.items) {
      const one = prop.items?.type === 'object' && prop.items?.properties
        ? buildExampleFromObjectSchema(prop.items)
        : prop.items?.value ?? null;
      example[key] = one != null ? [one] : [];
    } else if (prop.type === 'string') {
      example[key] = prop.value ?? '';
    } else if (prop.type === 'integer' || prop.type === 'number') {
      example[key] = prop.value ?? 0;
    } else if (prop.type === 'boolean') {
      example[key] = prop.value ?? false;
    } else {
      example[key] = prop.value ?? null;
    }
  });
  return example;
}

function generateExampleOutputFromSchema(outputSchema: any): any {
  if (!outputSchema) return { message: 'Output schema not available' };
  if (outputSchema.type === 'object' && outputSchema.properties) {
    return buildExampleFromObjectSchema(outputSchema);
  }
  if (typeof outputSchema === 'object' && !outputSchema.type) {
    const example: any = {};
    Object.keys(outputSchema).forEach((key) => {
      const value = outputSchema[key];
      if (value && typeof value === 'object' && value.type === 'object' && value.properties) {
        example[key] = buildExampleFromObjectSchema(value);
      } else if (value && typeof value === 'object' && 'value' in value) {
        example[key] = value.value;
      } else if (typeof value === 'object') {
        example[key] = generateExampleOutputFromSchema(value);
      } else {
        example[key] = value;
      }
    });
    return example;
  }
  return { message: 'Output schema format not recognized' };
}

const DeletableEdge = (props: EdgeProps) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
  } = props;
  const gradientId = useId().replace(/:/g, '');
  const { deleteElements } = useReactFlow();
  const { currentWorkspace } = useWorkspace();
  const { id: workflowId } = useParams<{ id: string }>();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition ?? Position.Right,
    targetX,
    targetY,
    targetPosition: targetPosition ?? Position.Left,
  });

  const centerX = labelX ?? (sourceX + targetX) / 2;
  const centerY = labelY ?? (sourceY + targetY) / 2;

  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    await deleteElements({ edges: [{ id }] });

    const isSyntheticVirtual = String(id).startsWith('synthetic-virtual-');
    if (!isSyntheticVirtual && currentWorkspace?.id && workflowId && workflowId !== 'new') {
      try {
        await deleteEdgeFromWorkflow(currentWorkspace.id, workflowId, String(id));
      } catch (error) {
        console.error('Failed to delete edge from API:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to delete edge from workflow',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {/* Animating “data packet” along path — https://reactflow.dev/examples/edges/animating-edges */}
      <g className="pointer-events-none">
        <defs>
          <radialGradient id={`${gradientId}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.85} />
            <stop offset="45%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </radialGradient>
          <linearGradient id={`${gradientId}-core`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--background))" stopOpacity={1} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
          </linearGradient>
        </defs>
        <animateMotion dur="2.2s" repeatCount="indefinite" path={edgePath} rotate="auto" />
        {/* Dış parlama */}
        <circle r={12} fill={`url(#${gradientId}-glow)`} />
        {/* Dış hex çerçeve — “circuit / data” hissi */}
        <path
          d="M 0 -7 L 6.06 -3.5 L 6.06 3.5 L 0 7 L -6.06 3.5 L -6.06 -3.5 Z"
          fill="hsl(var(--primary) / 0.12)"
          stroke="hsl(var(--primary))"
          strokeWidth={1.15}
          strokeLinejoin="round"
          opacity={0.95}
        />
        {/* İç çekirdek */}
        <path
          d="M 0 -4 L 3.46 -2 L 3.46 2 L 0 4 L -3.46 2 L -3.46 -2 Z"
          fill={`url(#${gradientId}-core)`}
          stroke="hsl(var(--primary))"
          strokeWidth={0.45}
          strokeLinejoin="round"
        />
        <circle r={1.15} fill="hsl(var(--background))" opacity={0.98} />
      </g>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${centerX}px, ${centerY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            onClick={handleDelete}
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-surface border border-border/60 text-muted-foreground shadow-lg hover:bg-destructive hover:text-destructive-foreground hover:border-destructive/50 transition-all duration-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

/** Sadece çerçeve halkasında dönen ışık — kırmızı: parametre yok/boş; yeşil: en az bir parametre dolu/kayıtlı */
function NodeOrbitRing({ paramsComplete }: { paramsComplete: boolean }) {
  /* Geniş açılı bant — destructive (kırmızı) / success (yeşil) */
  const bg = paramsComplete
    ? 'conic-gradient(from 0deg, transparent 0deg, hsl(var(--success) / 0.08) 28deg, hsl(var(--success-glow) / 0.42) 38deg, hsl(var(--success) / 0.95) 48deg, hsl(var(--success-glow) / 1) 52deg, hsl(var(--success) / 0.52) 62deg, hsl(var(--success-glow) / 0.14) 78deg, transparent 92deg, transparent 360deg)'
    : 'conic-gradient(from 0deg, transparent 0deg, hsl(var(--destructive) / 0.08) 28deg, hsl(var(--destructive) / 0.42) 38deg, hsl(var(--destructive) / 0.95) 48deg, hsl(var(--destructive) / 1) 52deg, hsl(var(--destructive) / 0.52) 62deg, hsl(var(--destructive) / 0.14) 78deg, transparent 92deg, transparent 360deg)';

  const ringMask: CSSProperties = {
    padding: '2px',
    borderRadius: '1rem',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskImage: 'linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)',
    maskClip: 'content-box, border-box',
    maskComposite: 'exclude',
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 box-border overflow-hidden rounded-2xl"
      style={ringMask}
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2 animate-node-border-spin"
        style={{ background: bg }}
      />
    </div>
  );
}

const TriggerTreeNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as TreeNodeData;
  const Icon = nodeData.icon || Zap;
  const params = nodeData.params ?? {};
  const paramEntries = Object.entries(params);
  const hasParams = paramEntries.length > 0;

  const formatParamValue = (v: any): string => {
    if (v === undefined || v === null || v === '') return '—';
    if (typeof v === 'string') return v.length > 28 ? v.slice(0, 28) + '…' : v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    try {
      const s = JSON.stringify(v);
      return s.length > 28 ? s.slice(0, 28) + '…' : s;
    } catch {
      return '—';
    }
  };

  return (
    <div
      className={[
        'relative rounded-2xl min-w-[240px]',
        'border border-primary/25 bg-gradient-to-br from-primary/8 via-background to-background',
        'shadow-lg shadow-primary/[0.06] backdrop-blur-md transition-all duration-200',
        selected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl shadow-primary/20 border-primary/50'
          : 'hover:shadow-xl hover:shadow-primary/[0.08] hover:border-primary/40',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-primary to-primary/60" />

      <div className="pl-4 pr-3 py-3.5 overflow-hidden rounded-2xl">
        {nodeData.onDelete && !nodeData.isVirtual && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nodeData.onDelete?.();
            }}
            className="nodrag nopan absolute right-2.5 top-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-background/80 border border-border/40 text-muted-foreground hover:bg-destructive/15 hover:text-destructive hover:border-destructive/40 transition-all duration-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 ring-1 ring-inset ring-white/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="inline-flex w-fit rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary/90">
              Trigger
            </span>
            <span className="truncate text-sm font-semibold text-foreground">{nodeData.label}</span>
            {hasParams && (
              <div className="mt-1.5 space-y-1 rounded-lg border border-primary/15 bg-primary/5 px-2 py-1.5">
                {paramEntries.map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-0.5 text-xs">
                    <span className="font-medium text-foreground/90">{toDisplayLabel(key)}</span>
                    <span className="min-w-0 truncate text-muted-foreground">{formatParamValue(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bağlantı noktası - sağda (yatay akış) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, borderRadius: '50%', border: '2px solid hsl(var(--background))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        className="!w-4 !h-4 !min-w-4 !min-h-4 !rounded-full !bg-primary !border-2 !border-background !shadow-md hover:!bg-primary/90 !transition-colors"
      />
    </div>
  );
};

const ActionTreeNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as TreeNodeData;
  const Icon = nodeData.icon || Settings;
  const params = nodeData.params ?? {};
  const paramEntries = Object.entries(params);
  const hasParams = paramEntries.length > 0;

  const formatParamValue = (v: any): string => {
    if (v === undefined || v === null || v === '') return '—';
    if (typeof v === 'string') return v.length > 28 ? v.slice(0, 28) + '…' : v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    try {
      const s = JSON.stringify(v);
      return s.length > 28 ? s.slice(0, 28) + '…' : s;
    } catch {
      return '—';
    }
  };

  const badgeLabel =
    nodeData.kind === 'conditional'
      ? 'Condition'
      : nodeData.kind === 'loop'
        ? 'Loop'
        : 'Action';

  const isCondition = nodeData.kind === 'conditional';
  const isLoop = nodeData.kind === 'loop';

  return (
    <div className="relative rounded-2xl p-[2px] min-w-[240px]">
      <NodeOrbitRing paramsComplete={nodeData.paramsComplete === true} />
      <div
        className={[
          'relative z-[1] rounded-[calc(1rem-2px)] min-w-[240px]',
          'border border-border/50 bg-gradient-to-br from-surface/90 via-surface/70 to-background',
          'shadow-lg shadow-black/[0.04] backdrop-blur-md transition-all duration-200',
          selected
            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl shadow-primary/10 border-primary/40'
            : 'hover:shadow-xl hover:shadow-black/[0.06] hover:border-border hover:from-surface',
        ]
          .filter(Boolean)
          .join(' ')}
      >
      {/* Accent bar - subtle gradient */}
      <div
        className={[
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-[calc(1rem-2px)]',
          isCondition && 'bg-gradient-to-b from-amber-500/80 to-amber-600/60',
          isLoop && 'bg-gradient-to-b from-violet-500/80 to-violet-600/60',
          !isCondition && !isLoop && 'bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/20',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      <div className="pl-4 pr-3 py-3.5 overflow-hidden rounded-[calc(1rem-2px)]">
        {nodeData.onDelete && !nodeData.isVirtual && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nodeData.onDelete?.();
            }}
            className="nodrag nopan absolute right-2.5 top-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-background/80 border border-border/40 text-muted-foreground hover:bg-destructive/15 hover:text-destructive hover:border-destructive/40 transition-all duration-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ring-1 ring-inset ring-white/5',
              isCondition && 'bg-amber-500/10 border-amber-500/20',
              isLoop && 'bg-violet-500/10 border-violet-500/20',
              !isCondition && !isLoop && 'bg-accent/40 border-border/50',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Icon
              className={[
                'h-5 w-5',
                isCondition && 'text-amber-600 dark:text-amber-400',
                isLoop && 'text-violet-600 dark:text-violet-400',
                !isCondition && !isLoop && 'text-accent-foreground',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span
              className={[
                'inline-flex w-fit rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                isCondition && 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
                isLoop && 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
                !isCondition && !isLoop && 'bg-muted/80 text-muted-foreground',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {badgeLabel}
            </span>
            <span className="truncate text-sm font-semibold text-foreground">{nodeData.label}</span>
            {hasParams && (
              <div className="mt-1.5 space-y-1 rounded-lg border border-border/50 bg-muted/30 px-2 py-1.5">
                {paramEntries.map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-0.5 text-xs">
                    <span className="font-medium text-foreground/90">{toDisplayLabel(key)}</span>
                    <span className="min-w-0 truncate text-muted-foreground">{formatParamValue(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bağlantı noktası - solda (gelen oklar, yatay akış) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, borderRadius: '50%', border: '2px solid hsl(var(--background))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        className="!w-4 !h-4 !min-w-4 !min-h-4 !rounded-full !bg-muted-foreground/90 !border-2 !border-background !shadow-md hover:!bg-primary hover:!shadow-md hover:!ring-2 hover:!ring-primary/40 !transition-colors"
      />
      {/* Bağlantı noktası - sağda (giden oklar, yatay akış) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, borderRadius: '50%', border: '2px solid hsl(var(--background))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        className="!w-4 !h-4 !min-w-4 !min-h-4 !rounded-full !bg-muted-foreground/90 !border-2 !border-background !shadow-md hover:!bg-primary hover:!shadow-md hover:!ring-2 hover:!ring-primary/40 !transition-colors"
      />
      </div>
    </div>
  );
};

function detectNodeKindAndIcon(name: string): { kind: TreeNodeKind; icon: LucideIcon } {
  const normalized = (name || '').toLowerCase();

  if (normalized.includes('trigger') || normalized.includes('webhook') || normalized.includes('start')) {
    return { kind: 'trigger', icon: Zap };
  }

  if (normalized.includes('if') || normalized.includes('else') || normalized.includes('condition')) {
    return { kind: 'conditional', icon: GitBranch };
  }

  if (normalized.includes('loop') || normalized.includes('foreach') || normalized.includes('for each')) {
    return { kind: 'loop', icon: Repeat };
  }

  if (normalized.includes('gpt') || normalized.includes('openai') || normalized.includes('claude')) {
    return { kind: 'action', icon: MessageSquare };
  }

  if (normalized.includes('image') || normalized.includes('dall-e')) {
    return { kind: 'action', icon: Image };
  }

  if (normalized.includes('json')) {
    return { kind: 'action', icon: FileJson };
  }

  if (normalized.includes('text') || normalized.includes('replace')) {
    return { kind: 'action', icon: Type };
  }

  if (normalized.includes('date')) {
    return { kind: 'action', icon: Calendar };
  }

  return { kind: 'action', icon: Settings };
}

function applyTreeLayout(nodes: TreeNode[], edges: TreeEdge[]): TreeNode[] {
  if (nodes.length === 0) return nodes;

  const childrenMap = new Map<string, string[]>();
  const parentCount = new Map<string, number>();

  nodes.forEach((node) => {
    childrenMap.set(node.id, []);
    parentCount.set(node.id, 0);
  });

  edges.forEach((edge) => {
    const source = edge.source?.toString();
    const target = edge.target?.toString();
    if (!source || !target) return;
    if (!childrenMap.has(source)) {
      childrenMap.set(source, []);
    }
    childrenMap.get(source)!.push(target);
    parentCount.set(target, (parentCount.get(target) || 0) + 1);
  });

  const roots = nodes.filter((node) => (parentCount.get(node.id) || 0) === 0);
  const positioned = new Map<string, { x: number; y: number }>();
  let currentRow = 0;

  const layoutSubtree = (nodeId: string, depth: number): number => {
    const children = childrenMap.get(nodeId) || [];

    if (children.length === 0) {
      const row = currentRow++;
      positioned.set(nodeId, { x: depth, y: row });
      return 1;
    }

    const startRow = currentRow;
    let totalRows = 0;
    children.forEach((childId) => {
      totalRows += layoutSubtree(childId, depth + 1);
    });
    const centerRow = startRow + (totalRows - 1) / 2;
    positioned.set(nodeId, { x: depth, y: centerRow });
    return totalRows;
  };

  roots.forEach((root) => {
    layoutSubtree(root.id, 0);
  });

  nodes.forEach((node) => {
    if (!positioned.has(node.id)) {
      positioned.set(node.id, { x: 0, y: currentRow++ });
    }
  });

  return nodes.map((node) => {
    const pos = positioned.get(node.id)!;
    return {
      ...node,
      position: {
        x: pos.x * NODE_HORIZONTAL_SPACING,
        y: pos.y * NODE_VERTICAL_SPACING,
      },
    };
  });
}

const MAX_GRAPH_HISTORY = 40;
const TREE_EXPORT_FORMAT = 'purple-orbit-tree-workflow' as const;

type TreeGraphSnapshot = {
  nodes: TreeNode[];
  edges: TreeEdge[];
};

function snapshotGraph(nodes: TreeNode[], edges: TreeEdge[]): TreeGraphSnapshot {
  return {
    nodes: nodes.map((node) => {
      const raw = node.data as unknown as TreeNodeData;
      const { onDelete: _onDelete, ...rest } = raw;
      return {
        ...node,
        data: rest as unknown as Record<string, unknown>,
      } as TreeNode;
    }),
    edges: edges.map((e) => ({ ...e })),
  };
}

const VIRTUAL_TRIGGER_ID = 'virtual-trigger';

/** API’de ayrı trigger node’u yoksa kök action’lar gelen edge’siz kalır; sanal trigger yalnızca UI’dadır ve edge’ler persist edilmez. Yüklemede bu bağlantıları yeniden kuruyoruz. */
function synthesizeVirtualTriggerEdges(nodes: TreeNode[], edges: TreeEdge[]): TreeEdge[] {
  const hasRealTrigger = nodes.some(
    (n) => (n.data as unknown as TreeNodeData).kind === 'trigger'
  );
  if (nodes.length === 0 || hasRealTrigger) return [];

  const incoming = new Set<string>();
  edges.forEach((e) => {
    const t = e.target?.toString();
    if (t) incoming.add(t);
  });

  const roots = nodes.filter((n) => !incoming.has(n.id));
  return roots.map(
    (root) =>
      ({
        id: `synthetic-virtual-${root.id}`,
        source: VIRTUAL_TRIGGER_ID,
        target: root.id,
        type: 'deletable',
      }) as TreeEdge
  );
}

function mapWorkflowGraphToTree(workflowData: any): { nodes: TreeNode[]; edges: TreeEdge[] } {
  const backendNodes: any[] = Array.isArray(workflowData.nodes) ? workflowData.nodes : [];
  const backendEdges: any[] = Array.isArray(workflowData.edges) ? workflowData.edges : [];

  const nodes: TreeNode[] = backendNodes.map((apiNode) => {
    const rawName: string = apiNode.name || apiNode.script_name || 'Node';
    const label = (rawName || '')
      .replace(/_/g, ' ')
      .trim()
      .split(/\s+/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const { kind, icon } = detectNodeKindAndIcon(rawName);

    return {
      id: apiNode.id?.toString() ?? apiNode.node_id?.toString() ?? `node-${Math.random().toString(36).slice(2)}`,
      data: {
        label,
        kind,
        icon,
        workflowNodeName: typeof apiNode.name === 'string' ? apiNode.name : rawName,
      },
      position: { x: 0, y: 0 },
      type: kind === 'trigger' ? 'triggerNode' : 'actionNode',
    };
  });

  const edges: TreeEdge[] = backendEdges
    .map((edge, index) => {
      const fromId = edge.from_node_id || edge.from || edge.source;
      const toId = edge.to_node_id || edge.to || edge.target;
      if (!fromId || !toId) return null;
      return {
        id: edge.id?.toString() ?? `edge-${index}-${fromId}-${toId}`,
        source: fromId.toString(),
        target: toId.toString(),
        type: 'deletable',
      } as TreeEdge;
    })
    .filter(Boolean) as TreeEdge[];

  return {
    nodes: applyTreeLayout(nodes, edges),
    edges,
  };
}

export default function TreeWorkflowEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentWorkspace } = useWorkspace();

  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [edges, setEdges] = useState<TreeEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [showOutputsPanel, setShowOutputsPanel] = useState(false);
  const [showParamsPanel, setShowParamsPanel] = useState(false);

  const [triggerData, setTriggerData] = useState<{
    input_mapping: Record<string, { type: string; value: any }>;
  } | null>(null);

  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);

  const [activeTab, setActiveTab] = useState<'editor' | 'test'>('editor');
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionData, setExecutionData] = useState<any | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [isLoadingExecution, setIsLoadingExecution] = useState(false);
  const [isStoppingExecution, setIsStoppingExecution] = useState(false);
  const [showStopConfirmDialog, setShowStopConfirmDialog] = useState(false);

  const [nodeOutputs, setNodeOutputs] = useState<Record<string, { nodeId: string; nodeName: string; icon: LucideIcon; output: any }>>({});
  const [nodeParams, setNodeParams] = useState<Record<string, Record<string, any>>>({});
  const [isLoadingOutputs, setIsLoadingOutputs] = useState(false);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const pastSnapshots = useRef<TreeGraphSnapshot[]>([]);
  const futureSnapshots = useRef<TreeGraphSnapshot[]>([]);
  const skipHistoryRef = useRef(true);
  const isRestoringHistoryRef = useRef(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    pastSnapshots.current = [];
    futureSnapshots.current = [];
    setCanUndo(false);
    setCanRedo(false);
    skipHistoryRef.current = Boolean(currentWorkspace?.id && id && id !== 'new');
  }, [id, currentWorkspace?.id]);

  const recordHistory = useCallback(() => {
    if (skipHistoryRef.current || isRestoringHistoryRef.current) return;
    pastSnapshots.current.push(snapshotGraph(nodesRef.current, edgesRef.current));
    if (pastSnapshots.current.length > MAX_GRAPH_HISTORY) {
      pastSnapshots.current.shift();
    }
    futureSnapshots.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const onBeforeDelete = useCallback(
    async ({
      nodes: nodesToRemove,
      edges: edgesToRemove,
    }: {
      nodes: Node[];
      edges: Edge[];
    }) => {
      const nList = nodesToRemove as TreeNode[];
      const eList = edgesToRemove as TreeEdge[];
      const nonVirtual = nList.filter((n) => !(n.data as unknown as TreeNodeData).isVirtual);
      if (nonVirtual.length !== nList.length && nonVirtual.length === 0 && eList.length === 0) {
        return false;
      }
      if (!skipHistoryRef.current && !isRestoringHistoryRef.current && (nonVirtual.length > 0 || eList.length > 0)) {
        recordHistory();
      }
      if (nonVirtual.length !== nList.length) {
        return { nodes: nonVirtual, edges: eList };
      }
      return true;
    },
    [recordHistory]
  );

  const nodeTypes = useMemo(
    () => ({
      triggerNode: TriggerTreeNode,
      actionNode: ActionTreeNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      deletable: DeletableEdge,
    }),
    []
  );

  const nodesWithParams = useMemo(
    () =>
      nodes.map((n) => {
        const nd = n.data as unknown as TreeNodeData;
        const raw = nodeParams[n.id];
        const paramsComplete = nd.kind === 'trigger' ? false : hasAnyFilledParam(raw);
        return {
          ...n,
          data: {
            ...n.data,
            params: raw ?? {},
            paramsComplete,
          },
        };
      }),
    [nodes, nodeParams]
  );

  useEffect(() => {
    const loadWorkflowFromAPI = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        skipHistoryRef.current = false;
        return;
      }

      if (!currentWorkspace?.id || !id || id === 'new') {
        skipHistoryRef.current = false;
        return;
      }

      setIsLoadingWorkflow(true);
      skipHistoryRef.current = true;
      try {
        const response = await getWorkflowGraph(currentWorkspace.id, id);

        if (response.status === 'success' && response.data) {
          const workflowData = response.data;

          if (workflowData.workflow_name) {
            setWorkflowName(workflowData.workflow_name);
          }

          if (workflowData.status) {
            setIsActive(
              workflowData.status === 'ACTIVE' ||
                workflowData.status === 'active'
            );
          }

          const mapped = mapWorkflowGraphToTree(workflowData);
          setNodes(withNodeActions(mapped.nodes));
          const apiEdges = mapped.edges.map(
            (edge) =>
              ({
                ...edge,
                type: 'deletable',
              } as TreeEdge)
          );
          const restoredVirtualEdges = synthesizeVirtualTriggerEdges(mapped.nodes, apiEdges);
          setEdges([...apiEdges, ...restoredVirtualEdges]);
        }
      } catch (error) {
        console.error('Error loading workflow graph for tree editor:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to load workflow graph for tree editor',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingWorkflow(false);
        skipHistoryRef.current = false;
      }
    };

    loadWorkflowFromAPI();
  }, [id, currentWorkspace?.id]);

  // Fetch output schema for each node so Outputs panel shows example structure before any test run
  // Aynı fetch'te her node için form_schema'dan parametre değerlerini alıp nodeParams'a yazıyoruz
  useEffect(() => {
    const paramsFromFormSchema = (formSchema: Record<string, { value?: any }> | undefined): Record<string, any> => {
      if (!formSchema || typeof formSchema !== 'object') return {};
      return Object.fromEntries(
        Object.entries(formSchema).map(([k, v]) => [k, v?.value])
      );
    };

    const fetchNodeOutputs = async () => {
      if (!currentWorkspace?.id || !id || id === 'new' || nodes.length === 0) return;
      setIsLoadingOutputs(true);
      const outputs: Record<string, { nodeId: string; nodeName: string; icon: LucideIcon; output: any }> = {};
      const paramsMap: Record<string, Record<string, any>> = {};
      try {
        await Promise.all(
          nodes.map(async (node) => {
            const nodeData = node.data as unknown as TreeNodeData;
            if (nodeData.isVirtual) {
              outputs[node.id] = {
                nodeId: node.id,
                nodeName: nodeData.label,
                icon: nodeData.icon || Settings,
                output: { message: 'Trigger çıktısı test çalıştırıldığında burada görünecek.' },
              };
              return;
            }
            try {
              const response = await getNodeFormSchema(currentWorkspace.id, id, node.id);
              if (response.status === 'success' && response.data) {
                const outputSchema = response.data.output_schema;
                const exampleOutput = generateExampleOutputFromSchema(outputSchema);
                outputs[node.id] = {
                  nodeId: node.id,
                  nodeName: response.data.node_name || nodeData.label,
                  icon: nodeData.icon || Settings,
                  output: exampleOutput,
                };
                if (response.data.form_schema) {
                  paramsMap[node.id] = paramsFromFormSchema(response.data.form_schema as Record<string, { value?: any }>);
                }
              }
            } catch {
              outputs[node.id] = {
                nodeId: node.id,
                nodeName: nodeData.label,
                icon: nodeData.icon || Settings,
                output: { message: 'Output schema could not be loaded' },
              };
            }
          })
        );
        setNodeOutputs(outputs);
        setNodeParams((prev) => ({ ...prev, ...paramsMap }));
      } catch (error) {
        console.error('Error fetching node outputs:', error);
      } finally {
        setIsLoadingOutputs(false);
      }
    };
    fetchNodeOutputs();
  }, [nodes, currentWorkspace?.id, id]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const checkCreatesCycle = useCallback(
    (sourceId: string, targetId: string) => {
      const adjacency = new Map<string, string[]>();
      edges.forEach((e) => {
        const s = e.source.toString();
        const t = e.target.toString();
        if (!adjacency.has(s)) adjacency.set(s, []);
        adjacency.get(s)!.push(t);
      });

      const stack: string[] = [targetId];
      const visited = new Set<string>();

      while (stack.length > 0) {
        const current = stack.pop()!;
        if (current === sourceId) return true;
        if (visited.has(current)) continue;
        visited.add(current);
        const next = adjacency.get(current) || [];
        next.forEach((n) => stack.push(n));
      }

      return false;
    },
    [edges]
  );

  const handleConnect = useCallback(
    async (connection: Connection) => {
      const { source, target } = connection;
      if (!source || !target) return;

      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);

      if (!sourceNode || !targetNode) return;

      const sourceData = sourceNode.data as unknown as TreeNodeData;
      const targetData = targetNode.data as unknown as TreeNodeData;
      const isSourceVirtual = !!sourceData.isVirtual;
      const isTargetVirtual = !!targetData.isVirtual;

      if (targetData.kind === 'trigger') {
        toast({
          title: 'Invalid connection',
          description: 'Trigger node cannot have a parent in tree view.',
          variant: 'destructive',
        });
        return;
      }

      const hasParent = edges.some((e) => e.target.toString() === target);
      if (hasParent) {
        toast({
          title: 'Invalid connection',
          description: 'Each node can only have a single parent in tree mode.',
          variant: 'destructive',
        });
        return;
      }

      if (checkCreatesCycle(source.toString(), target.toString())) {
        toast({
          title: 'Invalid connection',
          description: 'This connection would create a cycle. Tree must remain acyclic.',
          variant: 'destructive',
        });
        return;
      }

      recordHistory();

      // Persist edge only when both endpoints are real backend nodes
      if (currentWorkspace?.id && id && id !== 'new' && !isSourceVirtual && !isTargetVirtual) {
        try {
          const response = await addEdgeToWorkflow(currentWorkspace.id, id, {
            from_node_id: source.toString(),
            to_node_id: target.toString(),
          });

          const apiEdgeId =
            response.data?.id ||
            response.data?.edge_id ||
            response.data?.edgeId ||
            response.data?.edge?.id;

          setEdges(
            (eds) =>
              addEdge(
                {
                  ...connection,
                  id: apiEdgeId ? String(apiEdgeId) : undefined,
                  type: 'deletable',
                },
                eds
              ) as TreeEdge[]
          );
          return;
        } catch (error) {
          console.error('Failed to persist edge:', error);
          toast({
            title: 'Error',
            description:
              error instanceof Error ? error.message : 'Failed to save connection',
            variant: 'destructive',
          });
          return;
        }
      }

      // Fallback: local-only edge (e.g. new workflow not yet persisted or virtual endpoint)
      setEdges(
        (eds) =>
          addEdge(
            {
              ...connection,
              type: 'deletable',
            },
            eds
          ) as TreeEdge[]
      );
    },
    [nodes, edges, currentWorkspace?.id, id, checkCreatesCycle, recordHistory]
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const dynamicOutputs = useMemo(
    () =>
      nodes.map((node) => {
        const nodeData = node.data as unknown as TreeNodeData;
        const fromExecution = executionData?.results?.[node.id]?.result_data;
        const fromSchema = nodeOutputs[node.id]?.output;
        return {
          nodeId: node.id,
          nodeName: nodeOutputs[node.id]?.nodeName ?? nodeData.label,
          icon: nodeOutputs[node.id]?.icon ?? nodeData.icon ?? Settings,
          output: fromExecution ?? fromSchema ?? { message: 'Henüz çalıştırma yok. Test çalıştırın veya örnek yapı yükleniyor.' },
        };
      }),
    [nodes, executionData, nodeOutputs]
  );

  // Execution order: BFS from trigger (root) so OutputsPanel can show "previous outputs" like Zapier.
  const outputsInExecutionOrder = useMemo(() => {
    if (nodes.length === 0 || edges.length === 0) {
      return dynamicOutputs;
    }
    const triggerNode = nodes.find((n) => (n.data as { kind?: string })?.kind === 'trigger');
    if (!triggerNode) return dynamicOutputs;

    const orderIds: string[] = [triggerNode.id];
    const queue = [triggerNode.id];
    const seen = new Set<string>([triggerNode.id]);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      edges.forEach((e) => {
        if (e.source !== cur || seen.has(e.target)) return;
        seen.add(e.target);
        orderIds.push(e.target);
        queue.push(e.target);
      });
    }

    const byId = new Map(dynamicOutputs.map((o) => [o.nodeId, o]));
    return orderIds.map((id) => byId.get(id)).filter((o): o is NonNullable<typeof o> => o != null);
  }, [dynamicOutputs, nodes, edges]);

  const deleteNodeById = useCallback(async (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const nodeData = node.data as unknown as TreeNodeData;

    // Prevent deleting virtual trigger node
    if (nodeData.isVirtual) {
      toast({
        title: 'Cannot delete trigger',
        description: 'The virtual trigger node cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }

    recordHistory();

    // Delete on backend when possible
    if (currentWorkspace?.id && id && id !== 'new') {
      try {
        await deleteNodeFromWorkflow(currentWorkspace.id, id, nodeId);
      } catch (error) {
        console.error('Failed to delete node from API:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to delete node from workflow',
          variant: 'destructive',
        });
      }
    }

    // Remove node and its connected edges locally
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) =>
      prev.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );

    setSelectedNodeId((prev) => (prev === nodeId ? null : prev));
    setSelectedEdgeId(null);
    setShowParamsPanel(false);
    setShowOutputsPanel(false);
  }, [nodes, currentWorkspace?.id, id, recordHistory]);

  const handleDeleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    deleteNodeById(selectedNodeId);
  }, [selectedNodeId, deleteNodeById]);

  const handleDeleteSelectedEdge = useCallback(async () => {
    if (!selectedEdgeId) return;

    recordHistory();
    // Currently there is no delete-edge API, so we only update local state
    setEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  }, [selectedEdgeId, recordHistory]);

  const withNodeActions = useCallback(
    (inputNodes: TreeNode[]): TreeNode[] =>
      inputNodes.map((node) => {
        const data = node.data as unknown as TreeNodeData;
        const enhanced: TreeNodeData = {
          ...data,
          onDelete: () => {
            deleteNodeById(node.id);
          },
        };
        return {
          ...node,
          data: enhanced as unknown as Record<string, unknown>,
        } as TreeNode;
      }),
    [deleteNodeById]
  );

  const handleUndo = useCallback(() => {
    if (pastSnapshots.current.length === 0) return;
    isRestoringHistoryRef.current = true;
    const currentSnap = snapshotGraph(nodesRef.current, edgesRef.current);
    futureSnapshots.current.push(currentSnap);
    const prev = pastSnapshots.current.pop()!;
    const restoredNodes = withNodeActions(prev.nodes);
    setNodes(restoredNodes);
    setEdges([...prev.edges]);
    setCanUndo(pastSnapshots.current.length > 0);
    setCanRedo(futureSnapshots.current.length > 0);
    queueMicrotask(() => {
      isRestoringHistoryRef.current = false;
    });
  }, [withNodeActions]);

  const handleRedo = useCallback(() => {
    if (futureSnapshots.current.length === 0) return;
    isRestoringHistoryRef.current = true;
    const currentSnap = snapshotGraph(nodesRef.current, edgesRef.current);
    pastSnapshots.current.push(currentSnap);
    const next = futureSnapshots.current.pop()!;
    const restoredNodes = withNodeActions(next.nodes);
    setNodes(restoredNodes);
    setEdges([...next.edges]);
    setCanUndo(pastSnapshots.current.length > 0);
    setCanRedo(futureSnapshots.current.length > 0);
    queueMicrotask(() => {
      isRestoringHistoryRef.current = false;
    });
  }, [withNodeActions]);

  const handleAutoLayout = useCallback(() => {
    if (activeTab !== 'editor' || isLoadingWorkflow) return;
    recordHistory();
    setNodes((prevNodes) => {
      const laidOut = applyTreeLayout(prevNodes, edgesRef.current);
      return withNodeActions(laidOut);
    });
  }, [activeTab, isLoadingWorkflow, recordHistory, withNodeActions]);

  const handleFitView = useCallback(() => {
    if (activeTab !== 'editor') return;
    reactFlowRef.current?.fitView({ padding: 0.2, duration: 220 });
  }, [activeTab]);

  const handleExportLayoutJson = useCallback(() => {
    try {
      const snap = snapshotGraph(nodes, edges);
      const payload = {
        format: TREE_EXPORT_FORMAT,
        version: 1,
        exportedAt: new Date().toISOString(),
        workflowName,
        workflowId: id ?? null,
        nodes: snap.nodes,
        edges: snap.edges,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (workflowName || 'untitled').replace(/[^\w\-]+/g, '-').slice(0, 80) || 'untitled';
      a.download = `workflow-layout-${safeName}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Exported', description: 'Canvas layout saved as JSON.' });
    } catch {
      toast({ title: 'Export failed', description: 'Could not build the file.', variant: 'destructive' });
    }
  }, [workflowName, id, nodes, edges]);

  const handleImportLayoutJson = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const data = JSON.parse(text) as {
            format?: string;
            nodes?: TreeNode[];
            edges?: TreeEdge[];
          };
          if (data.format !== TREE_EXPORT_FORMAT || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
            toast({
              title: 'Invalid file',
              description: 'Use a JSON file exported from this editor.',
              variant: 'destructive',
            });
            return;
          }
          const nodeIds = new Set(data.nodes.map((n) => n.id));
          const validEdges = data.edges.filter(
            (e) => nodeIds.has(String(e.source)) && nodeIds.has(String(e.target))
          );
          recordHistory();
          const restored = withNodeActions(data.nodes);
          setNodes(restored);
          setEdges(
            validEdges.map((e) => ({ ...e, type: (e.type as string) || 'deletable' })) as TreeEdge[]
          );
          toast({ title: 'Imported', description: 'Canvas layout was replaced from the file.' });
        } catch {
          toast({
            title: 'Import failed',
            description: 'Could not parse the JSON file.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    },
    [recordHistory, withNodeActions]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (activeTab !== 'editor') return;
      const el = e.target as HTMLElement | null;
      if (el?.closest('input, textarea, [contenteditable=true]')) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (mod && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTab, handleUndo, handleRedo]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds) as TreeNode[];
        return withNodeActions(updated);
      });
    },
    [withNodeActions]
  );

  const handleAddNode = useCallback(
    async (category: string, subcategory: string, nodeName: string, scriptId: string) => {
      const { kind, icon } = detectNodeKindAndIcon(nodeName);

      // If workspace/workflow not ready, work only in local state
      if (!currentWorkspace?.id || !id || id === 'new') {
        recordHistory();
        const displayLabel = toDisplayLabel(nodeName);
        const newId = `node-${Date.now()}`;
        const newNode: TreeNode = {
          id: newId,
          data: {
            label: displayLabel,
            kind,
            icon,
          },
          position: { x: 0, y: 0 },
          type: kind === 'trigger' ? 'triggerNode' : 'actionNode',
        };

        setNodes((prevNodes) => {
          const updatedNodes = withNodeActions([...prevNodes, newNode]);
          const laidOutNodes = applyTreeLayout(updatedNodes, edges);
          return laidOutNodes;
        });
        if (edges.length === 0) {
          const triggerId = nodes.find((n) => (n.data as { kind?: string })?.kind === 'trigger')?.id ?? VIRTUAL_TRIGGER_ID;
          setEdges((prev) => [
            ...prev,
            { id: `e-${triggerId}-${newId}`, source: triggerId, target: newId, type: 'deletable' },
          ]);
        }
        setSelectedNodeId(newId);
        return;
      }

      // Backend‑persisted node
      try {
        const existingNames = nodes
          .map((n) => (n.data as unknown as TreeNodeData).workflowNodeName)
          .filter((n): n is string => typeof n === 'string' && n.length > 0);
        const uniqueNodeName = makeUniqueWorkflowNodeName(nodeName, existingNames);
        const displayLabel = toDisplayLabel(uniqueNodeName);

        const nodeDescription = `${toDisplayLabel(
          nodeName
        )} node from ${toDisplayLabel(category)} > ${toDisplayLabel(subcategory)}`;

        const nodeData = {
          name: uniqueNodeName,
          script_id: scriptId,
          description: nodeDescription,
          input_params: {} as Record<string, any>,
        };

        const response = await addNodeToWorkflow(currentWorkspace.id, id, nodeData);
        const apiNodeId =
          response.data?.id ||
          response.data?.node_id ||
          `node-${Date.now()}`;

        const newNode: TreeNode = {
          id: apiNodeId.toString(),
          data: {
            label: displayLabel,
            kind,
            icon,
            workflowNodeName: uniqueNodeName,
          },
          position: { x: 0, y: 0 },
          type: kind === 'trigger' ? 'triggerNode' : 'actionNode',
        };

        recordHistory();

        setNodes((prevNodes) => {
          const updatedNodes = withNodeActions([...prevNodes, newNode]);
          const laidOutNodes = applyTreeLayout(updatedNodes, edges);
          return laidOutNodes;
        });
        if (edges.length === 0) {
          const triggerId = nodes.find((n) => (n.data as { kind?: string })?.kind === 'trigger')?.id ?? VIRTUAL_TRIGGER_ID;
          const isVirtualTrigger = triggerId === VIRTUAL_TRIGGER_ID;
          if (!isVirtualTrigger) {
            try {
              await addEdgeToWorkflow(currentWorkspace.id, id, {
                from_node_id: triggerId,
                to_node_id: apiNodeId.toString(),
              });
            } catch (err) {
              console.error('Failed to persist trigger→node edge:', err);
            }
          }
          setEdges((prev) => [
            ...prev,
            {
              id: `e-${triggerId}-${apiNodeId}`,
              source: triggerId,
              target: apiNodeId.toString(),
              type: 'deletable',
            },
          ]);
        }
        setSelectedNodeId(newNode.id);

        toast({
          title: 'Success',
          description: 'Node added to workflow successfully.',
        });
      } catch (error) {
        console.error('Failed to add node:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to add node to workflow.',
          variant: 'destructive',
        });
      }
    },
    [nodes, edges, selectedNodeId, currentWorkspace?.id, id, recordHistory]
  );

  const fetchExecutionDetails = useCallback(
    async (execId: string) => {
      if (!currentWorkspace?.id) return;

      setIsLoadingExecution(true);
      try {
        const response = await getExecution(currentWorkspace.id, execId);
        if (response.status === 'success' && response.data) {
          setExecutionData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch execution details:', error);
        toast({
          title: 'Warning',
          description: 'Failed to load execution details.',
          variant: 'default',
        });
      } finally {
        setIsLoadingExecution(false);
      }
    },
    [currentWorkspace?.id]
  );

  const handleTest = useCallback(async () => {
    if (!currentWorkspace?.id || !id || id === 'new') {
      toast({
        title: 'Error',
        description: 'Please save the workflow before testing.',
        variant: 'destructive',
      });
      return;
    }

    setIsRunningTest(true);
    setActiveTab('test');

    try {
      const inputData: Record<string, any> = {};

      if (triggerData && triggerData.input_mapping) {
        Object.entries(triggerData.input_mapping).forEach(
          ([paramKey, mappingValue]) => {
            inputData[paramKey] = (mappingValue as any).value;
          }
        );
      }

      if (Object.keys(inputData).length === 0) {
        inputData.test = 'data';
      }

      const testData = {
        input_data: inputData,
      };

      const response = await testWorkflowExecution(
        currentWorkspace.id,
        id,
        testData
      );

      const executionIdFromResponse =
        response.data?.execution_id ||
        response.data?.id ||
        response.data?.executionId;

      if (executionIdFromResponse) {
        setExecutionId(executionIdFromResponse);
        await fetchExecutionDetails(executionIdFromResponse);
      } else {
        toast({
          title: 'Warning',
          description: 'Execution started but execution ID not found in response.',
          variant: 'default',
        });
      }

      toast({
        title: 'Success',
        description: 'Workflow test execution started successfully.',
      });
    } catch (error) {
      console.error('Failed to test workflow:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to test workflow execution',
        variant: 'destructive',
      });
    } finally {
      setIsRunningTest(false);
    }
  }, [currentWorkspace?.id, id, fetchExecutionDetails, triggerData]);

  useEffect(() => {
    if (!executionId || !currentWorkspace?.id) return;

    const pollInterval = setInterval(() => {
      if (
        executionData?.status === 'RUNNING' ||
        executionData?.status === 'running' ||
        executionData?.status === 'PENDING' ||
        executionData?.status === 'pending'
      ) {
        fetchExecutionDetails(executionId);
      } else {
        clearInterval(pollInterval);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [executionId, currentWorkspace?.id, fetchExecutionDetails, executionData?.status]);

  const handleStopExecution = useCallback(async () => {
    if (!currentWorkspace?.id || !executionId) return;

    setIsStoppingExecution(true);
    setShowStopConfirmDialog(false);
    try {
      const response = await stopExecution(currentWorkspace.id, executionId);
      if (response.status === 'success') {
        setActiveTab('test');
        setExecutionData((prev: any) =>
          prev ? { ...prev, status: 'CANCELLED' } : { id: executionId, status: 'CANCELLED' }
        );
        fetchExecutionDetails(executionId).then(() => {});
        toast({
          title: 'Execution stopped',
          description: 'Test execution was cancelled successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to stop execution:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to stop execution.',
        variant: 'destructive',
      });
    } finally {
      setIsStoppingExecution(false);
    }
  }, [currentWorkspace?.id, executionId, fetchExecutionDetails]);

  const executionTimelineNodes = useMemo(() => {
    if (!executionData || !executionData.results) return [];

    return nodes.map((node, index) => {
      const result = executionData.results[node.id] || {};
      const nodeData = node.data as unknown as TreeNodeData;
      const NodeIcon = nodeData.icon || Settings;

      return {
        nodeId: node.id,
        nodeName: nodeData.label,
        nodeIcon: NodeIcon,
        status: result.status || 'PENDING',
        inputData: result.input_data,
        outputData: result.result_data,
        metadata: {
          duration_seconds: result.duration_seconds || 0,
          completed_at: executionData.ended_at || executionData.started_at,
        },
        errorMessage: result.error_message || null,
        order: index + 1,
      };
    });
  }, [nodes, executionData]);

  const totalDuration = executionData?.duration || 0;

  // Ensure there is always a visible trigger node on the canvas when backend graph
  // does not provide one. Virtual→root edges are not stored by the API; they are
  // re-added in load via synthesizeVirtualTriggerEdges.
  useEffect(() => {
    setNodes((prevNodes) => {
      const hasTrigger = prevNodes.some((n) => (n.data as { kind?: string })?.kind === 'trigger');
      if (hasTrigger) return prevNodes;

      const virtualTrigger: TreeNode = {
        id: VIRTUAL_TRIGGER_ID,
        data: {
          label: 'Workflow Trigger',
          kind: 'trigger',
          icon: Zap,
          isVirtual: true,
        },
        position: { x: 0, y: 0 },
        type: 'triggerNode',
      };

      return withNodeActions([virtualTrigger, ...prevNodes]);
    });
  }, [edges, withNodeActions]);

  return (
    <PathProvider>
      <div className="flex h-screen flex-col bg-background overflow-hidden">
        {/* Subtle tech gradient overlay */}
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_80%_at_100%_100%,hsl(var(--primary)/0.04),transparent)]" />

        <header className="relative z-10 border-b border-border/40 bg-background/70 backdrop-blur-xl">
          <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-9 w-9 rounded-xl border border-transparent hover:border-border/60 hover:bg-surface/60 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-col gap-0.5">
                {isEditingName ? (
                  <input
                    className="bg-surface/50 rounded-lg px-3 py-1.5 text-lg font-semibold outline-none border border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    autoFocus
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingName(false);
                    }}
                  />
                ) : (
                  <button
                    className="text-left text-lg font-semibold text-foreground hover:text-primary transition-colors rounded px-1 -mx-1 py-0.5"
                    onClick={() => setIsEditingName(true)}
                  >
                    {workflowName}
                  </button>
                )}
                <span className="text-[11px] font-medium text-muted-foreground/90 tracking-wide">
                  Tree workflow · React Flow
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <TooltipProvider delayDuration={400}>
                <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-surface/40 p-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={!canUndo}
                        onClick={handleUndo}
                        aria-label="Undo"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={!canRedo}
                        onClick={handleRedo}
                        aria-label="Redo"
                      >
                        <Redo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Redo (Ctrl+Y or Ctrl+Shift+Z)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={activeTab !== 'editor' || isLoadingWorkflow || nodes.length === 0}
                        onClick={handleAutoLayout}
                        aria-label="Auto layout"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Auto-align tree layout</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={activeTab !== 'editor' || isLoadingWorkflow || nodes.length === 0}
                        onClick={handleFitView}
                        aria-label="Fit view"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Fit graph to view</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={nodes.length === 0}
                        onClick={handleExportLayoutJson}
                        aria-label="Export layout JSON"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Download layout as JSON</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => importFileInputRef.current?.click()}
                        aria-label="Import layout JSON"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Replace layout from JSON file</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              <input
                ref={importFileInputRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) handleImportLayoutJson(file);
                }}
              />

              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface/40 px-3 py-1.5">
                <Label htmlFor="workflow-active" className="text-xs text-muted-foreground font-medium">
                  Active
                </Label>
                <Switch
                  id="workflow-active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked)}
                />
              </div>

              <Button
                variant={showParamsPanel ? 'secondary' : 'outline'}
                size="sm"
                disabled={!selectedNodeId}
                onClick={() => setShowParamsPanel((v) => !v)}
                className="rounded-xl border-border/60 h-9 gap-2 font-medium"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Node Config</span>
              </Button>

              <Button
                size="sm"
                onClick={handleTest}
                disabled={isRunningTest || !currentWorkspace?.id || !id || id === 'new'}
                className="rounded-xl h-9 gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                data-tour-id="tree-editor-run-button"
              >
                {isRunningTest ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>Run Test</span>
              </Button>
            </div>
          </div>

          <div className="container mx-auto px-6 pb-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'editor' | 'test')}>
              <TabsList className="h-10 p-1 rounded-xl bg-surface/50 border border-border/40 gap-1">
                <TabsTrigger
                  value="editor"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground font-medium px-4"
                >
                  Editor
                </TabsTrigger>
                <TabsTrigger
                  value="test"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground font-medium px-4"
                >
                  Test
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'editor' | 'test')}>
          <TabsContent value="editor" className="mt-0">
            <div className="relative h-[calc(100vh-112px)] bg-background">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="relative flex h-full flex-col">
                

                <div className="relative flex-1">
                  {isLoadingWorkflow ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                          <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Loading workflow...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ReactFlow
                        nodes={nodesWithParams}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onInit={(instance) => {
                          reactFlowRef.current = instance;
                        }}
                        onBeforeDelete={onBeforeDelete}
                        onNodeDragStart={() => {
                          recordHistory();
                        }}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={handleEdgesChange}
                        onConnect={handleConnect}
                        onEdgeClick={(_, edge) => {
                          setSelectedEdgeId(edge.id);
                          setSelectedNodeId(null);
                          setShowParamsPanel(false);
                          setShowOutputsPanel(false);
                        }}
                        fitView
                        className="!bg-transparent"
                        onNodeClick={(_, node) => {
                          setSelectedNodeId(node.id);
                          setSelectedEdgeId(null);
                          const nodeData = node.data as unknown as TreeNodeData;
                          setShowOutputsPanel(nodeData.kind !== 'trigger');
                          setShowParamsPanel(true);
                        }}
                      >
                        <Background gap={24} size={1} className="!stroke-border/40" />
                        <MiniMap
                          pannable
                          zoomable
                          nodeStrokeColor="hsl(var(--primary))"
                          nodeColor="hsl(var(--primary) / 0.12)"
                          maskColor="hsl(var(--background) / 0.8)"
                          className="!rounded-xl !overflow-hidden !border !border-border/50 !shadow-lg"
                        />
                        <Controls
                          className="!rounded-xl !overflow-hidden !border !border-border/50 !shadow-lg !bg-surface/95 [&>button]:!rounded-lg [&>button]:!border-0 [&>button]:!bg-surface [&>button]:!text-muted-foreground [&>button:hover]:!bg-primary/10 [&>button:hover]:!text-primary"
                        />
                      </ReactFlow>

                      <div className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2">
                        <div className="pointer-events-auto rounded-xl border border-border/50 bg-surface/95 shadow-lg backdrop-blur-sm">
                          <AddNodeButton
                            onAddNode={(cat, sub, type, scriptId) =>
                              handleAddNode(cat, sub, type, scriptId)
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {selectedNode && showOutputsPanel && (
                <>
                  {/* Backdrop for closing on outside click (only when node config panel is closed) */}
                  {!showParamsPanel && (
                    <div
                      className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm"
                      onClick={() => setShowOutputsPanel(false)}
                    />
                  )}
                  <div
                    className="pointer-events-none absolute inset-y-0 z-50  max-w-full"
                    style={{ right: showParamsPanel ? 350 : 0 }}
                  >
                    <div className="pointer-events-auto h-full">
                      <OutputsPanel
                        outputs={outputsInExecutionOrder}
                        isOpen={true}
                        currentNodeId={selectedNode?.id}
                        triggerData={triggerData}
                        data-tour-id="tree-editor-outputs-panel"
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedNode && showParamsPanel && (selectedNode.data as unknown as TreeNodeData).kind === 'trigger' && (
                <DefaultTriggerCard
                  workspaceId={currentWorkspace?.id}
                  workflowId={id ?? undefined}
                  onTriggerDataChange={setTriggerData}
                  openEditImmediately
                  onEditClose={() => {
                    setShowParamsPanel(false);
                    setShowOutputsPanel(false);
                  }}
                />
              )}

              {selectedNode && showParamsPanel && (selectedNode.data as unknown as TreeNodeData).kind !== 'trigger' && (
                <ParametersPanel
                  node={{
                    id: selectedNode.id,
                    title: (selectedNode.data as unknown as TreeNodeData).label,
                    icon: (selectedNode.data as unknown as TreeNodeData).icon,
                    parameters: [],
                  }}
                  isOpen={!!selectedNode}
                  onClose={() => {
                    setShowParamsPanel(false);
                    setShowOutputsPanel(false);
                  }}
                  onParameterChange={() => {}}
                  onSaveSuccess={async (nodeId) => {
                    if (!currentWorkspace?.id || !id) return;
                    try {
                      const response = await getNodeFormSchema(currentWorkspace.id, id, nodeId);
                      if (response.status === 'success' && response.data?.form_schema) {
                        const formSchema = response.data.form_schema as Record<string, { value?: any }>;
                        const params = Object.fromEntries(
                          Object.entries(formSchema).map(([k, v]) => [k, v?.value])
                        );
                        setNodeParams((prev) => ({ ...prev, [nodeId]: params }));
                      }
                    } catch {
                      // Kart güncellemesi başarısız olsa da panel kaydı yapıldı
                    }
                  }}
                  workspaceId={currentWorkspace?.id}
                  workflowId={id}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="test" className="mt-0">
            <div className="relative h-[calc(100vh-112px)] min-h-[400px] overflow-auto bg-background">
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,hsl(var(--border)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="relative container mx-auto px-6 py-8 space-y-6">
                {!executionId && !isRunningTest ? (
                  <div className="flex min-h-[400px] items-center justify-center py-24">
                    <div className="flex max-w-md flex-col items-center text-center">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 rounded-2xl bg-primary/15 blur-2xl" />
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-surface/80 backdrop-blur-sm shadow-xl">
                          <Play className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      <h3 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                        No Test Execution Yet
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                        Click &quot;Run Test&quot; in the toolbar to run this workflow and see results and logs here.
                      </p>
                    </div>
                  </div>
                ) : isRunningTest || isLoadingExecution ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="flex max-w-md flex-col items-center text-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl animate-pulse" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-surface/80 backdrop-blur-sm">
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-foreground">Running Test</h3>
                      <p className="text-sm text-muted-foreground">
                        {isRunningTest ? 'Starting execution...' : 'Workflow is running...'}
                      </p>
                      {executionId && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border/50 bg-surface/80 px-4 py-2 text-xs font-mono text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          <span>{executionId.slice(0, 12)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : executionData ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          Test Summary
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Overview of the latest execution run for this workflow.
                        </p>
                      </div>

                      {executionData.status === 'RUNNING' ||
                      executionData.status === 'running' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowStopConfirmDialog(true)}
                          disabled={isStoppingExecution}
                          className="inline-flex items-center gap-2"
                        >
                          {isStoppingExecution ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                          )}
                          <span>Stop Execution</span>
                        </Button>
                      ) : null}
                    </div>

                    <TestSummaryCard
                      totalNodes={executionTimelineNodes.length}
                      successfulNodes={
                        executionTimelineNodes.filter(
                          (n) =>
                            n.status === 'SUCCESS' ||
                            n.status === 'success'
                        ).length
                      }
                      failedNodes={
                        executionTimelineNodes.filter(
                          (n) =>
                            n.status === 'FAILED' ||
                            n.status === 'failed'
                        ).length
                      }
                      totalDuration={totalDuration}
                      averageNodeTime={
                        executionTimelineNodes.length > 0
                          ? executionTimelineNodes.reduce(
                              (total, node) =>
                                total + (node.metadata?.duration_seconds || 0),
                              0
                            ) / executionTimelineNodes.length
                          : 0
                      }
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="flex min-h-[400px] flex-col">
                        <ExecutionTimeline
                          nodes={executionTimelineNodes}
                          totalDuration={totalDuration}
                        />
                      </div>

                      <div className="flex min-h-[400px] flex-col overflow-hidden rounded-xl border-2 border-border/50 bg-surface/80 shadow-lg shadow-primary/5">
                        <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-surface/50 to-transparent px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10">
                              <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-foreground">
                                Execution Logs
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Detailed execution logs and debug information
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden bg-gradient-to-b from-background/50 to-background p-6">
                          <div className="h-full overflow-auto rounded-lg border border-border/50 bg-background/80 p-4 font-mono text-xs shadow-inner">
                            {executionData ? (
                              <div className="space-y-1">
                                <p className="text-success">
                                  [INFO] Workflow test started
                                </p>
                                <p className="text-muted-foreground">
                                  [INFO] Execution ID: {executionData.id}
                                </p>
                                <p className="text-muted-foreground">
                                  [INFO] Status: {executionData.status}
                                </p>
                                {executionData.started_at && (
                                  <p className="text-muted-foreground">
                                    [INFO] Started at:{' '}
                                    {new Date(
                                      executionData.started_at
                                    ).toLocaleString()}
                                  </p>
                                )}
                                {executionData.ended_at && (
                                  <p className="text-muted-foreground">
                                    [INFO] Ended at:{' '}
                                    {new Date(
                                      executionData.ended_at
                                    ).toLocaleString()}
                                  </p>
                                )}
                                {typeof executionData.duration === 'number' && (
                                  <p className="text-muted-foreground">
                                    [INFO] Duration:{' '}
                                    {executionData.duration.toFixed(3)}s
                                  </p>
                                )}
                                <p className="text-success">
                                  [INFO] Executing workflow...
                                </p>
                                {executionTimelineNodes.map((node) => {
                                  const status =
                                    (node.status as string) || 'PENDING';
                                  const statusClass =
                                    status === 'SUCCESS' ||
                                    status === 'success'
                                      ? 'text-success'
                                      : status === 'FAILED' ||
                                          status === 'failed'
                                        ? 'text-destructive'
                                        : 'text-muted-foreground';
                                  return (
                                    <p
                                      key={node.nodeId}
                                      className={statusClass}
                                    >
                                      [{status}] {node.nodeName} -{' '}
                                      {node.metadata?.duration_seconds
                                        ? `completed in ${node.metadata.duration_seconds.toFixed(3)}s`
                                        : 'pending'}
                                      {node.errorMessage && (
                                        <span className="ml-4 block text-destructive">
                                          ↳ Error: {node.errorMessage}
                                        </span>
                                      )}
                                    </p>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="space-y-1 text-muted-foreground">
                                <p>[INFO] No execution data available</p>
                                <p>
                                  [INFO] Click &quot;Run Test&quot; button to
                                  start a test execution
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <AlertDialog open={showStopConfirmDialog} onOpenChange={setShowStopConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Stop test execution?</AlertDialogTitle>
              <AlertDialogDescription>
                The current test run will be cancelled. You can start a new test at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isStoppingExecution}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleStopExecution}
                disabled={isStoppingExecution}
              >
                {isStoppingExecution ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Stop Execution
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PathProvider>
  );
}

