import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        bail: 1,
        browser: { enabled: true, instances: [{ browser: 'firefox', headless: true, name: 'Firefox', provider: webdriverio() }] },
        dir: 'test/expectation/firefox/current/',
        include: ['**/*.js'],
        setupFiles: ['config/vitest/expectation-firefox-current-setup.ts'],
        watch: false
    }
});
