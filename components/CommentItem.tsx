import { Comment } from '@/types';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Card, Dialog, Icon, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import HTMLContent from './HTMLContent';

interface Props {
    comment: Comment;
    onReply?: (comment: Comment) => void;
    customFooter?: React.ReactNode;
}

const CommentItem = ({ comment, onReply, customFooter }: Props) => {
    const theme = useTheme();
    const router = useRouter();
    const [visible, setVisible] = React.useState(false);

    const getAuthorColor = () => {
        if (!comment.authorClasses) return theme.colors.onSurface;
        const cls = comment.authorClasses.toLowerCase();

        if (cls.includes('sodi') || cls.includes('recskaboy')) return '#FF7A00';
        if (cls.includes('freshman')) return '#5dade2';
        if (cls.includes('verified')) return '#3838ff';

        return theme.colors.onSurface;
    };

    const showAuthorDetails = () => setVisible(true);
    const hideAuthorDetails = () => setVisible(false);

    const handleSearchUser = () => {
        hideAuthorDetails();
        router.push({
            pathname: '/search',
            params: { user: comment.author }
        });
    };

    const LeftContent = (props: any) => {
        const size = props.size || 40;
        if (comment.avatarUrl) {
            return <Avatar.Image {...props} source={{ uri: comment.avatarUrl }} size={size} />;
        }
        return <Avatar.Text {...props} label={comment.author.substring(0, 2).toUpperCase()} size={size} />;
    };

    return (
        <>
            <Portal>
                <Dialog visible={visible} onDismiss={hideAuthorDetails} style={styles.dialog}>
                    <Dialog.Title>Felhasználó adatai</Dialog.Title>
                    <Dialog.Content>
                        <View style={styles.modalContent}>
                            <LeftContent size={100} style={styles.modalAvatar} />
                            <Text variant="headlineSmall" style={{ color: getAuthorColor(), fontWeight: 'bold', marginBottom: 12 }}>
                                {comment.author}
                            </Text>
                            <View style={styles.detailsList}>
                                <Text variant="bodyLarge" style={styles.detailItem}>Rang: {comment.authorRank || 'Nincs'}</Text>
                                <Text variant="bodyLarge" style={styles.detailItem}>Pontok: {comment.authorPoints || '0'}</Text>
                            </View>
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={handleSearchUser} mode="text" icon="magnify" style={{ marginRight: 'auto' }}>
                            Posztjai
                        </Button>
                        <Button onPress={hideAuthorDetails} mode="contained-tonal">Bezárás</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Card style={[styles.card, comment.isHighlighted && { borderColor: theme.colors.primary, borderWidth: 1 }]} mode={comment.isHighlighted ? 'outlined' : 'elevated'}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={showAuthorDetails} style={styles.avatarWrapper}>
                        <LeftContent />
                    </TouchableOpacity>

                    <View style={styles.authorInfoWrapper}>
                        <TouchableOpacity onPress={showAuthorDetails} style={styles.nameTouchArea}>
                            <Text variant="titleMedium" style={[styles.authorName, { color: getAuthorColor() }]}>
                                {comment.author}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.metaWrapper}>
                            <Text variant="bodySmall" style={styles.dateText}>
                                {comment.date}
                            </Text>
                            {comment.authorRank ? (
                                <Text variant="bodySmall" style={styles.rankText}>
                                    • {comment.authorRank}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <View style={styles.headerRight}>
                        <View style={[styles.voteBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
                            <Icon source="thumb-up" size={16} color={theme.colors.onSecondaryContainer} />
                            <Text variant="labelMedium" style={[styles.voteText, { color: theme.colors.onSecondaryContainer }]}>
                                {comment.upvotes}
                            </Text>
                        </View>
                    </View>
                </View>

                <Card.Content style={styles.cardContent}>
                    <HTMLContent html={comment.contentHtml} />
                </Card.Content>

                {customFooter ? (
                    customFooter
                ) : (
                    <Card.Actions style={styles.cardActions}>
                        <IconButton
                            icon="thumb-up-outline"
                            size={20}
                            onPress={() => console.log('Upvote')}
                        />
                        <IconButton
                            icon="thumb-down-outline"
                            size={20}
                            onPress={() => console.log('Downvote')}
                        />
                        <IconButton
                            icon="reply"
                            size={20}
                            onPress={() => onReply && onReply(comment)}
                        />
                    </Card.Actions>
                )}
            </Card>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 6,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    avatarWrapper: {
        marginRight: 10,
    },
    authorInfoWrapper: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    nameTouchArea: {
        paddingVertical: 2,
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    metaWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 1,
    },
    dateText: {
        opacity: 0.6,
        fontSize: 11,
    },
    rankText: {
        opacity: 0.5,
        marginLeft: 6,
        fontSize: 11,
    },
    headerRight: {
        marginLeft: 8,
    },
    voteBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    voteText: {
        marginLeft: 4,
        fontWeight: 'bold',
    },
    cardContent: {
        paddingTop: 0,
        paddingBottom: 4,
    },
    cardActions: {
        justifyContent: 'flex-start',
        paddingHorizontal: 4,
    },
    chip: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        height: 28,
    },
    chipText: {
        fontSize: 12,
    },
    dialog: {
        borderRadius: 12,
    },
    modalContent: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    modalAvatar: {
        marginBottom: 16,
    },
    detailsList: {
        width: '100%',
        alignItems: 'center',
    },
    detailItem: {
        marginBottom: 4,
    }
});

export default memo(CommentItem);
