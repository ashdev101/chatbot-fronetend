/**
 * Modular Markdown Renderer
 * 
 * A lightweight, reusable markdown parser that converts markdown text to HTML.
 * Supports common markdown features: headers, bold, italic, code, lists, links, etc.
 * 
 * Usage:
 *   import { renderMarkdown } from './utils/markdown.js';
 *   const html = renderMarkdown(markdownText);
 * 
 * @module markdown
 */

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Processes inline code blocks (backticks)
 * @param {string} text - Text containing inline code
 * @returns {string} Text with code wrapped in <code> tags
 */
function processInlineCode(text) {
  return text.replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
 * Processes code blocks (triple backticks)
 * @param {string} text - Text containing code blocks
 * @returns {string} Text with code blocks wrapped in <pre><code> tags
 */
function processCodeBlocks(text) {
  return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const escapedCode = escapeHtml(code.trim());
    return `<pre><code${lang ? ` class="language-${lang}"` : ''}>${escapedCode}</code></pre>`;
  });
}

/**
 * Processes links [text](url)
 * @param {string} text - Text containing markdown links
 * @returns {string} Text with links converted to <a> tags
 */
function processLinks(text) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

/**
 * Processes bold text **text** or __text__
 * @param {string} text - Text containing bold markers
 * @returns {string} Text with bold wrapped in <strong> tags
 */
function processBold(text) {
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  return text;
}

/**
 * Processes italic text *text* or _text_
 * @param {string} text - Text containing italic markers
 * @returns {string} Text with italic wrapped in <em> tags
 */
function processItalic(text) {
  text = text.replace(/\*([^*\n]+?)\*/g, (match, content, offset, string) => {
    const before = offset > 0 ? string[offset - 1] : '';
    const after = offset + match.length < string.length ? string[offset + match.length] : '';
    
    if (before === '*' || after === '*' || (match.includes('<') && match.includes('>'))) {
      return match;
    }
    
    return `<em>${content}</em>`;
  });
  
  text = text.replace(/_([^_\n]+?)_/g, (match, content, offset, string) => {
    const before = offset > 0 ? string[offset - 1] : '';
    const after = offset + match.length < string.length ? string[offset + match.length] : '';
    
    if (before === '_' || after === '_' || (match.includes('<') && match.includes('>'))) {
      return match;
    }
    
    return `<em>${content}</em>`;
  });
  
  return text;
}

/**
 * Processes headers (# Header)
 * @param {string} text - Text containing headers
 * @returns {string} Text with headers converted to <h1>-<h6> tags
 */
function processHeaders(text) {
  return text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    const escapedContent = escapeHtml(content.trim());
    return `<h${level}>${escapedContent}</h${level}>`;
  });
}

/**
 * Processes unordered lists (- item or * item)
 * @param {string} text - Text containing list items
 * @returns {string} Text with lists converted to <ul><li> tags
 */
function processUnorderedLists(text) {
  const lines = text.split('\n');
  const result = [];
  let inList = false;
  let listItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const listMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);

    if (listMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(listMatch[1].trim());
    } else {
      if (inList) {
        result.push('<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>');
        listItems = [];
        inList = false;
      }
      result.push(line);
    }
  }

  if (inList) {
    result.push('<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>');
  }

  return result.join('\n');
}

/**
 * Processes ordered lists (1. item)
 * @param {string} text - Text containing ordered list items
 * @returns {string} Text with lists converted to <ol><li> tags
 */
function processOrderedLists(text) {
  const lines = text.split('\n');
  const result = [];
  let inList = false;
  let listItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const listMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);

    if (listMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(listMatch[1].trim());
    } else {
      if (inList) {
        result.push('<ol>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ol>');
        listItems = [];
        inList = false;
      }
      result.push(line);
    }
  }

  if (inList) {
    result.push('<ol>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ol>');
  }

  return result.join('\n');
}

/**
 * Processes horizontal rules (---)
 * @param {string} text - Text containing horizontal rules
 * @returns {string} Text with rules converted to <hr> tags
 */
function processHorizontalRules(text) {
  return text.replace(/^---$/gm, '<hr>');
}

/**
 * Processes line breaks (double newline becomes paragraph)
 * @param {string} text - Text to process
 * @returns {string} Text with paragraphs wrapped in <p> tags
 */
function processParagraphs(text) {
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';
    
    if (trimmed.match(/^<(h[1-6]|ul|ol|pre|hr)/)) {
      return trimmed;
    }
    
    const withBreaks = trimmed.replace(/\n/g, '<br>');
    return `<p>${withBreaks}</p>`;
  }).filter(p => p).join('');
}

function fixSemicolonsToCommas(text) {
  return text
    .replace(/;(\s+and\s)/gi, ',$1')
    .replace(/;(\s+or\s)/gi, ',$1')
    .replace(/(\w+);(\s+[a-z][a-z\s]{2,})/g, '$1,$2')
    .replace(/(\d+)\s*;\s*([a-z])/g, '$1, $2')
    .replace(/([a-z])\s*;\s*([a-z])/gi, '$1, $2');
}

/**
 * Main function to render markdown text to HTML
 * @param {string} markdown - Markdown text to render
 * @returns {string} HTML string
 */
export function renderMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  let html = markdown;

  html = processCodeBlocks(html);
  html = processHeaders(html);
  html = processHorizontalRules(html);
  html = processOrderedLists(html);
  html = processUnorderedLists(html);
  html = processLinks(html);
  html = processItalic(html);
  html = processBold(html);
  html = processInlineCode(html);
  html = fixSemicolonsToCommas(html);
  html = processParagraphs(html);

  return html.trim();
}

