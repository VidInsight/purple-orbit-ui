/**
 * Trigger Input Form Component
 * Trigger'ın input_mapping'ine göre dinamik form oluşturur
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import type { Trigger } from '@/types/api';

interface TriggerInputFormProps {
  trigger: Trigger | null;
  onSubmit: (inputData: Record<string, any>) => void;
  onCancel: () => void;
  initialData?: Record<string, any>;
}

export const TriggerInputForm = ({ trigger, onSubmit, onCancel, initialData }: TriggerInputFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (trigger?.input_mapping) {
      const initial: Record<string, any> = {};
      Object.entries(trigger.input_mapping).forEach(([fieldName, fieldSchema]: [string, any]) => {
        // Default değer varsa kullan, yoksa initialData'dan al
        initial[fieldName] = initialData?.[fieldName] ?? fieldSchema.value ?? '';
      });
      setFormData(initial);
    }
  }, [trigger, initialData]);

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    if (!trigger?.input_mapping) return true;

    const newErrors: Record<string, string> = {};

    Object.entries(trigger.input_mapping).forEach(([fieldName, fieldSchema]: [string, any]) => {
      // Required field kontrolü
      if (fieldSchema.required && (formData[fieldName] === undefined || formData[fieldName] === '')) {
        newErrors[fieldName] = `${fieldName} is required`;
        return;
      }

      // Type validation
      if (formData[fieldName] !== undefined && formData[fieldName] !== '') {
        const value = formData[fieldName];
        const expectedType = fieldSchema.type?.toLowerCase();

        if (expectedType === 'integer' || expectedType === 'int') {
          if (isNaN(Number(value)) || !Number.isInteger(Number(value))) {
            newErrors[fieldName] = `${fieldName} must be an integer`;
          }
        } else if (expectedType === 'float' || expectedType === 'number') {
          if (isNaN(Number(value))) {
            newErrors[fieldName] = `${fieldName} must be a number`;
          }
        } else if (expectedType === 'boolean' || expectedType === 'bool') {
          if (value !== true && value !== false && value !== 'true' && value !== 'false') {
            newErrors[fieldName] = `${fieldName} must be a boolean`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Type conversion
    const convertedData: Record<string, any> = {};
    if (trigger?.input_mapping) {
      Object.entries(trigger.input_mapping).forEach(([fieldName, fieldSchema]: [string, any]) => {
        const value = formData[fieldName];
        if (value === undefined || value === '') {
          // Default değer varsa kullan
          if (fieldSchema.value !== undefined) {
            convertedData[fieldName] = fieldSchema.value;
          }
          return;
        }

        const expectedType = fieldSchema.type?.toLowerCase();
        if (expectedType === 'integer' || expectedType === 'int') {
          convertedData[fieldName] = parseInt(value, 10);
        } else if (expectedType === 'float' || expectedType === 'number') {
          convertedData[fieldName] = parseFloat(value);
        } else if (expectedType === 'boolean' || expectedType === 'bool') {
          convertedData[fieldName] = value === true || value === 'true';
        } else {
          convertedData[fieldName] = value;
        }
      });
    }

    onSubmit(convertedData);
  };

  const generateTestData = () => {
    if (!trigger?.input_mapping) return;

    const testData: Record<string, any> = {};
    Object.entries(trigger.input_mapping).forEach(([fieldName, fieldSchema]: [string, any]) => {
      if (fieldSchema.required) {
        const type = fieldSchema.type?.toLowerCase();
        if (type === 'integer' || type === 'int') {
          testData[fieldName] = Math.floor(Math.random() * 100);
        } else if (type === 'float' || type === 'number') {
          testData[fieldName] = Math.random() * 100;
        } else if (type === 'boolean' || type === 'bool') {
          testData[fieldName] = Math.random() > 0.5;
        } else {
          testData[fieldName] = `test_${fieldName}_${Math.random().toString(36).substr(2, 9)}`;
        }
      } else if (fieldSchema.value !== undefined) {
        testData[fieldName] = fieldSchema.value;
      }
    });

    setFormData(testData);
  };

  if (!trigger?.input_mapping || Object.keys(trigger.input_mapping).length === 0) {
    return (
      <div className="p-4 bg-surface border border-border rounded-lg">
        <p className="text-sm text-muted-foreground mb-4">
          This trigger has no input schema. You can start execution with empty data.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => onSubmit({})} variant="primary">
            Start Execution
          </Button>
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {Object.entries(trigger.input_mapping).map(([fieldName, fieldSchema]: [string, any]) => {
          const fieldType = fieldSchema.type?.toLowerCase();
          const isRequired = fieldSchema.required || false;
          const hasError = !!errors[fieldName];

          return (
            <div key={fieldName} className="space-y-2">
              <Label htmlFor={fieldName} className="text-sm font-medium">
                {fieldName}
                {isRequired && <span className="text-destructive ml-1">*</span>}
                {fieldSchema.description && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {fieldSchema.description}
                  </span>
                )}
              </Label>
              
              {fieldType === 'boolean' || fieldType === 'bool' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={fieldName}
                    checked={formData[fieldName] === true || formData[fieldName] === 'true'}
                    onChange={(e) => handleChange(fieldName, e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor={fieldName} className="text-sm">
                    {formData[fieldName] ? 'True' : 'False'}
                  </Label>
                </div>
              ) : (
                <Input
                  id={fieldName}
                  type={fieldType === 'integer' || fieldType === 'int' || fieldType === 'float' || fieldType === 'number' ? 'number' : 'text'}
                  value={formData[fieldName] ?? ''}
                  onChange={(e) => handleChange(fieldName, e.target.value)}
                  placeholder={fieldSchema.value !== undefined ? `Default: ${fieldSchema.value}` : `Enter ${fieldName}...`}
                  required={isRequired}
                  className={hasError ? 'border-destructive' : ''}
                />
              )}

              {hasError && (
                <p className="text-xs text-destructive">{errors[fieldName]}</p>
              )}

              {fieldSchema.value !== undefined && !isRequired && (
                <p className="text-xs text-muted-foreground">
                  Default value: {String(fieldSchema.value)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={generateTestData}
          className="text-sm"
        >
          Generate Test Data
        </Button>
        <div className="flex gap-2">
          <Button type="button" onClick={onCancel} variant="ghost">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Start Execution
          </Button>
        </div>
      </div>
    </form>
  );
};

