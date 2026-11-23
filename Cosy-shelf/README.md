# Уютная Полка

Казуальная HTML5-игра для Яндекс.Игр. Стек: Phaser 3 + TypeScript + Vite, портрет 720×1280.

## Команды

```bash
npm i
npm run dev
npm run build
```

## Архитектура

- `src/platform/` — `PlatformGateway` и адаптеры (mock / yandex). Сцены не ходят в SDK напрямую.
- `src/systems/` — скелеты Economy, Save, Progression, Analytics, Ads, RemoteConfig, LevelManager.
- `src/scenes/` — Boot → Preload → Menu → Game (+ параллельный HUD) → GameOver.
- `src/ui/` — пустая, компоненты появятся позже.
- `src/data/` — remote-config fallback и будущие JSON-паки уровней/декора.
