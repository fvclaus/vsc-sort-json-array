export function undent(strings: TemplateStringsArray): string {
  if (strings.length > 1) {
    throw new Error(`Don't expect this`);
  }

  // Split into lines and remove empty ones at the start and end
  const lines = strings[0].split('\n').filter((line, i, allLines) => {
    const isFirstOrLastLine = i == 0 || i == allLines.length - 1;
    // Empty lines are created when opening and/or closing backticks are on seperate line
    if (isFirstOrLastLine && line.trim() == '') {
      return false;
    }
    return true;
  });

  // Find the minimum indentation
  const minIndent = Math.min(...lines
    .filter(line => line.trim() !== '')
    .map(line => {
      const match = line.match(/^\s*/);
      if (match == null) {
        return 0;
      }
      const group = match[0];
      return group.length;
    })
  );

  // Remove the minimum indentation from all lines
  return lines.map(line => line.slice(minIndent)).join('\n');
}
