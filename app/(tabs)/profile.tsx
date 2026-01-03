import { getUserProfile, updateUserProfile, UserProfile } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Divider, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, login, logout, isLoading: authLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [signature, setSignature] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const profileData = await getUserProfile();
            if (profileData) {
                setProfile(profileData);
                setSignature(profileData.signature);
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Hiba', 'Nem sikerült betölteni a profilt');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Hiba', 'Kérlek add meg a felhasználónevet és jelszót');
            return;
        }
        try {
            await login(username, password);
        } catch (e) {
            Alert.alert('Bejelentkezés sikertelen', 'Ellenőrizd az adataidat és próbáld újra.');
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const success = await updateUserProfile(signature, selectedImage);
            if (success) {
                Alert.alert('Siker', 'Profil frissítve!');
                setSelectedImage(undefined);
                await loadProfile();
            } else {
                Alert.alert('Hiba', 'Nem sikerült frissíteni a profilt');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Hiba', 'Nem sikerült frissíteni a profilt');
        } finally {
            setSaving(false);
        }
    };

    const copyAuthCode = () => {
        if (profile?.authCode) {
            Alert.alert(
                'Hitelesítő kód',
                profile.authCode,
                [
                    {
                        text: 'Másolás',
                        onPress: async () => {
                            await Clipboard.setStringAsync(profile.authCode);
                            Alert.alert('Siker', 'Kód a vágólapra másolva!');
                        }
                    },
                    { text: 'Bezárás', style: 'cancel' }
                ]
            );
        }
    };

    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text variant="headlineLarge" style={styles.title}>Bejelentkezés</Text>

                    <Surface style={styles.surface} elevation={2}>
                        <TextInput
                            label="Felhasználónév"
                            value={username}
                            onChangeText={setUsername}
                            mode="outlined"
                            style={styles.input}
                            autoCapitalize="none"
                        />
                        <TextInput
                            label="Jelszó"
                            value={password}
                            onChangeText={setPassword}
                            mode="outlined"
                            secureTextEntry
                            style={styles.input}
                        />
                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            loading={authLoading}
                            disabled={authLoading}
                            style={styles.button}
                        >
                            Bejelentkezés
                        </Button>
                    </Surface>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.center}>
                    <Text>Betöltés...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text variant="headlineLarge" style={styles.title}>Profil</Text>

                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.avatarSection}>
                            <Avatar.Image
                                size={100}
                                source={{ uri: selectedImage || profile?.avatarUrl || 'https://via.placeholder.com/100' }}
                            />
                            <Button mode="outlined" onPress={pickImage} style={styles.avatarButton}>
                                Profilkép módosítása
                            </Button>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.field}>
                            <Text variant="labelLarge">Nicknév:</Text>
                            <Text variant="bodyLarge" style={styles.username}>{profile?.username}</Text>
                        </View>

                        <View style={styles.field}>
                            <TextInput
                                label="Aláírás"
                                value={signature}
                                onChangeText={setSignature}
                                mode="outlined"
                                maxLength={100}
                                style={styles.input}
                            />
                            <Text variant="bodySmall" style={styles.hint}>
                                Maximum 100 karakter
                            </Text>
                        </View>

                        <Button
                            mode="contained"
                            onPress={handleSave}
                            loading={saving}
                            disabled={saving}
                            style={styles.button}
                        >
                            Mentés
                        </Button>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Hitelesítő kód
                        </Text>
                        <Text variant="bodySmall" style={styles.hint}>
                            Másold ki és mentsd el. Később ezzel a kóddal tudod igazolni az adminisztrátorok számára, hogy az account hozzád tartozik.
                        </Text>
                        <Button mode="contained" onPress={copyAuthCode} style={styles.button}>
                            Kód megtekintése
                        </Button>
                    </Card.Content>
                </Card>

                <Button mode="contained" onPress={logout} style={styles.logoutButton}>
                    Kijelentkezés
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        justifyContent: 'center',
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    title: {
        textAlign: 'center',
        marginBottom: 24,
    },
    surface: {
        padding: 24,
        borderRadius: 8,
    },
    card: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarButton: {
        marginTop: 12,
    },
    divider: {
        marginVertical: 16,
    },
    field: {
        marginBottom: 16,
    },
    username: {
        marginTop: 4,
        fontWeight: 'bold',
    },
    hint: {
        marginTop: 4,
        opacity: 0.7,
    },
    sectionTitle: {
        marginBottom: 8,
    },
    authCodeBox: {
        padding: 12,
        borderRadius: 8,
        marginVertical: 12,
    },
    logoutButton: {
        marginTop: 24,
        marginBottom: 32,
    },
});
