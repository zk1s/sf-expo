import { getComments, getLastPageNumber } from '@/api/api';
import CommentItem from '@/components/CommentItem';
import FeedActions from '@/components/FeedActions';
import Pagination from '@/components/Pagination';
import PostDialog from '@/components/PostDialog';
import { useAuth } from '@/context/AuthContext';
import { Comment } from '@/types';
import { formatReply } from '@/utils/formatting';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Icon, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [postVisible, setPostVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const flatListRef = useRef<FlatList>(null);

  const [newComments, setNewComments] = useState<Comment[]>([]);
  const [showNewCommentsBanner, setShowNewCommentsBanner] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCommentIdRef = useRef<string>('');

  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ page?: string; commentId?: string }>();

  const loadPage = useCallback(async (page: number, isRefresh = false, highlightId?: string) => {
    try {
      if (!isRefresh) setLoading(true);
      const newComments = await getComments(page);

      if (highlightId) {
        newComments.forEach(c => {
          if (c.id === highlightId) c.isHighlighted = true;
        });
      }

      setComments(newComments);
      setCurrentPage(page);

      if (newComments.length > 0) {
        lastCommentIdRef.current = newComments[newComments.length - 1].id;
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const checkForNewComments = useCallback(async () => {
    if (currentPage !== totalPages || loading || refreshing) return;

    try {
      const latestComments = await getComments(currentPage);
      const lastKnownId = lastCommentIdRef.current;

      if (!lastKnownId || latestComments.length === 0) return;

      const lastKnownIndex = latestComments.findIndex(c => c.id === lastKnownId);

      if (lastKnownIndex === -1 || lastKnownIndex === latestComments.length - 1) return;

      const freshComments = latestComments.slice(lastKnownIndex + 1);

      if (freshComments.length > 0) {
        setNewComments(freshComments);
        setShowNewCommentsBanner(true);
        lastCommentIdRef.current = freshComments[freshComments.length - 1].id;
      }
    } catch (e) {
      console.error('Error checking for new comments:', e);
    }
  }, [currentPage, totalPages, loading, refreshing]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const last = await getLastPageNumber();
      setTotalPages(last);
      await loadPage(currentPage, true);
      setNewComments([]);
      setShowNewCommentsBanner(false);
    } catch (e) {
      console.error(e);
      setRefreshing(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadPage(page);
    setNewComments([]);
    setShowNewCommentsBanner(false);
  };

  const init = useCallback(async () => {
    try {
      setLoading(true);
      const lastPage = await getLastPageNumber();
      setTotalPages(lastPage);

      const targetPage = params.page ? parseInt(params.page, 10) : lastPage;
      setCurrentPage(targetPage);
      await loadPage(targetPage, false, params.commentId);

    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [loadPage, params.page, params.commentId]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (comments.length > 0 && params.commentId && !loading) {
      const index = [...comments].reverse().findIndex(c => c.id === params.commentId);
      if (index !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }, 300);
      }
    }
  }, [comments, params.commentId, loading]);

  useEffect(() => {
    if (currentPage === totalPages && !loading) {
      pollingIntervalRef.current = setInterval(checkForNewComments, 10000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [currentPage, totalPages, loading, checkForNewComments]);

  const showNewCommentsHandler = () => {
    setComments(prev => [...prev, ...newComments]);
    if (newComments.length > 0) {
      lastCommentIdRef.current = newComments[newComments.length - 1].id;
    }
    setNewComments([]);
    setShowNewCommentsBanner(false);
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

      {showNewCommentsBanner && newComments.length > 0 && (
        <TouchableOpacity
          style={[styles.newCommentsBanner, { backgroundColor: theme.colors.primaryContainer }]}
          onPress={showNewCommentsHandler}
          activeOpacity={0.8}
        >
          <Icon source="arrow-down" size={20} color={theme.colors.onPrimaryContainer} />
          <Text variant="labelLarge" style={[styles.bannerText, { color: theme.colors.onPrimaryContainer }]}>
            {newComments.length} új komment érkezett
          </Text>
          <Icon source="arrow-down" size={20} color={theme.colors.onPrimaryContainer} />
        </TouchableOpacity>
      )}

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
  newCommentsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  bannerText: {
    fontWeight: 'bold',
  },
});
