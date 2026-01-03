import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text, TextInput, useTheme } from 'react-native-paper';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
}

const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }: Props) => {
    const theme = useTheme();
    const [visible, setVisible] = React.useState(false);
    const [pageInput, setPageInput] = React.useState(currentPage.toString());

    const showDialog = () => {
        setPageInput(currentPage.toString());
        setVisible(true);
    };
    const hideDialog = () => setVisible(false);

    const handleJump = () => {
        const page = parseInt(pageInput, 10);
        if (!isNaN(page) && page >= 1 && (totalPages === 0 || page <= totalPages)) {
            onPageChange(page);
            hideDialog();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.elevation.level2 }]}>
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Ugrás oldalra</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Oldalszám"
                            value={pageInput}
                            onChangeText={setPageInput}
                            keyboardType="numeric"
                            autoFocus
                        />
                        {totalPages > 0 && (
                            <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.6 }}>
                                Elérhető oldalak: 1 - {totalPages}
                            </Text>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Mégse</Button>
                        <Button onPress={handleJump}>Ugrás</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

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
                onPress={showDialog}
                disabled={isLoading}
                compact
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
