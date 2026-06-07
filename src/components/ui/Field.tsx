import {
  ChangeEvent,
  Children,
  InputHTMLAttributes,
  isValidElement,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextareaPrimitive } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Field({ label, className, id, ...props }: FieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <Label htmlFor={fieldId}>
      {label}
      <Input id={fieldId} className={cn("normal-case", className)} {...props} />
    </Label>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <Label htmlFor={fieldId}>
      {label}
      <TextareaPrimitive id={fieldId} className={cn("normal-case", className)} {...props} />
    </Label>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

const emptySelectValue = "__empty__";

function getOptionText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getOptionText).join("");
  }

  return "";
}

export function Select({ label, className, children, value, defaultValue, onChange, disabled, required }: SelectProps) {
  const selectedValue = value === "" ? emptySelectValue : value?.toString();
  const selectedDefaultValue = defaultValue === "" ? emptySelectValue : defaultValue?.toString();
  const placeholder = required ? "Select an option" : "All";
  const options = ChildrenToSelectItems(children);

  return (
    <Label>
      {label}
      <SelectRoot
        value={selectedValue}
        defaultValue={selectedDefaultValue}
        disabled={disabled}
        onValueChange={(nextValue) => {
          const mappedValue = nextValue === emptySelectValue ? "" : nextValue;
          onChange?.({ target: { value: mappedValue } } as ChangeEvent<HTMLSelectElement>);
        }}
      >
        <SelectTrigger className={cn("normal-case", className)} aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{options}</SelectContent>
      </SelectRoot>
    </Label>
  );
}

function ChildrenToSelectItems(children: ReactNode) {
  return Children.map(children, (child) => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>(child)) {
      return child;
    }

    const rawValue = child.props.value?.toString() ?? getOptionText(child.props.children);
    const itemValue = rawValue === "" ? emptySelectValue : rawValue;

    return (
      <SelectItem key={itemValue} value={itemValue} disabled={child.props.disabled}>
        {child.props.children}
      </SelectItem>
    );
  });
}
