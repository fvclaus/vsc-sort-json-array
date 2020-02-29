import chai = require('chai');
const expect = chai.expect;
import openNewJsonDocument from './openNewJsonDocument';
import stringify from './stringify';
import { searchEnclosingArray } from '../../searchEnclosingArray';
import * as vscode from 'vscode'
import nextTick from '../nextTick';

suite('Find enclosing array', () => {

    const positionCursorAtText = async (document: vscode.TextDocument, editor: vscode.TextEditor, text: string) =>  {
        const offset = document.getText().indexOf(text)
        const position = document.positionAt(offset)
        editor.selection = new vscode.Selection(position, position);
        await nextTick()
        return position
    }

    [
        [
            [{
                id: 1
            }, {
                id: 2
            }, {
                id: 3
            }
            ], '"id": 1'],
        [
            [
                {
                    id: 1,
                    array: [1, 2, 3]
                },
                {
                    id: 2,
                    array: [1, 2, 3]
                }
            ], '"id": 2'
        ],
        [
            [
                "1",
                "2",
                "3"
            ], '"2"'],
        [
            [
                "foo",
                "bar"
            ], '"bar"'
        ],
        [
            [
                [
                    {
                        id: 1,
                        array: ["foo", "bar"]
                    },
                    {
                        id: 2,
                    }
                ]
            ], '"foo"', new vscode.Position(4, 15), new vscode.Position(7, 7)
        ]
    ].forEach(([array, textAtPosition, expectedStart, expectedEnd]) => {
        const content = stringify(array)
        test(`should find enclosing root array ${content}`, async () => {
            const {
                document,
                editor
            } = await openNewJsonDocument(content);
            const position = await positionCursorAtText(document, editor, textAtPosition as string)
            const enclosingArray = await searchEnclosingArray(document, new vscode.Selection(position, position))
            expect(enclosingArray.start).to.deep.equal(expectedStart? expectedStart : new vscode.Position(0, 0))
            expect(enclosingArray.end).to.deep.equal(expectedEnd? expectedEnd : document.lineAt(document.lineCount - 1).range.end)
        });
    });
})