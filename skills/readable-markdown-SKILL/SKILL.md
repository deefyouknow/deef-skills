---
name: readable-markdown
description: Use this skill whenever the user wants a Markdown (.md) file reformatted, cleaned up, or organized so it reads well as RAW PLAIN TEXT — i.e. opened in a code editor or terminal, never rendered. Trigger this any time the user calls a .md file "messy," "รก," "hard to read," "cluttered," or asks to "format markdown," "clean up this doc," "organize this spec file," "make this .md more readable," even if they don't use the word "skill." Especially relevant for project docs, spec files, and notes with technical content (pin lists, config blocks, constants). Do NOT use this for content meant to be viewed with a Markdown renderer/preview — that's a different problem and this skill's rules would be wrong for it.
---

# Readable Markdown (Raw-Text-First Formatting)

## Core principle

Optimize for a human reading the **raw `.md` file directly** — no preview, no
renderer. Markdown syntax here is used only insofar as it helps the eye
parse structure on a plain-text screen (indentation, dashes, spacing), not
because it will render nicely somewhere else. If a piece of syntax only pays
off when rendered (e.g. long pipe tables, heavy emphasis stacking), it is a
liability here, not a feature.

## Non-negotiable: never destroy content

This is a **structural reformat only**. Every fact, number, name, code
block, pin mapping, wording, and value in the original must survive unchanged and in
the same logical place. When in doubt, preserve wording exactly and only touch spacing/structure/markup. **Do not alter the user's specific vocabulary, variables, or project goals.**

## Workflow

1. **Read the original file fully** before making any changes. Do not
   skim — technical spec files often hide the important details in dense
   paragraphs that are easy to miss.
2. **Never edit or overwrite the original file.** Always write the
   reformatted result to a **new file in the same directory**, named:
   `<original-stem>.formatted.md` (e.g. `spec.md` → `spec.formatted.md`).
   If that name is already taken, append `-2`, `-3`, etc.
3. Apply the formatting rules below to the copy.
4. Run through the verification checklist before presenting the result.
5. Tell the user exactly what you did — original path, new path, and a
   short bullet list of *structural* changes only (not a content summary).
   Make clear they should review and manually copy it over the original
   themselves if it checks out — don't do that step for them.

## Formatting rules

- **Vertical spacing & Grouping**: Keep related concepts and list items visually grouped. **Do NOT add unnecessary blank lines** between bullet points or tightly related lines. Keep lists compact. Use a maximum of **one** blank line to separate distinct paragraphs, code blocks, or main sub-sections. Avoid excessive vertical spacing so the reader doesn't lose context.

- **Paragraphs**: Maintain logical paragraphs. Do not break a single thought or explanation into overly fragmented lines. Let related sentences stay together as a solid block of text.

- **Headings** (`#`, `##`, `###`): keep short and single-line. If a heading
  is a full sentence or wraps past ~70 characters in an editor, shorten it
  and push detail into the body below it.

- **Nested lists**: use `-` for top level and indent two spaces per level
  (`  -`, `    -`) so the hierarchy is visible purely from indentation —
  don't rely on the reader mentally rendering it. For a lightly-nested
  parent/child relationship the source style of `- -` as a visual sub-bullet
  marker is also acceptable if that's what the author already uses
  elsewhere in the doc — match existing convention over imposing a new one.

- **Section separators**: use a bare `---` on its own line between major
  sections so the eye can jump between blocks without reading every line.
  Don't overuse it inside a single section — it should mark real section
  boundaries, not every paragraph break.

- **Tables**: pipe-table syntax (`| a | b |` / `|---|---|`) is hard to scan
  as raw text once it wraps or has more than ~3 short columns — it turns
  into a wall of dashes and pipes. For simple key/value or 2-column data,
  convert to a plain list instead:
•	INA219 pin issue      -> fixed, see 1.2
•	Section 3 empty       -> draft written, needs file edit
•	Typo TRICKER/TRCIKER  -> still open


Keep an existing pipe table as-is only if it's genuinely tabular/dense
data (many rows, uniform short columns) where a list would actually be
*less* scannable — use judgment, don't convert reflexively.

- **Match the author's existing technical style** rather than imposing a
generic one. If the doc already uses patterns like:
- `#define`-style constant blocks
- inline `//` or `#` comments next to values
- plain-text connection/pin lists such as `NAME[SCL,SDA] -> BOARD[GPIO22,GPIO21]`
- custom variables starting with `%` (e.g. `%BH1750FVI_TRICKER`)

keep using those patterns for new/reformatted content of the same kind,
rather than converting them into something more "Markdown-native" like
tables or definition lists.

- **Line length**: wrap prose so lines stay roughly within 80–100 columns.
Long unwrapped paragraphs are the single biggest raw-text readability
killer — an editor will either wrap them awkwardly or force horizontal
scrolling. (Note: wrapping lines should NOT mean adding blank empty lines between them).

- **No render-only decoration**: avoid bold/italic/emoji used purely for
visual flair — in raw text `**bold**` and `*italic*` just add asterisk
clutter around the word. Reserve emphasis markup for cases where it
genuinely helps raw-text scanning (e.g. flagging a single warning word),
not general decoration.

## Verification checklist (before writing the output file)

- [ ] Every fact, number, name, wording, and code block from the original is present
    and unchanged in the reformatted version.
- [ ] Section order matches the original unless reordering was explicitly requested.
- [ ] List items are compact without excessive blank lines between them.
- [ ] Nothing was summarized, shortened, or paraphrased — only restructured.
- [ ] The original file is untouched; output went to a new `.formatted.md`
    file in the same directory.

## What to tell the user afterward

Report, briefly:
- original file path
- new file path
- a short structural-changes-only list (e.g. "converted the 2-column
status table to a list," "added `---` separators between the 3 major
sections," "shortened 2 headings that wrapped")

Do not summarize the *content* of the file back to them — they already
know what's in it. Let them diff the two files and copy the new one over
the original themselves if they're happy with it.
