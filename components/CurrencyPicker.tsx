import { CURRENCIES } from '@/lib/constants'
import { Check, Search, X } from '@tamagui/lucide-icons-2'
import { useState } from 'react'
import {
    Button,
    Input,
    ListItem,
    ScrollView,
    Sheet,
    Text,
    XStack,
    YStack
} from 'tamagui'


export const CurrencyPicker = ({ open, onOpenChange, onSelect, selected }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (code: string) => void;
    selected: string;
}) => {
    const [search, setSearch] = useState('')

    const filtered = CURRENCIES.filter(
        c => c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Sheet
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[60, 90]}
            dismissOnSnapToBottom
            modal
        >
            <Sheet.Frame bg="$background" p="$4">
                <Sheet.Handle bg="$card" mb="$3" />

                <YStack gap="$4">
                    <XStack jc={'space-between'} ai={'center'}>
                        <Text ff="$heading" fos="$6" fow="800">Select Currency</Text>
                        <Button
                            icon={X}
                            circular
                            bg="$card"
                            onPress={() => onOpenChange(false)}
                            chromeless
                            pressStyle={{ scale: 0.95 }}
                        />
                    </XStack>


                    {/* Search Bar */}
                    <XStack bg="$card" br="$full" ai="center" px="$4" bw={1} boc="$borderColor">
                        <Search size={18} color="$colorMuted" />
                        <Input
                            f={1}
                            bw={0}
                            bg="transparent"
                            placeholder="Search currency..."
                            value={search}
                            onChangeText={setSearch}
                        />
                    </XStack>

                    <ScrollView h={400} showsVerticalScrollIndicator={false}>
                        <YStack gap="$1">
                            {filtered.map((item) => (
                                <ListItem
                                    key={item.code}
                                    title={item.name}
                                    subTitle={<XStack>
                                        <Text ff="$heading" fow="700" mr="$2">{item.code}</Text>
                                        <Text ff="$heading" fow="700" mr="$2">{item.symbol}</Text>
                                    </XStack>}
                                    iconAfter={selected === item.code ? <Check col="$primary" /> : null}
                                    onPress={() => {
                                        onSelect(item.code)
                                        onOpenChange(false)
                                    }}
                                    bg="transparent"
                                    pressStyle={{ bg: '$primaryLow' }}
                                    br="$4"
                                    scaleIcon={1.2}
                                />
                            ))}
                        </YStack>
                    </ScrollView>
                </YStack>
            </Sheet.Frame>
        </Sheet>
    )
}