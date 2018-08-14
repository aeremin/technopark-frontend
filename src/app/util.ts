import { EconomicPump } from 'src/services/data.service';

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

export const kCompanyCodeToHumanReadableName = new Map<string, string>([
  ['gd', 'Гугл Дисней'],
  ['mat', 'Мицубиси АвтоВАЗ Технолоджи'],
  ['mst', 'МарсСтройТрест'],
  ['pre', 'Пони Роскосмос Экспресс'],
  ['kkg', 'Красный Крест Генетикс'],
]);

export function companyCodes(): string[] {
  return Array.from(kCompanyCodeToHumanReadableName.keys());
}
