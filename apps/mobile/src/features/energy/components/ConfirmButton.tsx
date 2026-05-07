import { PrototypeButton } from '../../../shared/components';

interface ConfirmButtonProps {
  onPress: () => void;
}

export function ConfirmButton({ onPress }: ConfirmButtonProps) {
  return (
    <PrototypeButton onPress={onPress} style={{ marginTop: 12 }}>确认今日能量</PrototypeButton>
  );
}
