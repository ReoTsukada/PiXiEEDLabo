import type { ReactNode } from 'react';

interface EditorShellProps {
  toolbar: ReactNode;
  viewport: ReactNode;
  statusBar: ReactNode;
}

export function EditorShell({ toolbar, viewport, statusBar }: EditorShellProps) {
  return (
    <div className="editor-shell">
      <aside className="editor-shell__toolbar">{toolbar}</aside>
      <main className="editor-shell__viewport">{viewport}</main>
      <footer className="editor-shell__status">{statusBar}</footer>
    </div>
  );
}
