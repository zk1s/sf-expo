import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';

interface Props {
    onScrollTop: () => void;
    onScrollBottom: () => void;
    onPost: () => void;
}

const FeedActions = ({ onScrollTop, onScrollBottom, onPost }: Props) => {
    const withHaptics = (callback: () => void) => () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        callback();
    };

    return (
        <>
            <FAB
                icon="arrow-up"
                style={styles.fabUp}
                onPress={withHaptics(onScrollTop)}
                small
            />
            <FAB
                icon="arrow-down"
                style={styles.fabDown}
                onPress={withHaptics(onScrollBottom)}
                small
            />
            <FAB
                icon="plus"
                style={styles.fabPost}
                onPress={withHaptics(onPost)}
                label="Új komment"
            />
        </>
    );
};

const styles = StyleSheet.create({
    fabPost: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 60,
    },
    fabDown: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 140,
    },
    fabUp: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 220,
    },
});

export default FeedActions;
