import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ellipsis } from 'lucide-react-native';
import { Portal } from 'react-native-portalize';
import * as ExpoLinking from 'expo-linking';

import ArchiveModal from '../modal/ArchiveModal';
import ThemeText from '../../../components/ui/ThemeText';
import WrapperView from '../../../components/input/WrapperView';
import NoIdeas from '../../../components/navBar/NoIdeas';
import LayoutView from '../../../components/layout/LayoutView';

import { fetchConversations } from '../../../database/main/fetchConversation';
import { deleteConversation } from '../../../database/main/deleteConversation';
import { supabase } from '../../../database/lib/supabase';

const ArchiveList = ({
  userId,
  archivedOnly = true,
  searchTerm = '',
  debounceMs = 400,
  onItemPress,
  onItemOptions
}) => {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [debounced, setDebounced] = useState(searchTerm);

  // Options menu state
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsItem, setOptionsItem] = useState(null);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm), debounceMs);
    return () => clearTimeout(t);
  }, [searchTerm, debounceMs]);

  async function load() {
    setLoading(true);
    setErr(null);
    const { data, error } = await fetchConversations({
      userId,
      archivedOnly,
      search: debounced
    });
    if (error) setErr(error);
    else setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, userId, archivedOnly]);

  const handleDefaultPress = (item) => {
    try {
      router.push({
        pathname: '/Generate',
        params: { conversationId: item.id }
      });
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = `/Generate?conversationId=${item.id}`;
      }
    }
  };

  const openOptions = useCallback((item, evt) => {
    const px = evt?.nativeEvent?.pageX ?? 0;
    const py = evt?.nativeEvent?.pageY ?? 0;
    setAnchor({ x: px, y: py });
    setOptionsItem(item);
    setOptionsOpen(true);
  }, []);

  const closeOptions = useCallback(() => {
    setOptionsOpen(false);
    setTimeout(() => setOptionsItem(null), 120);
  }, []);

  // Build an absolute share URL for the app that includes the share token
  function buildAbsoluteShareUrl(id, token) {
    const tokenPart = token ? `&token=${token}` : '';
    const path = `/Generate?conversationId=${id}${tokenPart}`;

    // Prefer browser origin on web, otherwise try ExpoLinking
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${path}`;
    }
    try {
      return ExpoLinking.createURL(path);
    } catch {
      const BASE = process.env.EXPO_PUBLIC_APP_BASE_URL || '';
      return BASE ? `${BASE}${path}` : path;
    }
  }

  // Share: fetch the DB token if needed and create a URL that includes &token=...
  const handleShare = useCallback(async () => {
    if (!optionsItem) return;

    try {
      // Prefer token embedded in optionsItem (if fetchConversations included it)
      let token = optionsItem.share_token || optionsItem?.shareToken || null;

      // If not present, read from DB directly (ensures we have the DB-generated token)
      if (!token) {
        const { data: convRow, error: convErr } = await supabase
          .from('survey_conversations')
          .select('share_token')
          .eq('id', optionsItem.id)
          .maybeSingle();

        if (convErr) {
          console.warn('[ArchiveList] failed to fetch share_token', convErr);
        } else if (convRow?.share_token) {
          token = convRow.share_token;
        }
      }

      const title =
        optionsItem.structured_payload?.title ||
        optionsItem.structured_payload?.Title ||
        'Conversation';

      const url = buildAbsoluteShareUrl(optionsItem.id, token);

      try {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({ title, url });
        } else {
          await Share.share({ message: url, url, title });
        }
      } catch {
        // ignore user cancel / share errors
      }
    } catch (e) {
      console.error('[ArchiveList] share failed', e);
    } finally {
      closeOptions();
    }
  }, [optionsItem, closeOptions]);

  // Delete from database (no confirmation)
  const handleDelete = useCallback(async () => {
    if (!optionsItem) return;

    const idToRemove = optionsItem.id;

    // Optimistic remove
    setRows((prev) => prev.filter((r) => r.id !== idToRemove));

    try {
      const { error } = await deleteConversation({ id: idToRemove });
      if (error) {
        console.error('Delete failed:', error?.message || error);
        // Re-sync list if backend failed
        await load();
      } else {
        onItemOptions?.({ action: 'delete', item: optionsItem });
      }
    } catch (e) {
      console.error('Delete failed:', e?.message || e);
      await load();
    } finally {
      closeOptions();
    }
  }, [optionsItem, onItemOptions, closeOptions]);

  if (loading && rows.length === 0) {
    return (
      <WrapperView className="p-4 items-center">
        <ActivityIndicator size="small" />
      </WrapperView>
    );
  }

  if (err) {
    return (
      <WrapperView className="p-4">
        <ThemeText className="text-red-400 text-xs">
          {err.message || 'Failed to load archives.'}
        </ThemeText>
        <TouchableOpacity onPress={() => load()} style={{ marginTop: 8 }}>
          <ThemeText className="text-blue-400 text-xs underline">Retry</ThemeText>
        </TouchableOpacity>
      </WrapperView>
    );
  }

  const isSearching = !!debounced.trim();

  if (!loading && rows.length === 0) {
    return (
      <WrapperView className="p-4 items-center">
        {isSearching ? (
          <ThemeText className="text-gray-400 text-xs">
            No results for "{debounced}"
          </ThemeText>
        ) : (
          <NoIdeas />
        )}
      </WrapperView>
    );
  }

  return (
    <>
      <LayoutView className="gap-2">
        {rows.map((item) => {
          const title =
            item.structured_payload?.title ||
            item.structured_payload?.Title ||
            '[no title]';

          return (
            <WrapperView
              key={item.id}
              className="archiveList flex-row gap-2 items-center"
            >
              <Link
                href={{ pathname: '/Generate', params: { conversationId: item.id } }}
                asChild
              >
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={{ flex: 1 }}
                  onPress={() => {
                    if (onItemPress) onItemPress(item);
                    else handleDefaultPress(item);
                  }}
                >
                  <ThemeText className="flex-1 font-semibold" numberOfLines={1}>
                    {title}
                  </ThemeText>
                </TouchableOpacity>
              </Link>

              <TouchableOpacity
                onPress={(e) => {
                  e?.stopPropagation?.();
                  openOptions(item, e);
                }}
                hitSlop={12}
              >
                <Ellipsis color="white" />
              </TouchableOpacity>
            </WrapperView>
          );
        })}
      </LayoutView>

      <Portal>
        <ArchiveModal
          visible={optionsOpen}
          anchor={anchor}
          item={optionsItem}
          onClose={closeOptions}
          onShare={handleShare}
          onDelete={handleDelete}
        />
      </Portal>
    </>
  );
};

export default ArchiveList;