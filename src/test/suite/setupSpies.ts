import { expect } from 'chai';
import { URLSearchParams } from 'node:url';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

const showErrorMessageSpy = sinon.stub(vscode.window, 'showErrorMessage').resolves(Promise.resolve('Open GitHub Issue') as any);

const openExternalSpy = sinon.spy(vscode.env, 'openExternal');

export function setupSpies(): {showErrorMessageSpy: typeof showErrorMessageSpy, openExternalSpy: typeof openExternalSpy} {
  showErrorMessageSpy.resetHistory();
  openExternalSpy.resetHistory();
  return {
    showErrorMessageSpy,
    openExternalSpy
  }
}

export async function expectErrorMessage(msg: RegExp): Promise<void> {
  expect(showErrorMessageSpy.called, 'Expected vscode.window.showErrorMessage to be called').to.be.true;
  const lastArg = showErrorMessageSpy.lastCall.args[0];
  expect(lastArg).to.satisfy((actualErrorMessage: string) => msg.test(actualErrorMessage), `${lastArg} does not match ${msg}`);
  const timeout = 5000;
  const interval = 10;
  const startTime = Date.now();
  // The extension needs some time to read the package.json
  while (!openExternalSpy.called && (Date.now() - startTime) < timeout) {
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  expect(openExternalSpy.called, `Expected vscode.env.openExternal to be called within ${timeout}ms`).to.be.true;
  const calledUri = openExternalSpy.firstCall.args[0] as vscode.Uri;
  const queryParams = new URLSearchParams(calledUri.query);

  expect(queryParams.has('title'), 'Expected queryParams to have key "title"').to.be.true;
  const title = queryParams.get('title');
  expect(title).to.match(msg);

  expect(queryParams.has('body'), 'Expected queryParams to have key "body"').to.be.true;

  const expectedBaseUrl = 'https://github.com/fvclaus/vsc-sort-json-array/issues/new'
  expect(calledUri.toString(true).startsWith(expectedBaseUrl), `Expected URL "${calledUri.toString(true)}" to start with "${expectedBaseUrl}"`).to.be.true;
}


export function expectZeroInvocations(spy: sinon.SinonSpy): void {
  expect(spy.callCount).to.be.equal(0, spy.printf(`Expected %n to be called 0 times, but was called %c times: %C`));
}
