import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/services/membersApi';

interface RoleSelectorProps {
  roles: UserRole[];
  value: string;
  onChange: (roleId: string) => void;
  disabled?: boolean;
  error?: string;
}

export const RoleSelector = ({ roles, value, onChange, disabled, error }: RoleSelectorProps) => {
  const selectedRole = roles.find(r => r.id === value);

  return (
    <div>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={`h-10 w-full text-sm border-border/50 ${error ? 'border-red-500' : ''}`}>
          <SelectValue placeholder="Select a role">
            {selectedRole ? selectedRole.name : 'Select a role'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id} className="text-sm">
              <div className="flex flex-col">
                <span className="font-medium">{role.name}</span>
                {role.description && (
                  <span className="text-xs text-muted-foreground">{role.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
