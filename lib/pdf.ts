export type PdfBlock =
  | { kind: "text"; text: string; size?: number; bold?: boolean; muted?: boolean }
  | { kind: "row"; cells: string[]; widths: number[]; bold?: boolean; repeat?: boolean }
  | { kind: "rule" }
  | { kind: "gap"; height: number }

type PdfOptions = {
  title: string
  footer: (page: number, pages: number) => string
}

const width = 595
const height = 842
const margin = 56
const rowSize = 9.5

function clean(text: string) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\xFF]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
}

function wrap(text: string, size: number, room: number) {
  const most = Math.max(1, Math.floor(room / (size * 0.5)))
  const lines: string[] = []
  let line = ""

  for (const word of text.split(" ")) {
    if (line && `${line} ${word}`.length > most) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }

  return [...lines, line]
}

function fit(text: string, room: number) {
  const most = Math.max(1, Math.floor(room / (rowSize * 0.5)))
  return text.length > most ? `${text.slice(0, most - 1)}.` : text
}

function write(x: number, y: number, text: string, size: number, bold = false, muted = false) {
  const colour = muted ? "0.4 0.4 0.45 rg" : "0.12 0.11 0.18 rg"
  return `${colour} BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y.toFixed(1)} Td (${clean(text)}) Tj ET`
}

export function renderPdf(blocks: PdfBlock[], { title, footer }: PdfOptions) {
  const pages: string[][] = [[]]
  let y = height - margin
  let header: Extract<PdfBlock, { kind: "row" }> | null = null

  const draw = (operation: string) => pages[pages.length - 1].push(operation)

  function drawRow(row: Extract<PdfBlock, { kind: "row" }>) {
    y -= rowSize * 1.9
    let x = margin
    row.cells.forEach((cell, index) => {
      draw(write(x, y, fit(cell, row.widths[index] - 8), rowSize, row.bold))
      x += row.widths[index]
    })
  }

  function room(needed: number) {
    if (y - needed >= margin + 20) return false
    pages.push([])
    y = height - margin
    return true
  }

  for (const block of blocks) {
    if (block.kind === "gap") {
      y -= block.height
    } else if (block.kind === "rule") {
      room(12)
      y -= 6
      draw(`0.8 0.8 0.84 RG 0.75 w ${margin} ${y.toFixed(1)} m ${width - margin} ${y.toFixed(1)} l S`)
      y -= 6
    } else if (block.kind === "row") {
      if (room(rowSize * 2) && header && !block.repeat) drawRow(header)
      if (block.repeat) header = block
      drawRow(block)
    } else {
      header = null
      const size = block.size ?? 10
      for (const line of wrap(block.text, size, width - margin * 2)) {
        room(size * 1.5)
        y -= size * 1.5
        draw(write(margin, y, line, size, block.bold, block.muted))
      }
    }
  }

  const fonts = ["Helvetica", "Helvetica-Bold"]
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${4 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /${fonts[0]} /Encoding /WinAnsiEncoding >>`,
  ]
  const boldFont = 4 + pages.length * 2

  pages.forEach((operations, index) => {
    const stream = [...operations, write(margin, margin - 20, footer(index + 1, pages.length), 8, false, true)].join("\n")
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 ${boldFont} 0 R >> >> /Contents ${5 + index * 2} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    )
  })
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /${fonts[1]} /Encoding /WinAnsiEncoding >>`)
  objects.push(`<< /Title (${clean(title)}) /Producer (Signet) >>`)

  let body = "%PDF-1.4\n"
  const offsets = objects.map((object, index) => {
    const offset = body.length
    body += `${index + 1} 0 obj\n${object}\nendobj\n`
    return offset
  })
  const xref = body.length
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  body += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF\n`

  return Uint8Array.from(body, (character) => character.charCodeAt(0))
}
