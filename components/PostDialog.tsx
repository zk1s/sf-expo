import { postComment } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';

interface Props {
    visible: boolean;
    onDismiss: () => void;
    onPostSuccess: () => void;
    initialContent?: string;
}

const PostDialog = ({ visible, onDismiss, onPostSuccess, initialContent = '' }: Props) => {
    const [comment, setComment] = useState('');
    const [nickname, setNickname] = useState('');
    const [posting, setPosting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (visible) {
            setComment(initialContent);
            if (user?.username) setNickname(user.username);
        }
    }, [visible, initialContent, user]);

    const handlePost = async () => {
        if (!user || !comment.trim() || !nickname.trim()) return;

        setPosting(true);
        try {
            const success = await postComment(nickname, comment);
            if (success) {
                setComment('');
                onPostSuccess();
                onDismiss();
            } else {
                alert('Failed to post comment. Please try again.');
            }
        } catch (e) {
            console.error(e);
            alert('Error posting comment.');
        } finally {
            setPosting(false);
        }
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
                <Dialog.Title>Komment írása</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        mode="outlined"
                        label="Neved"
                        value={nickname}
                        onChangeText={setNickname}
                        style={{ marginBottom: 12, backgroundColor: 'transparent' }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Komment"
                        placeholder="Írd ide a kommented..."
                        multiline
                        numberOfLines={6}
                        value={comment}
                        onChangeText={setComment}
                        style={styles.input}
                        contentStyle={{ paddingTop: 10, paddingBottom: 10 }}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>Mégse</Button>
                    <Button onPress={handlePost} loading={posting} disabled={posting || !comment.trim()}>Küldés</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    dialog: {
    },
    input: {
        minHeight: 150,
        backgroundColor: 'transparent'
    },
});

export default PostDialog;
