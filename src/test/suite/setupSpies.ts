import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

const showErrorMessageSpy = sinon.spy(vscode.window, 'showErrorMessage');

export function setupSpies(): {showErrorMessageSpy: typeof showErrorMessageSpy} {
  showErrorMessageSpy.resetHistory();
  return {
    showErrorMessageSpy
  }
}

export function expectZeroInvocations(spy: sinon.SinonSpy): void {
  expect(spy.callCount).to.be.equal(0, spy.printf(`Expected %n to be called 0 times, but was called %c times: %C`));
}
