import {triggerSortCommandExpectSuccess} from '../../triggerSortCommandExpectSucccess';

import {afterEach} from 'mocha';
import {closeActiveEditor} from '../../textEditorUtils';

suite('Sort number or strings', function() {
  afterEach(async () => {
    await closeActiveEditor();
  });

  test('should sort numbers', async function() {
    await triggerSortCommandExpectSuccess('extension.sortJsonArrayAscending', [100, 1, 99], [1, 99, 100]);
  });

  test('should sort strings', async function() {
    await triggerSortCommandExpectSuccess('extension.sortJsonArrayAscending', ['foo', 'bar', 'car'], ['bar', 'car', 'foo']);
  });
});
