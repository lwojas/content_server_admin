import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";

const lightTheme = EditorView.theme({
  "&": { color: "#243246", backgroundColor: "#fbfcfe" },
  ".cm-content": { caretColor: "#0e7490" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#0e7490" },
  ".cm-gutters": {
    color: "#8b98a9",
    backgroundColor: "#f4f6f9",
    border: "none",
  },
  ".cm-activeLine": { backgroundColor: "#f5f8fb" },
  ".cm-activeLineGutter": { backgroundColor: "#edf2f6" },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "#c8e7ee !important",
  },
});

export function JsonEditor({ value, onChange, darkMode }) {
  const hostRef = useRef(null);
  const viewRef = useRef(null);
  const valueRef = useRef(value);
  const initialValueRef = useRef(value);
  const initialDarkModeRef = useRef(darkMode);
  const changeListenerRef = useRef(onChange);
  const themeCompartment = useRef(new Compartment());

  useEffect(() => {
    changeListenerRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!hostRef.current) return undefined;

    const view = new EditorView({
      state: EditorState.create({
        doc: initialValueRef.current,
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          json(),
          themeCompartment.current.of(
            initialDarkModeRef.current ? oneDark : lightTheme,
          ),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const nextValue = update.state.doc.toString();
              valueRef.current = nextValue;
              changeListenerRef.current(nextValue);
            }
          }),
        ],
      }),
      parent: hostRef.current,
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || value === valueRef.current) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: themeCompartment.current.reconfigure(
        darkMode ? oneDark : lightTheme,
      ),
    });
  }, [darkMode]);

  return <div className="editor-host" ref={hostRef} />;
}
