import { execSync } from 'child_process';

export function takeScreenshot(name: string): void {
  const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  try {
    if (process.env.CI != null) {
      if (process.platform === 'linux') {
        const cmd = `xwd -display :99 -root -silent | convert xwd:- png:/tmp/vscode_sort_json_${safeName}.png`;
        console.log(`Executing screenshot command: ${cmd}`);
        const stdout = execSync(cmd, { stdio: 'pipe' });
        console.log(`Screenshot command stdout: ${stdout.toString()}`);
      } else if (process.platform === 'win32') {
        const psScript = `
$code = '[DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);';
Add-Type -MemberDefinition $code -Name Win32 -Namespace Native;
$proc = Get-Process Code* -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1;
if ($proc) { [Native.Win32]::SetForegroundWindow($proc.MainWindowHandle) | Out-Null; Start-Sleep -Milliseconds 500; }
Add-Type -AssemblyName System.Windows.Forms;
Add-Type -AssemblyName System.Drawing;
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds;
$bmp = New-Object System.Drawing.Bitmap $bounds.width, $bounds.height;
$graphics = [System.Drawing.Graphics]::FromImage($bmp);
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.size);
$p = Join-Path $env:TEMP 'vscode_sort_json_${safeName}.png';
$bmp.Save($p);
$graphics.Dispose();
$bmp.Dispose();
`.replace(/\n/g, ' ');
        console.log(`Executing Windows screenshot command...`);
        const stdout = execSync(`powershell -Command "${psScript}"`, { stdio: 'pipe' });
        console.log(`Screenshot command stdout: ${stdout.toString()}`);
      }
    } else {
      const cmd = `xfce4-screenshooter -f -s /tmp/vscode_sort_json_${safeName}.png`;
      console.log(`Executing local screenshot command: ${cmd}`);
      const stdout = execSync(cmd, { stdio: 'pipe' });
      console.log(`Screenshot command stdout: ${stdout.toString()}`);
    }
  } catch (e: unknown) {
    console.error(`Screenshot command failed!`);
    if (e instanceof Error) {
      console.error(`Error message: ${e.message}`);
      if ('status' in e) console.error(`Status (exit code): ${e.status}`);
      if ('stdout' in e && e.stdout != null) console.error(`stdout: ${e.stdout.toString()}`);
      if ('stderr' in e && e.stderr != null) console.error(`stderr: ${e.stderr.toString()}`);
    } else {
      console.error(`Unknown error: ${String(e)}`);
    }
  }
}
