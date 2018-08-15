import { EconomicPump, ModelsInfo } from 'src/services/data.service';

export type Company = 'gd' | 'pre' | 'kkg' | 'mat' | 'mst';

export const kFlightDepartureTimes = [
  '10:00',
  '12:00',
  '15:30',
  '17:30',
  '20:30',
  '22:30',
];

export function getCost(pump: EconomicPump, resource: string): number {
  return (pump.resources[resource] || 0) * (pump.is_income ? 1 : -1);
}

export function getTotalCost(pumps: EconomicPump[], resource: string): number {
  return pumps
    .map((pump) => getCost(pump, resource))
    .reduce((a, b) => a + b, 0);
}

export const kCompanyCodeToHumanReadableName = new Map<Company, string>([
  ['gd', 'Гугл Дисней'],
  ['mat', 'Мицубиси АвтоВАЗ Технолоджи'],
  ['mst', 'МарсСтройТрест'],
  ['pre', 'Пони Роскосмос Экспресс'],
  ['kkg', 'Красный Крест Генетикс'],
]);

export function companyCodes(): string[] {
  return Array.from(kCompanyCodeToHumanReadableName.keys());
}

export interface VolumeWeightInfo {
  totalVolume: number;
  maxVolume: number;
  totalWeight: number;
}

export function getVolumeWeightInfo(modelsInfo: ModelsInfo) {
  const result: VolumeWeightInfo = {
    totalVolume: 0,
    maxVolume: 0,
    totalWeight: 0,
  };

  for (const model of modelsInfo.models) {
    for (const node of model.nodes) {
      if (node.status_code == 'reserved_by_you') {
        if (model.node_type_code == 'hull')
          result.maxVolume = model.params.volume;
        else
          result.totalVolume += model.params.volume;
      }

      result.totalWeight += model.params.weight;
    }
  }

  for (const luggage of modelsInfo.luggage) {
    result.totalVolume += luggage.amount * luggage.volume;
    result.totalWeight += luggage.amount * luggage.weight;
  }

  result.maxVolume = Math.round(result.maxVolume);
  result.totalVolume = Math.round(result.totalVolume);
  result.totalWeight = Math.round(result.totalWeight);

  return result;
}
