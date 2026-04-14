import { Text, ToggleGroup, XGroup, YStack } from 'tamagui'

export const StartOfWeekPicker = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    return (
        <YStack gap="$3" f={1}>
            <Text ff="$body" fos={"$2"} fow="800" col="$primary" ls={1.5} tt="uppercase">
                Start of Week
            </Text>
            <ToggleGroup
                type="single"
                value={value}
                onValueChange={onChange}
                disableDeactivation
                orientation="horizontal"
                p="$1"
                br="$4"
            >
                <XGroup>
                    <XGroup.Item>
                        <ToggleGroup.Item value={'sunday'} f={1} br="$3" bg={value === 'sunday' ? '$buttonBg' : '$secondaryForeground'}>
                            <Text ff="$body" fow="700" fos="$2" col={value === 'sunday' ? 'white' : '$colorMuted'}>
                                Sunday
                            </Text>
                        </ToggleGroup.Item>
                    </XGroup.Item>
                    <XGroup.Item>
                        <ToggleGroup.Item value={'monday'} f={1} br="$3" bg={value === 'monday' ? '$buttonBg' : '$secondaryForeground'}>
                            <Text ff="$body" fow="700" fos="$2" col={value === 'monday' ? 'white' : '$colorMuted'}>
                                Monday
                            </Text>
                        </ToggleGroup.Item>
                    </XGroup.Item>
                </XGroup>



            </ToggleGroup>
        </YStack>
    )
}