import { ALL_CATEGORIES } from "@/lib/constants";
import { getPastelAlphaColor } from "@/lib/utils";
import React from "react";
import { Circle, Text, XStack, YStack } from "tamagui";

type TransactionRowProps = {
    title: string;
    category: string;
    amount: string;
    Icon: any;
    iconCol: string;
    time: string;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
    title,
    category,
    amount,
    Icon,
    iconCol,
    time,
}) => {
    const categoryInfo = ALL_CATEGORIES.find((cat) => cat.id === category);

    return (
        <XStack
            jc="space-between"
            ai="center"
            p="$3"
            br="$4"
            bg={"$secondaryForeground"}
            pressStyle={{ scale: 0.98 }}
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
    )
};

export default TransactionRow;