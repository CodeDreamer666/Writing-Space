export type StyledRun = {
  text: string;
  bold: boolean;
  italic: boolean;
};

export type ContentBlock = {
  kind: "paragraph" | "heading" | "list" | "blockquote";
  level?: number;
  marker?: string;
  runs: StyledRun[];
};
