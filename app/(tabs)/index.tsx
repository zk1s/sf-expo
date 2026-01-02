import { getComments, getLastPageNumber } from '@/api/api';
import CommentItem from '@/components/CommentItem';
import FeedActions from '@/components/FeedActions';
import Pagination from '@/components/Pagination';
import PostDialog from '@/components/PostDialog';
import { useAuth } from '@/context/AuthContext';
import { Comment } from '@/types';
import { formatReply } from '@/utils/formatting';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [postVisible, setPostVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const flatListRef = useRef<FlatList>(null);

  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();


  const loadPage = useCallback(async (page: number, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const newComments = await getComments(page);
      setComments(newComments);
      setCurrentPage(page);
    } catch (e) {
      console.error(e);
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const init = useCallback(async () => {
    try {
      setLoading(true);
      const lastPage = await getLastPageNumber();
      setTotalPages(lastPage);
      setCurrentPage(lastPage);
      await loadPage(lastPage);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [loadPage]);

  useEffect(() => {
    init();
  }, [init]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const last = await getLastPageNumber();
      setTotalPages(last);
      await loadPage(currentPage, true);
    } catch (e) {
      console.error(e);
      setRefreshing(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadPage(page);
  };


  const [initialPostContent, setInitialPostContent] = useState('');

  const checkAuth = () => {
    if (!user) {
      Alert.alert("Hitelesítés szükséges", "Kérlek jelentkezz be.", [
        { text: "Mégse", style: "cancel" },
        { text: "Bejelentkezés", onPress: () => router.push('/profile') }
      ]);
      return false;
    }
    return true;
  };

  const handleReply = (comment: Comment) => {
    if (!checkAuth()) return;
    setInitialPostContent(formatReply(comment));
    setPostVisible(true);
  };

  const handleFabPress = () => {
    if (!checkAuth()) return;
    setInitialPostContent('');
    setPostVisible(true);
  };

  const onPostSuccess = () => {
    onRefresh();
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleScrollFailed = (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
    flatListRef.current?.scrollToOffset({ offset: info.index * info.averageItemLength, animated: true });
  };

  if (loading && !refreshing && comments.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <FlatList
        ref={flatListRef}
        data={[...comments].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CommentItem comment={item} onReply={handleReply} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        onScrollToIndexFailed={handleScrollFailed}
        removeClippedSubviews={false}
        initialNumToRender={comments.length}
        maxToRenderPerBatch={comments.length}
        windowSize={21}
        inverted
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={loading || refreshing}
      />

      <FeedActions
        onScrollTop={scrollToTop}
        onScrollBottom={scrollToBottom}
        onPost={handleFabPress}
      />

      <PostDialog
        visible={postVisible}
        onDismiss={() => setPostVisible(false)}
        onPostSuccess={onPostSuccess}
        initialContent={initialPostContent}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
