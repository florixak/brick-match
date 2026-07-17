import {
  buildMinifigInventoryMapFromRows,
  expandMinifigRows,
  type ComponentPart,
} from './import.service';

describe('buildMinifigInventoryMapFromRows', () => {
  it('maps fig_num to the inventory id with the highest version', () => {
    const rows = [
      { set_num: 'fig-001', id: '100', version: '1' },
      { set_num: 'fig-001', id: '200', version: '2' },
      { set_num: 'fig-002', id: '300', version: '1' },
    ];
    const result = buildMinifigInventoryMapFromRows(
      rows,
      new Set(['fig-001', 'fig-002']),
    );
    expect(result.get('fig-001')).toBe(200);
    expect(result.get('fig-002')).toBe(300);
  });

  it('uses the highest id as a tiebreaker when versions are equal', () => {
    const rows = [
      { set_num: 'fig-001', id: '100', version: '1' },
      { set_num: 'fig-001', id: '150', version: '1' },
    ];
    const result = buildMinifigInventoryMapFromRows(rows, new Set(['fig-001']));
    expect(result.get('fig-001')).toBe(150);
  });

  it('ignores fig_nums not in referencedFigNums', () => {
    const rows = [{ set_num: 'fig-001', id: '100', version: '1' }];
    const result = buildMinifigInventoryMapFromRows(rows, new Set(['fig-999']));
    expect(result.size).toBe(0);
  });

  it('returns an empty map when rows is empty', () => {
    const result = buildMinifigInventoryMapFromRows([], new Set(['fig-001']));
    expect(result.size).toBe(0);
  });
});

describe('expandMinifigRows', () => {
  const setInventoryMap = new Map([[10, 'set-001']]);
  const minifigInventoryMap = new Map<string, number>([
    ['fig-001', 20],
    ['fig-002', 30],
  ]);

  const components = new Map<number, ComponentPart[]>([
    [
      20,
      [
        { partNum: '3001', colorId: 1, quantity: 1, isSpare: false },
        { partNum: '3001', colorId: 1, quantity: 1, isSpare: true },
      ],
    ],
    [30, [{ partNum: '3001', colorId: 1, quantity: 2, isSpare: false }]],
  ]);

  it('multiplies minifig quantity by component quantity', () => {
    const rows = [{ inventory_id: '10', fig_num: 'fig-001', quantity: '3' }];
    const { expanded } = expandMinifigRows(
      rows,
      setInventoryMap,
      minifigInventoryMap,
      components,
    );
    const nonSpare = expanded.find(
      (r) => r.partNum === '3001' && r.colorId === 1 && !r.isSpare,
    );
    expect(nonSpare?.quantity).toBe(3); // 3 × 1
  });

  it('keeps spare and non-spare variants as separate rows', () => {
    const rows = [{ inventory_id: '10', fig_num: 'fig-001', quantity: '1' }];
    const { expanded } = expandMinifigRows(
      rows,
      setInventoryMap,
      minifigInventoryMap,
      components,
    );
    expect(expanded).toHaveLength(2);
    expect(expanded.some((r) => r.isSpare)).toBe(true);
    expect(expanded.some((r) => !r.isSpare)).toBe(true);
  });

  it('aggregates duplicate (partNum, colorId, isSpare) from two minifigs in the same set', () => {
    const rows = [
      { inventory_id: '10', fig_num: 'fig-001', quantity: '1' },
      { inventory_id: '10', fig_num: 'fig-002', quantity: '1' },
    ];
    // fig-001 contributes 1×1=1; fig-002 contributes 1×2=2; total = 3
    const { expanded } = expandMinifigRows(
      rows,
      setInventoryMap,
      minifigInventoryMap,
      components,
    );
    const nonSpare = expanded.find(
      (r) => r.partNum === '3001' && r.colorId === 1 && !r.isSpare,
    );
    expect(nonSpare?.quantity).toBe(3);
  });

  it('sets the correct set_num on all expanded rows', () => {
    const rows = [{ inventory_id: '10', fig_num: 'fig-001', quantity: '1' }];
    const { expanded } = expandMinifigRows(
      rows,
      setInventoryMap,
      minifigInventoryMap,
      components,
    );
    expect(expanded.every((r) => r.setNum === 'set-001')).toBe(true);
  });

  it('skips rows where fig_num has no resolvable minifig inventory', () => {
    const rows = [{ inventory_id: '10', fig_num: 'fig-999', quantity: '1' }];
    const { expanded, skippedUnknownFig } = expandMinifigRows(
      rows,
      setInventoryMap,
      minifigInventoryMap,
      components,
    );
    expect(expanded).toHaveLength(0);
    expect(skippedUnknownFig).toBe(1);
  });

  it('skips rows where the minifig inventory has no components', () => {
    const emptyComponents = new Map<number, ComponentPart[]>([[20, []]]);
    const rows = [{ inventory_id: '10', fig_num: 'fig-001', quantity: '1' }];
    const { expanded, skippedNoComponents } = expandMinifigRows(
      rows,
      setInventoryMap,
      new Map([['fig-001', 20]]),
      emptyComponents,
    );
    expect(expanded).toHaveLength(0);
    expect(skippedNoComponents).toBe(1);
  });

  it('ignores rows whose inventory_id is not in setInventoryMap', () => {
    const rows = [{ inventory_id: '999', fig_num: 'fig-001', quantity: '1' }];
    const { expanded } = expandMinifigRows(
      rows,
      setInventoryMap,
      minifigInventoryMap,
      components,
    );
    expect(expanded).toHaveLength(0);
  });

  it('returns empty result with zero skip counts for an empty input', () => {
    const { expanded, skippedUnknownFig, skippedNoComponents } =
      expandMinifigRows([], setInventoryMap, minifigInventoryMap, components);
    expect(expanded).toHaveLength(0);
    expect(skippedUnknownFig).toBe(0);
    expect(skippedNoComponents).toBe(0);
  });
});

/**
 * Tests that simulate the cross-batch accumulation behaviour of
 * accumulateAllMinifigParts (the in-memory Map merge step) and the
 * combined-qty merge done inside importInventoryParts.
 */
describe('cross-batch accumulation and combined-qty merge', () => {
  const setInventoryMap = new Map([[10, 'set-001']]);
  const minifigInventoryMap = new Map<string, number>([['fig-001', 20]]);
  const components = new Map<number, ComponentPart[]>([
    [20, [{ partNum: '3001', colorId: 1, quantity: 1, isSpare: false }]],
  ]);

  /** Simulate accumulateAllMinifigParts for two consecutive batches. */
  function accumulateBatches(
    batches: Array<
      Array<{ inventory_id: string; fig_num: string; quantity: string }>
    >,
  ): Map<string, { quantity: number }> {
    const accumulated = new Map<string, { quantity: number }>();
    for (const batch of batches) {
      const { expanded } = expandMinifigRows(
        batch,
        setInventoryMap,
        minifigInventoryMap,
        components,
      );
      for (const row of expanded) {
        const key = `${row.setNum}:${row.partNum}:${row.colorId}:${row.isSpare}`;
        const existing = accumulated.get(key);
        if (existing) {
          existing.quantity += row.quantity;
        } else {
          accumulated.set(key, { quantity: row.quantity });
        }
      }
    }
    return accumulated;
  }

  it('sums the same key across two separate batches', () => {
    // Batch 1: 1× fig-001; Batch 2: 2× fig-001 → total 3
    const map = accumulateBatches([
      [{ inventory_id: '10', fig_num: 'fig-001', quantity: '1' }],
      [{ inventory_id: '10', fig_num: 'fig-001', quantity: '2' }],
    ]);
    const key = 'set-001:3001:1:false';
    expect(map.get(key)?.quantity).toBe(3);
  });

  it('minifig-only key stays in map if not consumed by a direct part', () => {
    const map = accumulateBatches([
      [{ inventory_id: '10', fig_num: 'fig-001', quantity: '2' }],
    ]);
    expect(map.size).toBe(1);
    expect(map.get('set-001:3001:1:false')?.quantity).toBe(2);
  });

  it('merging direct qty with minifig qty produces the absolute total', () => {
    const map = accumulateBatches([
      [{ inventory_id: '10', fig_num: 'fig-001', quantity: '2' }],
    ]);
    const key = 'set-001:3001:1:false';
    const directQty = 5;
    const minifigQty = map.get(key)?.quantity ?? 0;

    // Combined quantity written to DB (replace upsert)
    expect(directQty + minifigQty).toBe(7);
  });

  it('key is consumed (deleted) after merging with direct part', () => {
    const map = new Map([['set-001:3001:1:false', { quantity: 2 }]]);

    const directQty = 4;
    const key = 'set-001:3001:1:false';
    const minifigQty = map.get(key)?.quantity ?? 0;
    map.delete(key);

    expect(directQty + minifigQty).toBe(6);
    expect(map.has(key)).toBe(false); // will not be written again in minifig-only pass
  });

  it('re-import produces the same totals as the first import', () => {
    // Simulate two import runs — result must be identical.
    const run = () =>
      accumulateBatches([
        [{ inventory_id: '10', fig_num: 'fig-001', quantity: '3' }],
      ]);
    const first = run();
    const second = run();
    expect(first.get('set-001:3001:1:false')?.quantity).toBe(
      second.get('set-001:3001:1:false')?.quantity,
    );
  });
});
