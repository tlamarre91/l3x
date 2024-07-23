import React, { useRef, useState } from "react";

import { TextArea } from "@radix-ui/themes";

export interface CodeEditorProps {
  onCommit: (code: string) => void;
  onExit: () => void;
  code: string;
}

export default function CodeEditor({
  onCommit,
  onExit,
  code
}: CodeEditorProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null!);

  const onClickCommit = () => {
    const newCode = textAreaRef.current.value;
    onCommit(newCode);
  };

  return (
    <div>
      <button onClick={onClickCommit}>commit</button>
      <button onClick={onExit}>discard</button>
      <TextArea
        style={{
          height: "30rem",
          fontFamily: "monospace"
        }}
        ref={textAreaRef}
        defaultValue={code}
        size="3"
        spellCheck={false}
      />
    </div>
  );
}

