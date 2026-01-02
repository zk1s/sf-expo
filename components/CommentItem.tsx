import { Comment } from '@/types';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, IconButton, useTheme } from 'react-native-paper';
import HTMLContent from './HTMLContent';

interface Props {
    comment: Comment;
    onReply?: (comment: Comment) => void;
}

const CommentItem = ({ comment, onReply }: Props) => {
    const theme = useTheme();

    const LeftContent = (props: any) => {
        if (comment.avatarUrl) {
            return <Avatar.Image {...props} source={{ uri: comment.avatarUrl }} size={40} />;
        }
        return <Avatar.Text {...props} label={comment.author.substring(0, 2).toUpperCase()} size={40} />;
    };

    return (
        <Card style={[styles.card, comment.isHighlighted && { borderColor: theme.colors.primary, borderWidth: 1 }]} mode={comment.isHighlighted ? 'outlined' : 'elevated'}>
            <Card.Title
                title={comment.author}
                subtitle={comment.date}
                left={LeftContent}
                right={(props) => (
                    <View style={styles.rightHeader}>
                        <Chip icon="thumb-up" compact style={styles.chip}>{comment.upvotes}</Chip>
                    </View>
                )}
            />
            <Card.Content>
                <HTMLContent html={comment.contentHtml} />
            </Card.Content>
            <Card.Actions>
                <IconButton
                    icon="thumb-up-outline"
                    onPress={() => console.log('Upvote')}
                />
                <IconButton
                    icon="thumb-down-outline"
                    onPress={() => console.log('Downvote')}
                />
                <IconButton
                    icon="reply"
                    onPress={() => onReply && onReply(comment)}
                />
            </Card.Actions>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 4,
        marginHorizontal: 8,
    },
    rightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16
    },
    chip: {
        backgroundColor: 'transparent'
    }
});

export default memo(CommentItem);
