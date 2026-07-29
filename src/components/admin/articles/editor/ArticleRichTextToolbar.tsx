import {
  BetweenHorizonalStart,
  BetweenVerticalStart,
  Bold,
  Heading2,
  Image,
  Italic,
  Link2,
  List,
  Quote,
  Table,
  TableCellsMerge,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type ArticleRichTextToolbarProps = {
  editorRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
};

type ToolbarAction = {
  label: string;
  icon: React.ReactNode;
  command: string;
  value?: string;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: "Bold", icon: <Bold className="size-4" />, command: "bold" },
  { label: "Italic", icon: <Italic className="size-4" />, command: "italic" },
  { label: "Heading 2", icon: <Heading2 className="size-4" />, command: "formatBlock", value: "h2" },
  { label: "Bullet list", icon: <List className="size-4" />, command: "insertUnorderedList" },
  { label: "Quote", icon: <Quote className="size-4" />, command: "formatBlock", value: "blockquote" },
  { label: "Link", icon: <Link2 className="size-4" />, command: "createLink" },
  { label: "Image", icon: <Image className="size-4" />, command: "insertImage" },
];

type TableAction = {
  label: string;
  icon: React.ReactNode;
  run: (editor: HTMLDivElement) => void;
};

function notifyEditorChange(editor: HTMLDivElement) {
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

function getClosestCell(): HTMLTableCellElement | null {
  const selection = window.getSelection();
  if (!selection?.anchorNode) return null;
  const node =
    selection.anchorNode instanceof Element
      ? selection.anchorNode
      : selection.anchorNode.parentElement;
  return node?.closest("td, th") ?? null;
}

function getClosestTable(): HTMLTableElement | null {
  return getClosestCell()?.closest("table") ?? null;
}

function getClosestRow(): HTMLTableRowElement | null {
  return getClosestCell()?.closest("tr") ?? null;
}

function columnCount(row: HTMLTableRowElement): number {
  return Array.from(row.cells).reduce((sum, cell) => sum + (cell.colSpan || 1), 0);
}

function createCell(tag: "td" | "th", text = ""): HTMLTableCellElement {
  const cell = document.createElement(tag);
  cell.textContent = text;
  return cell;
}

function insertTableHtml(rows: number, cols: number) {
  const safeRows = Math.max(1, Math.min(20, rows));
  const safeCols = Math.max(1, Math.min(10, cols));

  let html = "<table><thead><tr>";
  for (let col = 0; col < safeCols; col += 1) {
    html += `<th>Header ${col + 1}</th>`;
  }
  html += "</tr></thead><tbody>";

  for (let row = 1; row < safeRows; row += 1) {
    html += "<tr>";
    for (let col = 0; col < safeCols; col += 1) {
      html += "<td>&nbsp;</td>";
    }
    html += "</tr>";
  }

  html += "</tbody></table><p><br></p>";
  document.execCommand("insertHTML", false, html);
}

function insertTable(editor: HTMLDivElement) {
  const rowsRaw = window.prompt("Number of rows (including header)", "3");
  if (rowsRaw == null) return;
  const colsRaw = window.prompt("Number of columns", "3");
  if (colsRaw == null) return;

  const rows = Number.parseInt(rowsRaw, 10);
  const cols = Number.parseInt(colsRaw, 10);
  if (!Number.isFinite(rows) || !Number.isFinite(cols) || rows < 1 || cols < 1) {
    window.alert("Enter valid row and column counts.");
    return;
  }

  editor.focus();
  insertTableHtml(rows, cols);
  notifyEditorChange(editor);
}

function addRow(editor: HTMLDivElement, position: "above" | "below") {
  const row = getClosestRow();
  const cell = getClosestCell();
  if (!row || !cell) {
    window.alert("Place the cursor inside a table cell first.");
    return;
  }

  const cols = columnCount(row);
  const next = document.createElement("tr");
  for (let i = 0; i < cols; i += 1) {
    next.appendChild(createCell("td", ""));
  }

  if (position === "above") {
    row.parentElement?.insertBefore(next, row);
  } else {
    row.after(next);
  }

  notifyEditorChange(editor);
}

function addColumn(editor: HTMLDivElement, position: "left" | "right") {
  const table = getClosestTable();
  const cell = getClosestCell();
  const row = getClosestRow();
  if (!table || !cell || !row) {
    window.alert("Place the cursor inside a table cell first.");
    return;
  }

  const index = Array.from(row.cells).indexOf(cell);
  if (index < 0) return;

  const insertAt = position === "left" ? index : index + 1;

  Array.from(table.rows).forEach((tableRow) => {
    const isHeader =
      tableRow.parentElement?.tagName === "THEAD" ||
      Array.from(tableRow.cells).some((c) => c.tagName === "TH");
    const newCell = createCell(isHeader ? "th" : "td", isHeader ? "Header" : "");
    const reference = tableRow.cells[insertAt] ?? null;
    if (reference) {
      tableRow.insertBefore(newCell, reference);
    } else {
      tableRow.appendChild(newCell);
    }
  });

  notifyEditorChange(editor);
}

function deleteRow(editor: HTMLDivElement) {
  const row = getClosestRow();
  const table = getClosestTable();
  if (!row || !table) {
    window.alert("Place the cursor inside a table cell first.");
    return;
  }

  if (table.rows.length <= 1) {
    table.remove();
  } else {
    row.remove();
  }

  notifyEditorChange(editor);
}

function deleteColumn(editor: HTMLDivElement) {
  const table = getClosestTable();
  const cell = getClosestCell();
  const row = getClosestRow();
  if (!table || !cell || !row) {
    window.alert("Place the cursor inside a table cell first.");
    return;
  }

  const index = Array.from(row.cells).indexOf(cell);
  if (index < 0) return;

  const onlyOneColumn = Array.from(table.rows).every((tableRow) => tableRow.cells.length <= 1);
  if (onlyOneColumn) {
    table.remove();
    notifyEditorChange(editor);
    return;
  }

  Array.from(table.rows).forEach((tableRow) => {
    if (tableRow.cells[index]) {
      tableRow.deleteCell(index);
    }
  });

  notifyEditorChange(editor);
}

function deleteTable(editor: HTMLDivElement) {
  const table = getClosestTable();
  if (!table) {
    window.alert("Place the cursor inside a table first.");
    return;
  }
  table.remove();
  notifyEditorChange(editor);
}

const TABLE_ACTIONS: TableAction[] = [
  {
    label: "Insert table",
    icon: <Table className="size-4" />,
    run: insertTable,
  },
  {
    label: "Add row below",
    icon: <BetweenHorizonalStart className="size-4" />,
    run: (editor) => addRow(editor, "below"),
  },
  {
    label: "Add column right",
    icon: <BetweenVerticalStart className="size-4" />,
    run: (editor) => addColumn(editor, "right"),
  },
  {
    label: "Delete row",
    icon: <TableCellsMerge className="size-4 rotate-90" />,
    run: deleteRow,
  },
  {
    label: "Delete column",
    icon: <TableCellsMerge className="size-4" />,
    run: deleteColumn,
  },
  {
    label: "Delete table",
    icon: <Trash2 className="size-4" />,
    run: deleteTable,
  },
];

export function ArticleRichTextToolbar({ editorRef, className }: ArticleRichTextToolbarProps) {
  const runCommand = (action: ToolbarAction) => {
    editorRef.current?.focus();
    if (action.command === "createLink") {
      const url = window.prompt("Enter URL");
      if (url) document.execCommand(action.command, false, url);
      return;
    }
    if (action.command === "insertImage") {
      const url = window.prompt("Enter image URL");
      if (url) document.execCommand(action.command, false, url);
      return;
    }
    document.execCommand(action.command, false, action.value);
  };

  const runTableAction = (action: TableAction) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    action.run(editor);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 border-b border-admin-input-border px-3 py-2 sm:px-4",
        className,
      )}
      role="toolbar"
      aria-label="Formatting"
    >
      {TOOLBAR_ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          title={action.label}
          aria-label={action.label}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand(action)}
          className="inline-flex size-8 items-center justify-center rounded-md text-admin-heading transition-colors hover:bg-muted"
        >
          {action.icon}
        </button>
      ))}

      <span className="mx-1 hidden h-5 w-px bg-admin-input-border sm:block" aria-hidden />

      {TABLE_ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          title={action.label}
          aria-label={action.label}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runTableAction(action)}
          className="inline-flex size-8 items-center justify-center rounded-md text-admin-heading transition-colors hover:bg-muted"
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
