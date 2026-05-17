import { ALL_CATEGORIES } from '@/lib/constants';
import { getPastelAlphaColor } from '@/lib/utils';
import React from 'react';
import { Button, ScrollView, Text, XStack } from 'tamagui';


interface CategoryFilterTabsProps {
    selectedCategoryId: string;
    onCategoryChange: (id: string) => void;
}



const CategoryFilterTabs: React.FC<CategoryFilterTabsProps> = ({
    selectedCategoryId,
    onCategoryChange,
}) => {
    return (

        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            maxHeight={50}
        >
            <XStack gap="$2" paddingVertical="$2">
                {ALL_CATEGORIES.map((category) => {
                    const isSelected = category.id === selectedCategoryId;
                    const { icon: Icon } = category;
                    return (
                        <Button
                            key={category.id}
                            unstyled
                            onPress={() => onCategoryChange(category.id)}

                            flexDirection="row"
                            alignItems="center"
                            gap="$1.5"
                            paddingHorizontal="$3"
                            paddingVertical="$2"
                            borderRadius={20}
                            borderWidth={1}

                            backgroundColor={isSelected ? '#546354' : getPastelAlphaColor(category.chartColor)}
                            borderColor={isSelected ? '#546354' : '$borderColor'}


                            pressStyle={{ scale: 0.96, opacity: 0.85 }}
                        >

                            <Icon
                                size={16}
                                color={isSelected ? '#ffffff' : '#7a7b77'}
                            />


                            <Text
                                ff="$body"
                                fos="$2"
                                fow={isSelected ? '700' : '500'}
                                color={isSelected ? '#ffffff' : '$color'}
                            >
                                {category.label}
                            </Text>
                        </Button>
                    );
                })}
            </XStack>
        </ScrollView>
    );
};

export default CategoryFilterTabs;