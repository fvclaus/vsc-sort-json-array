import {afterEach} from 'mocha';

import {closeActiveEditor} from './textEditorUtils';
import { triggerSortExpectFailure } from './triggerSortExpectFailure';
import { triggerSortJsonExpectSuccess } from './triggerSortExpectSuccess';


suite('Extension Test Suite', function() {
  afterEach(async () => {
    await closeActiveEditor();
  });

  test('Invalid json', async function() {
    await triggerSortExpectFailure('[\'foo, 2, 3]', /Cannot parse selection as JSON array. Reason: no viable alternative at input '\['/)
  });

  test('Valid json', async function() {
    await triggerSortJsonExpectSuccess(
      'extension.sortJsonArrayAscending',
      [
        {
          id: 3,
        }, {
          id: 4,
        }, {
          id: 1,
        }
      ], 
      [{id: 1}, {id: 3}, {id: 4}]);
  });
});
