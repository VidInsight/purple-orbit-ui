import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/types/user';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export const RoleSelector = ({ value, onChange, disabled }: RoleSelectorProps) => {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as UserRole)} disabled={disabled}>
      <SelectTrigger className="h-7 w-24 text-xs border-border/50">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin" className="text-xs">
          {ROLE_LABELS.admin}
        </SelectItem>
        <SelectItem value="editor" className="text-xs">
          {ROLE_LABELS.editor}
        </SelectItem>
        <SelectItem value="viewer" className="text-xs">
          {ROLE_LABELS.viewer}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
