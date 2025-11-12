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
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">
          <div>
            <div className="font-medium">{ROLE_LABELS.admin}</div>
            <div className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS.admin}</div>
          </div>
        </SelectItem>
        <SelectItem value="editor">
          <div>
            <div className="font-medium">{ROLE_LABELS.editor}</div>
            <div className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS.editor}</div>
          </div>
        </SelectItem>
        <SelectItem value="viewer">
          <div>
            <div className="font-medium">{ROLE_LABELS.viewer}</div>
            <div className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS.viewer}</div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
