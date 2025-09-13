import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import ThemeText from '../../../components/ui/ThemeText';
import WrapperView from '../../../components/input/WrapperView';
import { Ellipsis } from 'lucide-react-native';
import { fetchConversations } from '../../../database/main/fetchConversation';
import NoIdeas from '../../../components/navBar/NoIdeas';
import LayoutView from '../../../components/layout/LayoutView';

/**
 * ArchiveList
 * Displays ONLY id and structured_payload from survey_conversations, with optional title search.
 *
 * Props:
 *  - userId?         (string) filter by user
 *  - archivedOnly?   (boolean) default true
 *  - searchTerm?     (string) raw search text (debounced internally)
 *  - debounceMs?     (number) debounce delay (default 400)
 *  - onItemPress?(item)
 *  - onItemOptions?(item)
 */
const ArchiveList = ({
  userId,
  archivedOnly = true,
  searchTerm = '',
  debounceMs = 400,
  onItemPress,
  onItemOptions
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [debounced, setDebounced] = useState(searchTerm);

  // Debounce searchTerm changes
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm), debounceMs);
    return () => clearTimeout(t);
  }, [searchTerm, debounceMs]);

  async function load({ searching = false } = {}) {
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
    load({ searching: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, userId, archivedOnly]);

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
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <LayoutView className="gap-2">
        {rows.map(item => {
          const title =
            item.structured_payload?.title ||
            item.structured_payload?.Title ||
            '[no title]';

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => onItemPress?.(item)}
            >
              <WrapperView className="archiveList flex-row items-center">
                <ThemeText className="flex-1 font-semibold" numberOfLines={1}>
                  {title}
                </ThemeText>
                <ThemeText className="text-[10px] text-gray-500 mr-3">
                  {item.id.slice(0, 8)}…
                </ThemeText>
                <TouchableOpacity
                  onPress={e => {
                    e?.stopPropagation?.();
                    onItemOptions?.(item);
                  }}
                  hitSlop={12}
                >
                  <Ellipsis color="white" />
                </TouchableOpacity>
              </WrapperView>
            </TouchableOpacity>
          );
        })}
      </LayoutView>
    </ScrollView>
  );
};

export default ArchiveList;