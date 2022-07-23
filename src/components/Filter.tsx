import { Text, Button, IButtonProps, useTheme } from "native-base";

type FilterProps = IButtonProps & {
  title: string;
  isActive?: boolean;
  type: "open" | "closed";
};

export function Filter({ title, isActive = false, type, ...rest }: FilterProps) {
  const { colors } = useTheme();

  const typeColor = type === "open" ? colors.secondary[700] : colors.green[300];

  return (
    <Button
      variant="outline"
      borderWidth={isActive ? 1 : 0}
      borderColor={typeColor}
      bgColor="gray.600"
      flex={1}
      size="sm"
      {...rest}
    >
      <Text
        color={isActive ? typeColor : colors.gray[300]}
        fontSize="xs"
        textTransform="uppercase"
      >
        {title}
      </Text>
    </Button>
  );
}
