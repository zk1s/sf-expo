import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, IconButton, Surface, useTheme } from 'react-native-paper';

interface Props {
    onScrollTop: () => void;
    onScrollBottom: () => void;
    onPost: () => void;
}

const FeedActions = ({ onScrollTop, onScrollBottom, onPost }: Props) => {
    const theme = useTheme();

    const withHaptics = (callback: () => void) => () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        callback();
    };

    return (
        <View style={styles.container}>
            <Surface style={[styles.scrollGroup, { backgroundColor: theme.colors.elevation.level3 }]} elevation={2}>
                <IconButton
                    icon="chevron-up"
                    onPress={withHaptics(onScrollTop)}
                    size={24}
                    style={styles.iconButton}
                />
                <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
                <IconButton
                    icon="chevron-down"
                    onPress={withHaptics(onScrollBottom)}
                    size={24}
                    style={styles.iconButton}
                />
            </Surface>

            <FAB
                icon="plus"
                style={styles.fabPost}
                onPress={withHaptics(onPost)}
                mode="elevated"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 16,
        bottom: 80, // Adjust based on pagination height
        alignItems: 'center',
    },
    scrollGroup: {
        borderRadius: 25,
        marginBottom: 12,
        alignItems: 'center',
        overflow: 'hidden',
    },
    iconButton: {
        margin: 0,
    },
    divider: {
        height: 1,
        width: '60%',
    },
    fabPost: {
        borderRadius: 16,
    },
});

export default FeedActions;
