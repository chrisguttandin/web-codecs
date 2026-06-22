import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    test: {
        bail: 1,
        browser: {
            enabled: true,
            instances: [
                {
                    browser: 'chrome',
                    headless: true,
                    name: 'Chrome Canary',
                    provider: webdriverio({
                        capabilities: {
                            'goog:chromeOptions': {
                                args: ['--disable-features=SymphoniaAudioDecoding', '--disable-features=SymphoniaMp3Decoding'],
                                binary: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
                            }
                        }
                    })
                }
            ]
        },
        dir: 'test/integration/',
        include: ['**/*.js'],
        watch: false
    }
});
