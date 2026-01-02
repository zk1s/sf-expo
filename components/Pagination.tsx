import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, useTheme } from 'react-native-paper';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
}

const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }: Props) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.elevation.level2 }]}>
            <IconButton
                icon="page-first"
                disabled={currentPage <= 1 || isLoading}
                onPress={() => onPageChange(1)}
            />
            <IconButton
                icon="chevron-left"
                disabled={currentPage <= 1 || isLoading}
                onPress={() => onPageChange(currentPage - 1)}
            />

            <Button
                mode="text"
                onPress={() => onPageChange(currentPage)}
                disabled={isLoading}
            >
                {currentPage} / {totalPages || '?'}
            </Button>

            <IconButton
                icon="chevron-right"
                disabled={currentPage >= totalPages || isLoading}
                onPress={() => onPageChange(currentPage + 1)}
            />
            <IconButton
                icon="page-last"
                disabled={currentPage >= totalPages || isLoading}
                onPress={() => onPageChange(totalPages)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 4,
        elevation: 4,
    }
});

export default memo(Pagination);
