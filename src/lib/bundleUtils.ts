import { InventoryItem, BundleComponent } from '../types';

export interface ComponentBreakdown {
  sku: string;
  name: string;
  requiredQty: number;
  currentStock: number;
  maxSets: number;
  isLimiting: boolean;
}

/**
 * Calculates how many full bundle packages can be assembled / fulfilled
 * based on the current available stock of each component.
 */
export function calculateBundleStock(bundle: InventoryItem, allInventory: InventoryItem[]): number {
  if (!bundle.isBundle || !bundle.bundleItems || bundle.bundleItems.length === 0) {
    return bundle.stock || 0;
  }

  let minPackages = Infinity;

  for (const comp of bundle.bundleItems) {
    const invItem = allInventory.find(i => i.sku === comp.sku);
    const available = invItem ? invItem.stock : 0;
    const req = comp.qty > 0 ? comp.qty : 1;
    const sets = Math.floor(available / req);
    if (sets < minPackages) {
      minPackages = sets;
    }
  }

  return minPackages === Infinity ? 0 : Math.max(0, minPackages);
}

/**
 * Provides a detailed status breakdown of all components within a bundle.
 */
export function getBundleComponentBreakdown(
  bundle: InventoryItem,
  allInventory: InventoryItem[]
): ComponentBreakdown[] {
  if (!bundle.bundleItems || bundle.bundleItems.length === 0) return [];

  const maxTotalSets = calculateBundleStock(bundle, allInventory);

  return bundle.bundleItems.map(comp => {
    const invItem = allInventory.find(i => i.sku === comp.sku);
    const currentStock = invItem ? invItem.stock : 0;
    const req = comp.qty > 0 ? comp.qty : 1;
    const maxSets = Math.floor(currentStock / req);

    return {
      sku: comp.sku,
      name: comp.name || invItem?.name || comp.sku,
      requiredQty: req,
      currentStock,
      maxSets,
      isLimiting: maxSets === maxTotalSets
    };
  });
}

/**
 * Validates if the requested quantity of a bundle can be fulfilled.
 */
export function checkBundleFulfillable(
  bundle: InventoryItem,
  allInventory: InventoryItem[],
  requestedQty: number
): {
  isFulfillable: boolean;
  shortages: { name: string; sku: string; needed: number; available: number }[];
} {
  if (!bundle.isBundle || !bundle.bundleItems || bundle.bundleItems.length === 0) {
    const isFulfillable = (bundle.stock || 0) >= requestedQty;
    return {
      isFulfillable,
      shortages: isFulfillable
        ? []
        : [{ name: bundle.name, sku: bundle.sku, needed: requestedQty, available: bundle.stock || 0 }]
    };
  }

  const shortages: { name: string; sku: string; needed: number; available: number }[] = [];

  for (const comp of bundle.bundleItems) {
    const invItem = allInventory.find(i => i.sku === comp.sku);
    const available = invItem ? invItem.stock : 0;
    const totalNeeded = (comp.qty > 0 ? comp.qty : 1) * requestedQty;

    if (available < totalNeeded) {
      shortages.push({
        name: comp.name || invItem?.name || comp.sku,
        sku: comp.sku,
        needed: totalNeeded,
        available
      });
    }
  }

  return {
    isFulfillable: shortages.length === 0,
    shortages
  };
}
