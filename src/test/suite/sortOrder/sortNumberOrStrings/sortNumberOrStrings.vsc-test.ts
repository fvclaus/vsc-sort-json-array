import {triggerSortCommandExpectSuccess} from '../../triggerSortCommandExpectSucccess';

import * as vscode from 'vscode';

import {afterEach} from 'mocha';
import {closeActiveEditor} from '../../textEditorUtils';
import { ExtensionConfiguration } from '../../../../sortOrder';

async function updateConfiguration(expectedConfiguration: ExtensionConfiguration): Promise<void> {
  const actualConfiguration = vscode.workspace.getConfiguration("sortJsonArray.collation");
  await actualConfiguration.update("locales", expectedConfiguration.collation.locales);
  await actualConfiguration.update("caseFirst", expectedConfiguration.collation.caseFirst);
  await actualConfiguration.update("ignorePunctuation", expectedConfiguration.collation.ignorePunctuation);
  await actualConfiguration.update("numeric", expectedConfiguration.collation.numeric);
}

suite('Sort number or strings', function() {
  afterEach(async () => {
    await closeActiveEditor();
    await updateConfiguration({
      collation: {
        locales: [],
        ignorePunctuation: false,
        numeric: false,
        caseFirst: "false"
      }
    })
  });

  test('should sort numbers', async function() {
    await triggerSortCommandExpectSuccess('extension.sortJsonArrayAscending', [100, 1, 99], [1, 99, 100]);
  });

  test('should sort strings', async function() {
    await triggerSortCommandExpectSuccess('extension.sortJsonArrayAscending', ['foo', 'bar', 'car'], ['bar', 'car', 'foo']);
  });

  test('should sort strings using Intl.Collator', async function() {
    await updateConfiguration({
      collation: {
        caseFirst: "upper",
        numeric: true,
        ignorePunctuation: true,
        locales: ["da"]
      }
    })
    await triggerSortCommandExpectSuccess('extension.sortJsonArrayAscending', [
      "'Bar'",
      "1",
      "10",
      "2",
      "bar",
      "bar",
      "Bar",
      "foo",
      "Foo",
      "ö",
      "y"
    ], ["1", "2", "10", "'Bar'", "Bar", "bar", "bar", "Foo", "foo", "y", "ö"]);
  });

});
