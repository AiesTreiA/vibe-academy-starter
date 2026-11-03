/**
 * Utility functions to robustly parse JSON returned by LLM models.
 * Handles markdown code block wrapping, trailing commas, single quotes,
 * and unescaped literal control characters/newlines inside string values.
 */

export function sanitizeJSONString(str: string): string {
  let result = ""
  let inString = false
  let isEscaped = false

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if (inString) {
      if (isEscaped) {
        result += char
        isEscaped = false
      } else if (char === "\\") {
        isEscaped = true
        result += char
      } else if (char === '"') {
        inString = false
        result += char
      } else if (char === "\n") {
        result += "\\n"
      } else if (char === "\r") {
        result += "\\r"
      } else if (char === "\t") {
        result += "\\t"
      } else {
        const code = char.charCodeAt(0)
        if (code < 32) {
          result += `\\u${code.toString(16).padStart(4, "0")}`
        } else {
          result += char
        }
      }
    } else {
      if (char === '"') {
        inString = true
        result += char
      } else {
        result += char
      }
    }
  }

  // Remove trailing commas before closing braces or brackets
  result = result.replace(/,\s*([}\]])/g, "$1")

  return result
}

export function repairTruncatedJSON(rawStr: string): string {
  let str = rawStr.trim()

  // Remove markdown codeblock wrapper if present
  const codeBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    str = codeBlockMatch[1].trim()
  }

  // Find start of JSON object or array
  const firstBrace = str.search(/[\{\[]/)
  if (firstBrace !== -1) {
    str = str.substring(firstBrace)
  }

  const stack: string[] = []
  let inString = false
  let isEscaped = false

  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    if (inString) {
      if (isEscaped) {
        isEscaped = false
      } else if (char === "\\") {
        isEscaped = true
      } else if (char === '"') {
        inString = false
      }
    } else {
      if (char === '"') {
        inString = true
      } else if (char === "{" || char === "[") {
        stack.push(char)
      } else if (char === "}" || char === "]") {
        if (stack.length > 0) {
          const top = stack[stack.length - 1]
          if ((char === "}" && top === "{") || (char === "]" && top === "[")) {
            stack.pop()
          }
        }
      }
    }
  }

  let repaired = str

  // If ended inside a string, close the string
  if (inString) {
    if (repaired.endsWith("\\")) {
      repaired = repaired.slice(0, -1)
    }
    repaired += '"'
  }

  // Clean dangling structural elements outside string
  repaired = repaired.replace(/,\s*$/g, "")
  repaired = repaired.replace(/:\s*$/g, "")
  repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*$/g, "")
  repaired = repaired.replace(/,\s*"[^"]*"$/g, "")

  // Close open brackets and braces in reverse order
  while (stack.length > 0) {
    const open = stack.pop()
    if (open === "{") {
      repaired += "}"
    } else if (open === "[") {
      repaired += "]"
    }
  }

  // Remove trailing commas before closing braces or brackets
  repaired = repaired.replace(/,\s*([}\]])/g, "$1")

  return repaired
}

export function fallbackExtractJSONFields(text: string): Record<string, any> {
  const result: Record<string, any> = {}

  // Extract title
  const titleMatch = text.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/i) || text.match(/"title"\s*:\s*"([^"\n]+)/i)
  if (titleMatch) {
    result.title = titleMatch[1].replace(/\\"/g, '"').replace(/\\n/g, " ")
  }

  // Extract subtitle
  const subMatch = text.match(/"subtitle"\s*:\s*"((?:[^"\\]|\\.)*)"/i) || text.match(/"subtitle"\s*:\s*"([^"\n]+)/i)
  if (subMatch) {
    result.subtitle = subMatch[1].replace(/\\"/g, '"').replace(/\\n/g, " ")
  }

  // Extract content
  const contentMatch = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/) || text.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"(?:faq|myths|slug|meta_title)|"$)/i)
  if (contentMatch) {
    result.content = contentMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"')
  }

  // If no content key found, use raw text as content fallback
  if (!result.content && text) {
    result.content = text
      .replace(/^```(?:json|markdown)?/i, "")
      .replace(/```$/, "")
      .trim()
  }

  return result
}

export function extractAndParseJSON<T = any>(rawText: string): T {
  if (!rawText || typeof rawText !== "string") {
    return {} as T
  }

  let text = rawText.trim()

  // 1. Strip markdown codeblock wrapper if present
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    text = codeBlockMatch[1].trim()
  }

  // 2. Find outermost JSON object or array braces
  const firstBrace = text.search(/[\{\[]/)
  if (firstBrace !== -1) {
    const isArray = text[firstBrace] === "["
    const lastBrace = isArray ? text.lastIndexOf("]") : text.lastIndexOf("}")
    if (lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1)
    } else {
      text = text.substring(firstBrace)
    }
  }

  // 3. Stage 1: Standard JSON.parse
  try {
    return JSON.parse(text)
  } catch (err1) {}

  // 4. Stage 2: Sanitize control characters & literal newlines inside string literals
  try {
    const sanitized = sanitizeJSONString(text)
    return JSON.parse(sanitized)
  } catch (err2) {}

  // 5. Stage 3: Repair truncated JSON
  try {
    const repaired = repairTruncatedJSON(text)
    const sanitizedRepaired = sanitizeJSONString(repaired)
    return JSON.parse(sanitizedRepaired)
  } catch (err3) {}

  // 6. Stage 4: Try repair directly on original text
  try {
    const repairedOriginal = repairTruncatedJSON(rawText)
    const sanitizedRepaired = sanitizeJSONString(repairedOriginal)
    return JSON.parse(sanitizedRepaired)
  } catch (err4) {}

  // 7. Stage 5: Regex extraction fallback
  const fallback = fallbackExtractJSONFields(rawText)
  if (fallback.title || fallback.content) {
    return fallback as T
  }

  throw new Error("Unable to parse or salvage JSON output")
}
