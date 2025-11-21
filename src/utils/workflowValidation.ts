interface ValidationError {
  nodeId: string;
  nodeName: string;
  type: 'error' | 'warning';
  message: string;
  field?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const validateWorkflow = (nodes: any[]): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if workflow has at least one node
  if (nodes.length === 0) {
    errors.push({
      nodeId: 'workflow',
      nodeName: 'Workflow',
      type: 'error',
      message: 'Workflow must have at least one node',
    });
    return { isValid: false, errors, warnings };
  }

  // Check if first node is a trigger
  const firstNode = nodes[0];
  if (!firstNode.type || firstNode.type !== 'trigger') {
    errors.push({
      nodeId: firstNode.id,
      nodeName: firstNode.title || 'First Node',
      type: 'error',
      message: 'Workflow must start with a trigger node',
    });
  }

  // Validate each node
  nodes.forEach((node, index) => {
    // Check if node has required parameters configured
    if (node.parameters && node.parameters.length > 0) {
      const requiredParams = node.parameters.filter((p: any) => p.required);
      const unconfiguredParams = requiredParams.filter((p: any) => {
        if (p.mode === 'dynamic') {
          return !p.dynamicPath || p.dynamicPath.trim() === '';
        }
        return !p.value || p.value.toString().trim() === '';
      });

      unconfiguredParams.forEach((param: any) => {
        errors.push({
          nodeId: node.id,
          nodeName: node.title,
          type: 'error',
          message: `Required parameter "${param.label}" is not configured`,
          field: param.id,
        });
      });
    }

    // Validate dynamic paths reference valid previous nodes
    if (node.parameters) {
      const dynamicParams = node.parameters.filter((p: any) => p.mode === 'dynamic' && p.dynamicPath);
      
      dynamicParams.forEach((param: any) => {
        const path = param.dynamicPath;
        const referencedNodeId = path.split('.')[0];
        
        // Check if referenced node exists and comes before current node
        const referencedNodeIndex = nodes.findIndex((n: any) => n.id === referencedNodeId);
        
        if (referencedNodeIndex === -1) {
          errors.push({
            nodeId: node.id,
            nodeName: node.title,
            type: 'error',
            message: `Parameter "${param.label}" references non-existent node: ${referencedNodeId}`,
            field: param.id,
          });
        } else if (referencedNodeIndex >= index) {
          errors.push({
            nodeId: node.id,
            nodeName: node.title,
            type: 'error',
            message: `Parameter "${param.label}" references a node that comes after this node`,
            field: param.id,
          });
        }
      });
    }

    // Validate conditional nodes
    if (node.type === 'conditional') {
      const conditionParam = node.parameters?.find((p: any) => p.id === 'condition');
      if (!conditionParam || !conditionParam.value) {
        errors.push({
          nodeId: node.id,
          nodeName: node.title,
          type: 'error',
          message: 'Conditional node must have a condition configured',
          field: 'condition',
        });
      }

      // Check if branches exist
      if (!node.branches || node.branches.length === 0) {
        warnings.push({
          nodeId: node.id,
          nodeName: node.title,
          type: 'warning',
          message: 'Conditional node has no branches',
        });
      }
    }

    // Validate loop nodes
    if (node.type === 'loop') {
      const iterationParam = node.parameters?.find((p: any) => p.id === 'iteration_array');
      if (!iterationParam || (!iterationParam.value && !iterationParam.dynamicPath)) {
        errors.push({
          nodeId: node.id,
          nodeName: node.title,
          type: 'error',
          message: 'Loop node must have an iteration array configured',
          field: 'iteration_array',
        });
      }
    }

    // Warn about unconfigured optional parameters
    if (node.parameters) {
      const optionalParams = node.parameters.filter((p: any) => !p.required);
      const emptyOptionalParams = optionalParams.filter((p: any) => {
        if (p.mode === 'dynamic') {
          return !p.dynamicPath || p.dynamicPath.trim() === '';
        }
        return !p.value || p.value.toString().trim() === '';
      });

      if (emptyOptionalParams.length > 0 && emptyOptionalParams.length < 3) {
        emptyOptionalParams.forEach((param: any) => {
          warnings.push({
            nodeId: node.id,
            nodeName: node.title,
            type: 'warning',
            message: `Optional parameter "${param.label}" is not configured`,
            field: param.id,
          });
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const getValidationSummary = (result: ValidationResult): string => {
  if (result.isValid && result.warnings.length === 0) {
    return 'Workflow validation passed with no issues';
  }
  
  const parts: string[] = [];
  
  if (result.errors.length > 0) {
    parts.push(`${result.errors.length} error${result.errors.length > 1 ? 's' : ''}`);
  }
  
  if (result.warnings.length > 0) {
    parts.push(`${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''}`);
  }
  
  return `Validation found ${parts.join(' and ')}`;
};
