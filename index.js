// Точка входа временного расширения «Дудл Джамп». Отдельная сборка той же оболочки
// STGames с единственной зарегистрированной игрой: нужна, чтобы обкатать прыгуна на
// телефоне и на компьютере, не выкатывая обновление основного расширения.
//
// Всё, что могло бы столкнуться с установленным STGames, переименовано: ключ настроек
// (DoodleJumpST), id кнопки в wand-меню, слэш-команда хаба (/djtest) и id блоков в
// панели настроек.

import { getCtx, getEventTypes } from './src/ctx.js';
import { logError, logInfo } from './src/log.js';
import { register } from './src/registry.js';
import doodlejumpGame from './src/games/doodlejump/index.js';
import { initSettingsUI } from './src/shell/settings-ui.js';
import { initSlashCommands, initWandButton } from './src/shell/launcher.js';
import { refresh } from './src/shell/modal.js';

const VERSION = '0.1.0';

// Подсветка и таймер читаются из настроек при каждой отрисовке — открытому окну
// достаточно сказать «перерисуйся».
function onSettingsChanged() {
    try {
        refresh();
    } catch (err) {
        logError('не удалось применить настройки к открытому окну', err);
    }
}

// Панель настроек, кнопка в wand-меню и слэш-команды появляются только после того, как
// ST отрисовал свой интерфейс, — это APP_READY. Если событие уже прошло (или его имени
// нет в этой версии ST), страхуемся отложенной попыткой, чтобы не потерять UI совсем.
function initUI() {
    let done = false;
    const run = async () => {
        if (done) return;
        done = true;

        try {
            await initSettingsUI(onSettingsChanged);
        } catch (err) {
            logError('initSettingsUI упал', err);
        }

        try {
            initWandButton();
        } catch (err) {
            logError('initWandButton упал', err);
        }

        try {
            initSlashCommands();
        } catch (err) {
            logError('initSlashCommands упал', err);
        }
    };

    try {
        const ctx = getCtx();
        const et = getEventTypes(ctx);
        if (et.APP_READY) ctx.eventSource.on(et.APP_READY, run);
    } catch (err) {
        logError('не удалось подписаться на APP_READY', err);
    }

    setTimeout(run, 3000);
}

register(doodlejumpGame);

jQuery(async () => {
    try {
        initUI();
        logInfo(`v${VERSION} загружен`);
    } catch (err) {
        logError('инициализация упала', err);
    }
});
