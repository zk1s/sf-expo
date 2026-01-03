import { searchComments } from '@/api/search';
import CommentItem from '@/components/CommentItem';
import { Comment, SearchParams, SearchResult } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
    const [params, setParams] = useState<SearchParams>({
        user: '',
        comment: '',
        is_reg: '',
        points: '',
        fromdate: '',
        todate: ''
    });
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const theme = useTheme();
    const router = useRouter();
    const localParams = useLocalSearchParams<{ user?: string }>();

    useEffect(() => {
        if (localParams.user) {
            setParams(prev => ({ ...prev, user: localParams.user || '' }));
            handleSearch(localParams.user);
        }
    }, [localParams.user]);

    const handleSearch = async (overrideUser?: string) => {
        setLoading(true);
        setShowFilters(false);
        const searchParams = overrideUser ? { ...params, user: overrideUser } : params;
        const data = await searchComments(searchParams);
        setResults(data);
        setLoading(false);
    };

    const jumpToComment = (result: SearchResult) => {
        router.replace({
            pathname: '/',
            params: {
                page: result.pageNo.toString(),
                commentId: result.id
            }
        });
    };

    const mapResultToComment = (item: SearchResult): Comment => ({
        id: item.id,
        author: item.author,
        authorRank: '#' + item.pageNo,
        authorClasses: item.isRegistered ? 'verified' : '',
        date: item.date,
        contentHtml: item.contentHtml,
        avatarUrl: '',
        upvotes: item.points,
        isHighlighted: false,
        isLiked: false,
    });

    const renderResult = ({ item }: { item: SearchResult }) => (
        <CommentItem
            comment={mapResultToComment(item)}
            customFooter={
                <Card.Actions style={{ justifyContent: 'flex-end', paddingRight: 16 }}>
                    <Button
                        mode="contained"
                        onPress={() => jumpToComment(item)}
                        style={{ borderRadius: 20 }}
                    >
                        Ugrás a kommenthez
                    </Button>
                </Card.Actions>
            }
        />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>Kommentkereső</Text>
                <IconButton
                    icon={showFilters ? "chevron-up" : "chevron-down"}
                    onPress={() => setShowFilters(!showFilters)}
                />
            </View>

            {showFilters && (
                <Card style={styles.filterCard} mode="outlined">
                    <ScrollView contentContainerStyle={styles.filterContent}>
                        <TextInput
                            label="Felhasználó"
                            value={params.user}
                            onChangeText={(t) => setParams({ ...params, user: t })}
                            style={styles.input}
                            mode="outlined"
                        />
                        <TextInput
                            label="Komment részlet"
                            value={params.comment}
                            onChangeText={(t) => setParams({ ...params, comment: t })}
                            style={styles.input}
                            mode="outlined"
                        />
                        <View style={styles.row}>
                            <TextInput
                                label="Reg (0/1)"
                                value={params.is_reg}
                                onChangeText={(t) => setParams({ ...params, is_reg: t })}
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                                keyboardType="numeric"
                                mode="outlined"
                            />
                            <TextInput
                                label="Pontok"
                                value={params.points}
                                onChangeText={(t) => setParams({ ...params, points: t })}
                                style={[styles.input, { flex: 1 }]}
                                keyboardType="numeric"
                                mode="outlined"
                            />
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                label="Ettől (YYYY-MM-DD)"
                                value={params.fromdate}
                                onChangeText={(t) => setParams({ ...params, fromdate: t })}
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                                placeholder="2024-01-01"
                                mode="outlined"
                            />
                            <TextInput
                                label="Eddig (YYYY-MM-DD)"
                                value={params.todate}
                                onChangeText={(t) => setParams({ ...params, todate: t })}
                                style={[styles.input, { flex: 1 }]}
                                placeholder="2024-12-31"
                                mode="outlined"
                            />
                        </View>
                        <Button
                            mode="contained"
                            onPress={() => handleSearch()}
                            loading={loading}
                            disabled={loading}
                        >
                            Keresés
                        </Button>
                    </ScrollView>
                </Card>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderResult}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        results.length === 0 && !showFilters ? (
                            <View style={styles.loadingContainer}>
                                <Text variant="bodyLarge">Nincs találat.</Text>
                            </View>
                        ) : null
                    }
                    ListHeaderComponent={
                        results.length > 0 ? (
                            <Text variant="labelLarge" style={styles.resultCount}>
                                Találatok száma: {results.length}
                            </Text>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    title: {
        fontWeight: 'bold',
    },
    filterCard: {
        margin: 10,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    filterContent: {
        padding: 12,
    },
    input: {
        marginBottom: 8,
        height: 40,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    listContent: {
        paddingBottom: 20,
    },
    resultCount: {
        margin: 16,
        opacity: 0.7,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
});
