import {sleep} from './sleep';

export default async function nextTick(time = 100): Promise<void> {
  // This is the time vscode needs to update the document/editor
  // It is an experimental value
  return sleep(time);
}
