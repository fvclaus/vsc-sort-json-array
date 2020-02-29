const SOME_CONSTANT = 2;


function someOtherFunction (a: any) {

}

export function sort(a: any): number {
    someOtherFunction(SOME_CONSTANT);
    return -1;
}