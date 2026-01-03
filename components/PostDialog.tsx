import { postComment, uploadToCatbox } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, IconButton, Portal, Text, TextInput } from 'react-native-paper';

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
    const [uploading, setUploading] = useState(false);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const { user } = useAuth();

    useEffect(() => {
        if (visible) {
            setComment(initialContent);
            if (user?.username) setNickname(user.username);
        }
    }, [visible, initialContent, user]);

    const insertText = (before: string, after: string = '') => {
        const { start, end } = selection;
        const selectedText = comment.substring(start, end);
        const newText = comment.substring(0, start) + before + selectedText + after + comment.substring(end);
        setComment(newText);
    };

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access gallery is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setUploading(true);
            const uploadedUrl = await uploadToCatbox(result.assets[0].uri);
            setUploading(false);

            if (uploadedUrl) {
                insertText(`[img src=${uploadedUrl}]`);
            } else {
                alert('Képfeltöltés sikertelen :(');
            }
        }
    };

    const quickComments = [
        "Zsidók vagytok.",
        "Na meló, csá.",
        "Jövő héten",
        "Hahó!",
        "Az más.",
        "Soha többet nem írok ide",
        "* ásít *"
    ];

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
                        disabled={posting || uploading}
                    />

                    <View style={styles.helperRow}>
                        <IconButton icon="format-bold" size={20} onPress={() => insertText('[b]', '[/b]')} disabled={posting || uploading} />
                        <IconButton icon="format-italic" size={20} onPress={() => insertText('[i]', '[/i]')} disabled={posting || uploading} />
                        <IconButton icon="format-underline" size={20} onPress={() => insertText('[u]', '[/u]')} disabled={posting || uploading} />
                        <IconButton icon="format-strikethrough" size={20} onPress={() => insertText('[s]', '[/s]')} disabled={posting || uploading} />
                        <View style={styles.uploadBtnWrapper}>
                            <IconButton
                                icon="image"
                                size={20}
                                onPress={handleImagePick}
                                disabled={posting || uploading}
                            />
                            {uploading && <ActivityIndicator size={12} style={styles.uploadLoader} />}
                        </View>
                    </View>

                    <TextInput
                        mode="outlined"
                        label="Komment"
                        placeholder="Írd ide a kommented..."
                        multiline
                        numberOfLines={6}
                        value={comment}
                        onChangeText={setComment}
                        onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                        style={styles.input}
                        contentStyle={{ paddingTop: 10, paddingBottom: 10 }}
                        disabled={posting || uploading}
                    />

                    <Text variant="labelSmall" style={styles.quickLabel}>Gyors válaszok:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
                        {quickComments.map((text, index) => (
                            <Button
                                key={index}
                                mode="outlined"
                                compact
                                style={styles.quickButton}
                                onPress={() => setComment(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + text)}
                                disabled={posting || uploading}
                            >
                                {text}
                            </Button>
                        ))}
                    </ScrollView>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss} disabled={posting || uploading}>Mégse</Button>
                    <Button onPress={handlePost} loading={posting} disabled={posting || uploading || !comment.trim()}>Küldés</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    dialog: {
        maxHeight: '80%',
    },
    input: {
        minHeight: 120,
        backgroundColor: 'transparent'
    },
    helperRow: {
        flexDirection: 'row',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    quickLabel: {
        marginTop: 12,
        marginBottom: 4,
        opacity: 0.7,
    },
    quickScroll: {
        flexDirection: 'row',
    },
    quickButton: {
        marginRight: 8,
        borderRadius: 8,
    },
    uploadBtnWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadLoader: {
        position: 'absolute',
    }
});

export default PostDialog;
