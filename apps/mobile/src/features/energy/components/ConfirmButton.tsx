import { PrototypeButton } from '../../../shared/components';

interface ConfirmButtonProps {
  onPress: () => void;
}

export function ConfirmButton({ onPress }: ConfirmButtonProps) {
  return (
    <PrototypeButton onPress={onPress}>确认今日能量</PrototypeButton>
  );
}
