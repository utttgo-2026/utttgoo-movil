import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getGridMetrics, groupRows, useWindowDimensions } from '@/hooks/useResponsive';
import { layout, spacing } from '@/theme';
import type { FoodItem } from '@/types/models';
import { FoodCard } from './FoodCard';

export function ResponsiveFoodGrid({ foods, onFoodPress, header, empty, testID }: {
  foods: readonly FoodItem[];
  onFoodPress: (food: FoodItem) => void;
  header?: React.ReactElement;
  empty?: React.ReactElement;
  testID: string;
}) {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const availableWidth = Math.max(1, window.width - insets.left - insets.right);
  const metrics = getGridMetrics(Math.min(measuredWidth || availableWidth, availableWidth), window.fontScale, layout.screenPadding, spacing.md);
  const rows = useMemo(() => groupRows(foods, metrics.columns), [foods, metrics.columns]);
  const list = useRef<FlatList<FoodItem[]>>(null);
  const offset = useRef(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => list.current?.scrollToOffset({ offset: offset.current, animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [metrics.columns, metrics.width]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => { offset.current = Math.max(0, event.nativeEvent.contentOffset.y); };
  return (
    <FlatList ref={list} testID={testID} style={styles.list} data={rows}
      initialNumToRender={Math.max(1, Math.min(24, rows.length))} maxToRenderPerBatch={8} windowSize={7}
      // Una columna nativa estable de filas: no key={columns}, input ni FlatList se desmontan.
      keyExtractor={(_row, index) => `row-${index}`}
      onLayout={(event) => { const width = event.nativeEvent.layout.width; if (width > 0) setMeasuredWidth(width); }}
      onScroll={onScroll} scrollEventThrottle={16} keyboardShouldPersistTaps="handled" removeClippedSubviews={false}
      contentContainerStyle={styles.content} ListHeaderComponent={header} ListEmptyComponent={empty}
      renderItem={({ item: row }) => (
        <View style={styles.row} testID={`${testID}-row`}>
          {row.map((food) => <FoodCard key={food.id} food={food} width={metrics.cardWidth} onPress={onFoodPress} />)}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
  content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xxl, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.md },
});
