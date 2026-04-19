import {
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
  jest,
} from '@jest/globals';
import {
  registerRenderer,
  unregisterRenderer,
  installPlugin,
  uninstallPlugin,
  getGlobalRenderers,
  clearPluginRegistry,
} from '../plugins';

describe('plugin registry', () => {
  beforeEach(() => clearPluginRegistry());
  afterAll(() => clearPluginRegistry());

  it('registers and unregisters a renderer', () => {
    const r = () => null;
    registerRenderer('my-tag', r);
    expect(getGlobalRenderers()['my-tag']).toBe(r);
    unregisterRenderer('my-tag');
    expect(getGlobalRenderers()['my-tag']).toBeUndefined();
  });

  it('installs and uninstalls a plugin with renderers', () => {
    const setup = jest.fn();
    const teardown = jest.fn();
    installPlugin({
      name: 'demo',
      renderers: { widget: () => null },
      setup,
      teardown,
    });
    expect(setup).toHaveBeenCalledTimes(1);
    expect(getGlobalRenderers().widget).toBeDefined();

    uninstallPlugin('demo');
    expect(teardown).toHaveBeenCalledTimes(1);
    expect(getGlobalRenderers().widget).toBeUndefined();
  });

  it('skips duplicate plugin names', () => {
    const setup = jest.fn();
    installPlugin({ name: 'dup', setup });
    installPlugin({ name: 'dup', setup });
    expect(setup).toHaveBeenCalledTimes(1);
  });
});
