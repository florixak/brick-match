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
