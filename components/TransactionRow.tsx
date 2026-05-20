import { ALL_CATEGORIES } from "@/lib/constants";
import { getPastelAlphaColor } from "@/lib/utils";
import { Trash2 } from "@tamagui/lucide-icons-2";
import React, { useRef } from "react";
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
    SharedValue
} from 'react-native-reanimated';
import { Circle, Text, useTheme, XStack, YStack } from "tamagui";

type TransactionRowProps = {
    title: string;
    category: string;
    amount: string;
    Icon: any;
    time: string;
    onDelete: () => void;
    loading: boolean;
    onPress?: () => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
    title,
    category,
    amount,
    Icon,
    time,
    loading,
    onDelete,
    onPress,
}) => {
    const categoryInfo = ALL_CATEGORIES.find((cat) => cat.id === category);
    const swipeableRef = useRef<SwipeableMethods | null>(null);
    const theme = useTheme();

    const renderRightActions = (
        progress: SharedValue<number>,
        dragX: SharedValue<number>
    ) => {
        return (
            <XStack
                bg={getPastelAlphaColor(theme.error.get())}
                jc="flex-end"
                ai="center"
                h="100%"
                br="$4"
                px="$4"
                onPress={() => {
                    swipeableRef.current?.close();
                    onDelete();
                }}
                pressStyle={{
                    opacity: 0.5
                }}
            >
                <XStack ai="center" gap="$2" jc="center" width={'$5'}>
                    <Trash2 size={26} color={theme.error.get()} />
                </XStack>
            </XStack>
        );
    }

    return (
        <ReanimatedSwipeable
            ref={swipeableRef}
            friction={2}
            rightThreshold={20}
            renderRightActions={renderRightActions}
            containerStyle={{ overflow: 'hidden' }}

        >
            <XStack
                jc="space-between"
                ai="center"
                p="$3"
                br="$4"
                bg={"$secondaryForeground"}
                pressStyle={{ scale: 0.98 }}
                width={"100%"}
                disabled={loading}
                opacity={loading ? 0.5 : 100}
                onPress={onPress}
            >
                <XStack ai="center" gap="$4">
                    <Circle size={52} bc={getPastelAlphaColor(categoryInfo?.chartColor!)} bw={1} boc="$border">
                        <Icon size={20} color={categoryInfo?.chartColor!} />
                    </Circle>
                    <YStack>
                        <Text
                            ff="$body"
                            fow="700"
                            fos="$4"
                            col="$color"
                            textTransform="capitalize"
                        >
                            {title}
                        </Text>
                        <XStack ai="center" gap="$2">
                            <Text ff="$body" col="$colorMuted" fos="$1" fow="600" >
                                • {categoryInfo?.label} • {time}
                            </Text>
                        </XStack>
                    </YStack>
                </XStack>
                <Text ff="$heading" fow="800" fos="$4" col="$color">
                    {amount}
                </Text>
            </XStack>
        </ReanimatedSwipeable>
    )
};

export default TransactionRow;